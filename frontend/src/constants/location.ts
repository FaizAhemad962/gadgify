import i18n from '../i18n/config'

export const getMaharashtraCities = () => [
  { key: 'mumbai', label: i18n.t('cities.mumbai') },
  { key: 'pune', label: i18n.t('cities.pune') },
  { key: 'nagpur', label: i18n.t('cities.nagpur') },
  { key: 'nashik', label: i18n.t('cities.nashik') },
  { key: 'aurangabad', label: i18n.t('cities.aurangabad') },
  { key: 'solapur', label: i18n.t('cities.solapur') },
  { key: 'kolhapur', label: i18n.t('cities.kolhapur') },
  { key: 'thane', label: i18n.t('cities.thane') },
  { key: 'naviMumbai', label: i18n.t('cities.naviMumbai') },
  { key: 'other', label: i18n.t('cities.other') },
]

// Get all city translations for a given key
const getCityTranslations = (key: string) => ({
  en: i18n.t(`cities.${key}`, { lng: 'en' }),
  mr: i18n.t(`cities.${key}`, { lng: 'mr' }),
  hi: i18n.t(`cities.${key}`, { lng: 'hi' }),
})

// Find city key from label in any language
export const findCityKey = (cityLabel: string): string | null => {
  const cityKeys = ['mumbai', 'pune', 'nagpur', 'nashik', 'aurangabad', 'solapur', 'kolhapur', 'thane', 'naviMumbai', 'other']
  
  for (const key of cityKeys) {
    const translations = getCityTranslations(key)
    if (translations.en === cityLabel || translations.mr === cityLabel || translations.hi === cityLabel) {
      return key
    }
  }
  
  return null
}

// Get current language label for a city (accepts label in any language)
export const getCurrentCityLabel = (cityLabel: string): string => {
  const cityKey = findCityKey(cityLabel)
  if (!cityKey) return cityLabel // Return original if not found
  
  return i18n.t(`cities.${cityKey}`)
}
