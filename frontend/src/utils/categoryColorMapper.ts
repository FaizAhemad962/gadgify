import { tokens } from "@/theme/theme";

// Map category names to colors
const categoryColorMap: Record<string, string> = {
  "Mobiles & Computers": tokens.primary,
  "Electronics & Appliances": tokens.accent,
  "Men's Fashion": tokens.secondary,
  "Women's Fashion": tokens.success,
  "Home & Kitchen": tokens.warning,
  "Beauty & Health": tokens.error,
  "Sports & Fitness": tokens.primaryLight,
  "Toys & Baby Products": tokens.accentDark,
  "Automotive & Industrial": tokens.secondaryDark,
  "Books & Stationery": tokens.secondaryLight,
  "Movies, Music & Gaming": tokens.primaryDark,
  "Doors & Hardware": tokens.accentLight,
};

const colors = [
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

export const getCategoryColor = (
  categoryName: string,
  index?: number,
): string => {
  // Try to get color from map first
  if (categoryColorMap[categoryName]) {
    return categoryColorMap[categoryName];
  }
  // Fall back to color array with index
  if (index !== undefined) {
    return colors[index % colors.length];
  }
  // Default color
  return tokens.primary;
};
