// frontend/src/utils/strings.js
export const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const toTitleCase = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const camelToTitle = (str) => {
  if (!str) return ''
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim()
}

export const snakeToTitle = (str) => {
  if (!str) return ''
  return str
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

export const kebabToTitle = (str) => {
  if (!str) return ''
  return str
    .split('-')
    .map(word => capitalizeFirst(word))
    .join(' ')
}

export const truncate = (str, maxLength, suffix = '...') => {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength) + suffix
}

export const ellipsis = (str, maxLength) => {
  return truncate(str, maxLength, '…')
}

export const stripHtml = (html) => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

export const escapeHtml = (text) => {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export const unescapeHtml = (text) => {
  if (!text) return ''
  const div = document.createElement('div')
  div.innerHTML = text
  return div.textContent || ''
}

export const slugify = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const unslugify = (slug) => {
  if (!slug) return ''
  return slug.replace(/-/g, ' ')
}

export const pluralize = (count, singular, plural = null) => {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural || singular + 's'}`
}

export const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  
  return password
}

export const maskString = (str, visibleChars = 4) => {
  if (!str) return ''
  if (str.length <= visibleChars * 2) return '*'.repeat(str.length)
  
  const firstPart = str.substring(0, visibleChars)
  const lastPart = str.substring(str.length - visibleChars)
  const middle = '*'.repeat(str.length - visibleChars * 2)
  
  return firstPart + middle + lastPart
}

export const extractEmails = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  return text.match(emailRegex) || []
}

export const extractUrls = (text) => {
  const urlRegex = /https?:\/\/[^\s]+/g
  return text.match(urlRegex) || []
}

export const countWords = (text) => {
  if (!text) return 0
  return text.trim().split(/\s+/).length
}

export const countCharacters = (text) => {
  if (!text) return 0
  return text.length
}

export const countLines = (text) => {
  if (!text) return 0
  return (text.match(/\n/g) || []).length + 1
}

export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
  }
  
  if (cleaned.length === 11) {
    return `+${cleaned.charAt(0)} (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`
  }
  
  return phone
}

export const formatCreditCard = (number) => {
  const cleaned = number.replace(/\D/g, '')
  
  if (cleaned.length === 16) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8, 12)} ${cleaned.substring(12)}`
  }
  
  return number
}