import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Extract query parameters for filtering and sorting
    const {
      search = "",
      minPrice = 0,
      maxPrice = 100000,
      minRating = 0,
      category = "",
      sortBy = "popularity",
      page = 1,
      limit = 12,
    } = req.query;

    const pageLimit = parseInt(limit as string);
    const minRatingNum = parseInt(minRating as string);

    // Build where clause for filtering
    const whereClause: any = {
      deletedAt: null,
      price: {
        gte: parseInt(minPrice as string),
        lte: parseInt(maxPrice as string),
      },
    };

    // Add search filter if provided - use AND with other filters
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search as string, mode: "insensitive" } },
            {
              description: { contains: search as string, mode: "insensitive" },
            },
            { category: { contains: search as string, mode: "insensitive" } },
          ],
        },
      ];
    }

    // Add category filter if provided (supports comma-separated for multi-select)
    if (category) {
      const categoryStr = category as string;
      const categoryList = categoryStr.includes(",")
        ? categoryStr
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : null;

      if (categoryList && categoryList.length > 1) {
        // Multiple categories: use OR with contains for each
        const categoryCondition = {
          OR: categoryList.map((c) => ({
            category: { contains: c, mode: "insensitive" as const },
          })),
        };
        if (whereClause.AND) {
          whereClause.AND.push(categoryCondition);
        } else {
          whereClause.AND = [categoryCondition];
        }
      } else if (whereClause.AND) {
        whereClause.AND.push({
          category: { contains: categoryStr, mode: "insensitive" },
        });
      } else {
        whereClause.category = {
          contains: categoryStr,
          mode: "insensitive",
        };
      }
    }

    // Fetch all matching products (we'll paginate after filtering)
    // If rating filter is applied, fetch extra to account for filtering
    const fetchMultiplier = minRatingNum > 0 ? 3 : 1; // Fetch 3x more if rating filter
    const allProducts = await prisma.product.findMany({
      where: whereClause,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            comment: true,
            user: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        media: true,
      },
    });

    // Calculate average rating for all products and filter by minimum rating
    let productsWithRatings = (allProducts as any[]).map((product) => {
      const ratings = product.ratings;
      const averageRating =
        ratings.length > 0
          ? ratings.reduce(
              (sum: number, r: { rating: number }) => sum + r.rating,
              0,
            ) / ratings.length
          : 0;
      const totalRatings = ratings.length;
      const topRating = ratings.length > 0 ? ratings[0] : null;

      const { ratings: _, ...productData } = product;
      return {
        ...productData,
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings,
        topRating,
      };
    });

    // Filter by minimum rating
    if (minRatingNum > 0) {
      productsWithRatings = productsWithRatings.filter(
        (p) => p.averageRating >= minRatingNum,
      );
    }

    // Sort products based on sortBy parameter
    productsWithRatings.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.averageRating - a.averageRating;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popularity":
        default:
          // Sort by total ratings as a proxy for popularity
          return b.totalRatings - a.totalRatings;
      }
    });

    // Apply pagination after filtering
    const pageNum = parseInt(page as string) || 1;
    const skip = (pageNum - 1) * pageLimit;
    const paginatedProducts = productsWithRatings.slice(skip, skip + pageLimit);
    const total = productsWithRatings.length;

    res.json({
      products: paginatedProducts,
      total,
      page: pageNum,
      limit: pageLimit,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null } as any,
      include: { media: true },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      stock,
      media,
      colors,
      category,
      hsnNo,
      gstPercentage,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        colors,
        category,
        hsnNo,
        gstPercentage,
      },
    });

    // Create media records if provided
    if (media && Array.isArray(media)) {
      await Promise.all(
        media.map((m: any) =>
          prisma.productMedia.create({
            data: {
              url: m.url,
              type: m.type,
              isPrimary: !!m.isPrimary,
              productId: product.id,
            },
          }),
        ),
      );
    }

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      media,
      colors,
      category,
      hsnNo,
      gstPercentage,
    } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        colors,
        category,
        hsnNo,
        gstPercentage,
      },
    });

    // Remove old media and add new
    if (media && Array.isArray(media)) {
      await prisma.productMedia.deleteMany({ where: { productId: id } });
      await Promise.all(
        media.map((m: any) =>
          prisma.productMedia.create({
            data: {
              url: m.url,
              type: m.type,
              isPrimary: !!m.isPrimary,
              productId: id,
            },
          }),
        ),
      );
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() } as any,
    });
    res.status(200).json({ message: "Product archived" });
  } catch (error) {
    next(error);
  }
};

export const getProductSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const q = ((req.query.q as string) || "").trim();
    if (q.length < 2) {
      res.json({ success: true, data: [] });
      return;
    }

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { category: { contains: q, mode: "insensitive" as const } },
        ],
      } as any,
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        media: {
          where: { isPrimary: true },
          select: { url: true },
          take: 1,
        },
      },
      take: 8,
      orderBy: { name: "asc" },
    });

    const suggestions = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      image: p.media?.[0]?.url || null,
    }));

    res.json({ success: true, data: suggestions });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { q } = req.query;
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q as string } },
          { description: { contains: q as string } },
          { category: { contains: q as string } },
        ],
      } as any,
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getAllProductsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const search = (req.query.search as string) || "";

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null, ...(searchFilter as any) } as any,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          ratings: {
            select: {
              rating: true,
            },
          },
          media: true,
        },
      }),
      prisma.product.count({
        where: { deletedAt: null, ...(searchFilter as any) } as any,
      }),
    ]);

    // Calculate average rating for each product
    const productsWithRatings = (products as any[]).map((product) => {
      const ratings = product.ratings;
      const averageRating =
        ratings.length > 0
          ? ratings.reduce(
              (sum: number, r: { rating: number }) => sum + r.rating,
              0,
            ) / ratings.length
          : 0;
      const totalRatings = ratings.length;

      const { ratings: _, ...productData } = product;
      return {
        ...productData,
        averageRating: Number(averageRating.toFixed(1)),
        totalRatings,
      };
    });

    res.json({
      products: productsWithRatings,
      total,
    });
  } catch (error) {
    next(error);
  }
};
