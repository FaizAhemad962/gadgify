import React from "react";
import {
  Smartphone,
  Tv,
  Checkroom,
  ShoppingBag,
  Kitchen,
  Spa,
  FitnessCenter,
  SmartToy,
  DirectionsCar,
  MenuBook,
  SportsEsports,
  Construction,
  FavoriteBorder,
} from "@mui/icons-material";

// Map category names to MUI icons
const iconMap: Record<string, React.ReactNode> = {
  "Mobiles & Computers": <Smartphone sx={{ fontSize: 36 }} />,
  "Electronics & Appliances": <Tv sx={{ fontSize: 36 }} />,
  "Men's Fashion": <Checkroom sx={{ fontSize: 36 }} />,
  "Women's Fashion": <ShoppingBag sx={{ fontSize: 36 }} />,
  "Home & Kitchen": <Kitchen sx={{ fontSize: 36 }} />,
  "Beauty & Health": <Spa sx={{ fontSize: 36 }} />,
  "Sports & Fitness": <FitnessCenter sx={{ fontSize: 36 }} />,
  "Toys & Baby Products": <SmartToy sx={{ fontSize: 36 }} />,
  "Automotive & Industrial": <DirectionsCar sx={{ fontSize: 36 }} />,
  "Books & Stationery": <MenuBook sx={{ fontSize: 36 }} />,
  "Movies, Music & Gaming": <SportsEsports sx={{ fontSize: 36 }} />,
  "Doors & Hardware": <Construction sx={{ fontSize: 36 }} />,
  // Fallback for any unmapped categories
  default: <FavoriteBorder sx={{ fontSize: 36 }} />,
};

export const getCategoryIcon = (categoryName: string): React.ReactNode => {
  return iconMap[categoryName] || iconMap.default;
};

export const getIconString = (categoryName: string): string => {
  // This could be used if storing icon names as strings in the database
  const iconMap: Record<string, string> = {
    "Mobiles & Computers": "Smartphone",
    "Electronics & Appliances": "Tv",
    "Men's Fashion": "Checkroom",
    "Women's Fashion": "ShoppingBag",
    "Home & Kitchen": "Kitchen",
    "Beauty & Health": "Spa",
    "Sports & Fitness": "FitnessCenter",
    "Toys & Baby Products": "SmartToy",
    "Automotive & Industrial": "DirectionsCar",
    "Books & Stationery": "MenuBook",
    "Movies, Music & Gaming": "SportsEsports",
    "Doors & Hardware": "Construction",
  };
  return iconMap[categoryName] || "FavoriteBorder";
};
