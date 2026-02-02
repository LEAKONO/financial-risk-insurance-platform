// frontend/src/utils/dates.js
export const formatDate = (date, format = 'medium') => {
  if (!date) return ''
  
  const d = new Date(date)
  
  if (isNaN(d.getTime())) return ''
  
  const formats = {
    short: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    medium: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }),
    long: new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }),
    dateOnly: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    timeOnly: new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    relative: (date) => {
      const now = new Date()
      const diff = now - d
      const diffMinutes = Math.floor(diff / 60000)
      const diffHours = Math.floor(diff / 3600000)
      const diffDays = Math.floor(diff / 86400000)
      
      if (diffMinutes < 1) return 'Just now'
      if (diffMinutes < 60) return `${diffMinutes}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return formatDate(date, 'short')
    },
  }
  
  if (format === 'relative') {
    return formats.relative(date)
  }
  
  return formats[format]?.format(d) || d.toLocaleDateString()
}

export const formatTimeAgo = (date) => {
  return formatDate(date, 'relative')
}

export const getAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export const isValidDate = (dateString) => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diff = end.getTime() - start.getTime()
  return Math.ceil(diff / (1000 * 3600 * 24))
}

export const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addMonths = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export const getMonthYear = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export const getWeekRange = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  const sunday = new Date(d.setDate(diff + 6))
  
  return {
    start: formatDate(monday, 'dateOnly'),
    end: formatDate(sunday, 'dateOnly'),
  }
}

export const isDateInPast = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate < today
}

export const isDateInFuture = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate > today
}