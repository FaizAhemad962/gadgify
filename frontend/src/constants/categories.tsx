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
} from "@mui/icons-material";
import { tokens } from "@/theme/theme";

export const CATEGORIES = [
  "Mobiles & Computers",
  "Electronics & Appliances",
  "Men's Fashion",
  "Women's Fashion",
  "Home & Kitchen",
  "Beauty & Health",
  "Sports & Fitness",
  "Toys & Baby Products",
  "Automotive & Industrial",
  "Books & Stationery",
  "Movies, Music & Gaming",
  "Doors & Hardware",
] as const;

export type Category = (typeof CATEGORIES)[number];

// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
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
};

// eslint-disable-next-line react-refresh/only-export-components
export const CATEGORY_COLORS = [
  tokens.primary,
  tokens.accent,
  tokens.secondary,
  tokens.success,
  tokens.warning,
  tokens.error,
  tokens.primaryLight,
  tokens.accentDark,
  tokens.secondaryDark,
  tokens.secondaryLight,
  tokens.primaryDark,
  tokens.accentLight,
];
