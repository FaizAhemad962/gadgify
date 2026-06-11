export const appIconSizes = {
  xxs: 12,
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  section: 28,
  card: 32,
  category: 36,
  feature: 40,
  empty: 64,
  hero: 96,
  notFound: 100,
} as const;

export const appIconSx = {
  xxs: { fontSize: `${appIconSizes.xxs}px` },
  xs: { fontSize: `${appIconSizes.xs}px` },
  sm: { fontSize: `${appIconSizes.sm}px` },
  md: { fontSize: `${appIconSizes.md}px` },
  lg: { fontSize: `${appIconSizes.lg}px` },
  xl: { fontSize: `${appIconSizes.xl}px` },
  section: { fontSize: `${appIconSizes.section}px` },
  card: { fontSize: `${appIconSizes.card}px` },
  category: { fontSize: `${appIconSizes.category}px` },
  feature: { fontSize: `${appIconSizes.feature}px` },
  empty: { fontSize: `${appIconSizes.empty}px` },
  hero: { fontSize: `${appIconSizes.hero}px` },
  notFound: { fontSize: `${appIconSizes.notFound}px` },
} as const;

export const responsiveFeatureIconSx = {
  fontSize: {
    xs: appIconSx.card.fontSize,
    md: appIconSx.feature.fontSize,
  },
} as const;

export const navIconSizes = {
  link: 20,
  action: 22,
  drawer: 22,
  menu: 20,
  mobileTrigger: 24,
} as const;

export const navLinkIconSx = {
  fontSize: `${navIconSizes.link}px`,
} as const;

export const navActionIconSx = {
  fontSize: `${navIconSizes.action}px`,
} as const;

export const navDrawerIconSx = {
  fontSize: `${navIconSizes.drawer}px`,
} as const;

export const navMenuIconSx = {
  fontSize: `${navIconSizes.menu}px`,
} as const;
