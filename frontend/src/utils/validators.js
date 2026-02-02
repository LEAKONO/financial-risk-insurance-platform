// frontend/src/utils/validators.js
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10
}

export const validatePassword = (password) => {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateURL = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateCreditCard = (number) => {
  // Luhn algorithm
  let sum = 0
  let isEven = false
  const cleaned = number.replace(/\D/g, '')
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10)
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

export const validateDate = (dateString) => {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export const validateAge = (dateString, minAge = 18) => {
  const birthDate = new Date(dateString)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age >= minAge
}

export const validateFile = (file, options = {}) => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options
  const errors = []
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`)
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateNotEmpty = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

export const validateNumber = (value, options = {}) => {
  const { min, max, integer = false } = options
  const num = parseFloat(value)
  
  if (isNaN(num)) return false
  if (integer && !Number.isInteger(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  
  return true
}

export const validateRange = (value, min, max) => {
  const num = parseFloat(value)
  return !isNaN(num) && num >= min && num <= max
}

export const validateLength = (value, options = {}) => {
  const { min, max } = options
  const length = value?.length || 0
  
  if (min !== undefined && length < min) return false
  if (max !== undefined && length > max) return false
  
  return true
}

export const validatePattern = (value, pattern) => {
  const regex = new RegExp(pattern)
  return regex.test(value)
}

export const validateObject = (obj, schema) => {
  const errors = {}
  
  Object.entries(schema).forEach(([key, validator]) => {
    const value = obj[key]
    const result = validator(value, obj)
    
    if (result !== true) {
      errors[key] = result
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateForm = (formData, validations) => {
  const errors = {}
  
  Object.entries(validations).forEach(([field, validation]) => {
    const value = formData[field]
    
    if (validation.required && !validateNotEmpty(value)) {
      errors[field] = 'This field is required'
    } else if (validation.email && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address'
    } else if (validation.minLength && !validateLength(value, { min: validation.minLength })) {
      errors[field] = `Minimum length is ${validation.minLength} characters`
    } else if (validation.maxLength && !validateLength(value, { max: validation.maxLength })) {
      errors[field] = `Maximum length is ${validation.maxLength} characters`
    } else if (validation.pattern && !validatePattern(value, validation.pattern)) {
      errors[field] = validation.patternMessage || 'Invalid format'
    } else if (validation.custom) {
      const customError = validation.custom(value, formData)
      if (customError) {
        errors[field] = customError
      }
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}