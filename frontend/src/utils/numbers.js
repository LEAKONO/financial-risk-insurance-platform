// frontend/src/utils/numbers.js
export const formatNumberWithCommas = (number) => {
  return new Intl.NumberFormat('en-US').format(number)
}

export const formatLargeNumber = (number) => {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`
  }
  return number.toString()
}

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0
  return (value / total) * 100
}

export const round = (number, decimals = 2) => {
  const factor = Math.pow(10, decimals)
  return Math.round(number * factor) / factor
}

export const clamp = (number, min, max) => {
  return Math.min(Math.max(number, min), max)
}

export const lerp = (start, end, amount) => {
  return start + (end - start) * amount
}

export const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min
}

export const sum = (numbers) => {
  return numbers.reduce((total, num) => total + num, 0)
}

export const average = (numbers) => {
  if (numbers.length === 0) return 0
  return sum(numbers) / numbers.length
}

export const median = (numbers) => {
  const sorted = [...numbers].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }
  
  return sorted[middle]
}

export const mode = (numbers) => {
  const frequency = {}
  let maxFrequency = 0
  let modes = []
  
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1
    
    if (frequency[num] > maxFrequency) {
      maxFrequency = frequency[num]
      modes = [num]
    } else if (frequency[num] === maxFrequency) {
      modes.push(num)
    }
  })
  
  return modes
}

export const standardDeviation = (numbers) => {
  const avg = average(numbers)
  const squareDiffs = numbers.map(num => Math.pow(num - avg, 2))
  return Math.sqrt(average(squareDiffs))
}

export const formatRange = (min, max) => {
  if (min === max) return formatNumber(min)
  return `${formatNumber(min)} - ${formatNumber(max)}`
}

export const isEven = (number) => {
  return number % 2 === 0
}

export const isOdd = (number) => {
  return number % 2 !== 0
}

export const isPrime = (number) => {
  if (number <= 1) return false
  if (number <= 3) return true
  if (number % 2 === 0 || number % 3 === 0) return false
  
  let i = 5
  while (i * i <= number) {
    if (number % i === 0 || number % (i + 2) === 0) return false
    i += 6
  }
  
  return true
}

export const factorial = (number) => {
  if (number < 0) return null
  if (number <= 1) return 1
  
  let result = 1
  for (let i = 2; i <= number; i++) {
    result *= i
  }
  
  return result
}

export const fibonacci = (n) => {
  if (n <= 0) return []
  if (n === 1) return [0]
  
  const sequence = [0, 1]
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2])
  }
  
  return sequence.slice(0, n)
}