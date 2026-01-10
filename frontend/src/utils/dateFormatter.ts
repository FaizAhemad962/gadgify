/**
 * Format date to "1/Jan/2025" pattern using localized month names
 * @param date - Date string or Date object
 * @param t - i18n translation function
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, t: (key: string) => string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const day = dateObj.getDate()
  const monthIndex = dateObj.getMonth()
  const year = dateObj.getFullYear()
  
  const monthKeys = [
    'months.january',
    'months.february',
    'months.march',
    'months.april',
    'months.may',
    'months.june',
    'months.july',
    'months.august',
    'months.september',
    'months.october',
    'months.november',
    'months.december'
  ]
  
  const monthName = t(monthKeys[monthIndex])
  
  // Return format: 1/Jan/2025 (or 1/जानेवारी/2025 for non-English)
  return `${day}/${monthName}/${year}`
}
