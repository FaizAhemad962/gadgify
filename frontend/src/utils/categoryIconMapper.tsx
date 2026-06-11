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
} from "@/mui/icons";
import { appIconSx } from "@/components/ui/navigationStyles";

// Map category names to MUI icons
const iconMap: Record<string, React.ReactNode> = {
  "Mobiles & Computers": <Smartphone sx={appIconSx.category} />,
  "Electronics & Appliances": <Tv sx={appIconSx.category} />,
  "Men's Fashion": <Checkroom sx={appIconSx.category} />,
  "Women's Fashion": <ShoppingBag sx={appIconSx.category} />,
  "Home & Kitchen": <Kitchen sx={appIconSx.category} />,
  "Beauty & Health": <Spa sx={appIconSx.category} />,
  "Sports & Fitness": <FitnessCenter sx={appIconSx.category} />,
  "Toys & Baby Products": <SmartToy sx={appIconSx.category} />,
  "Automotive & Industrial": <DirectionsCar sx={appIconSx.category} />,
  "Books & Stationery": <MenuBook sx={appIconSx.category} />,
  "Movies, Music & Gaming": <SportsEsports sx={appIconSx.category} />,
  "Doors & Hardware": <Construction sx={appIconSx.category} />,
  // Fallback for any unmapped categories
  default: <FavoriteBorder sx={appIconSx.category} />,
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
