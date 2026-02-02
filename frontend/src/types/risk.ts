// frontend/src/types/risk.ts
export interface RiskFactor {
  category: 'occupation' | 'health' | 'lifestyle' | 'financial' | 'geographic'
  factor: string
  level: 'low' | 'medium' | 'high' | 'very-high'
  multiplier: number
  description?: string
}

export interface RiskProfile {
  _id: string
  user: string | User
  age: number
  occupation: string
  annualIncome: number
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'retired' | 'student'
  hasChronicIllness: boolean
  smoker: boolean
  bmi?: number
  hasDangerousHobbies: boolean
  hobbies?: string[]
  creditScore?: number
  hasBankruptcyHistory: boolean
  location?: {
    country?: string
    city?: string
    riskZone: 'low' | 'medium' | 'high'
  }
  riskFactors: RiskFactor[]
  overallRiskScore: number
  riskCategory: 'low' | 'moderate' | 'high' | 'very-high'
  basePremiumMultiplier: number
  lastUpdated: Date
  isComplete: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RiskProfileCreate {
  age: number
  occupation: string
  annualIncome: number
  employmentStatus: string
  hasChronicIllness?: boolean
  smoker?: boolean
  bmi?: number
  hasDangerousHobbies?: boolean
  hobbies?: string[]
  creditScore?: number
  hasBankruptcyHistory?: boolean
  location?: {
    country?: string
    city?: string
    riskZone?: 'low' | 'medium' | 'high'
  }
}

export interface PremiumCalculation {
  policyType: string
  coverageAmount: number
  termLength?: number
  premiumFrequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
}

export interface RiskAnalysis {
  profile: {
    score: number
    category: string
    multiplier: number
    completeness: boolean
  }
  categories: Record<string, any>
  factors: Record<string, RiskFactor[]>
  recommendations: Array<{
    category: string
    recommendation: string
    impact: string
  }>
  lastUpdated: Date
}