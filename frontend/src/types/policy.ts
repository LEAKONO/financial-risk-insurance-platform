// frontend/src/types/policy.ts
export interface Coverage {
  type: 'life' | 'health' | 'disability' | 'property' | 'liability' | 'auto'
  coverageAmount: number
  deductible?: number
  maxLimit?: number
  description?: string
}

export interface PremiumSchedule {
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
  amount: number
  dueDate: Date
  paid: boolean
  paidDate?: Date
  paymentMethod?: string
  transactionId?: string
}

export interface Policy {
  _id: string
  policyNumber: string
  user: string | User
  riskProfile: string | RiskProfile
  name: string
  description?: string
  coverage: Coverage[]
  basePremium: number
  totalPremium: number
  premiumSchedule: PremiumSchedule[]
  startDate: Date
  endDate?: Date
  termLength: number
  status: 'draft' | 'active' | 'expired' | 'cancelled' | 'lapsed'
  riskMultiplier: number
  totalClaims: number
  totalClaimAmount: number
  underwrittenBy?: string | User
  underwrittenDate?: Date
  isAutoRenewable: boolean
  renewalDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PolicyCreate {
  name?: string
  description?: string
  coverage: Coverage[]
  policyType: string
  coverageAmount: number
  termLength?: number
  premiumFrequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
}

export interface PolicyUpdate {
  name?: string
  description?: string
  isAutoRenewable?: boolean
}

export interface PolicyCancel {
  reason?: string
}

export interface PolicyRenew {
  termLength?: number
}