// frontend/src/types/claim.ts
export interface ClaimDocument {
  name: string
  url: string
  type: string
  uploadDate: Date
  verified: boolean
}

export interface StatusHistory {
  status: string
  changedBy: string | User
  changedAt: Date
  notes?: string
}

export interface FraudIndicator {
  indicator: string
  severity: 'low' | 'medium' | 'high'
  description: string
}

export interface Claim {
  _id: string
  claimNumber: string
  policy: string | Policy
  user: string | User
  type: string
  description: string
  incidentDate: Date
  reportDate: Date
  claimedAmount: number
  approvedAmount?: number
  paidAmount?: number
  paymentDate?: Date
  documents: ClaimDocument[]
  status: string
  statusHistory: StatusHistory[]
  assignee?: string | User
  investigationNotes?: string
  fraudIndicators?: FraudIndicator[]
  rejectionReason?: string
  rejectionDate?: Date
  createdBy: string | User
  updatedBy?: string | User
  createdAt: Date
  updatedAt: Date
}

export interface ClaimCreate {
  policy: string
  type: string
  description: string
  incidentDate: string
  claimedAmount: number
  documents?: any[]
}

export interface ClaimUpdateStatus {
  status: string
  notes?: string
  approvedAmount?: number
  rejectionReason?: string
}

export interface ClaimAssign {
  assigneeId: string
}

export interface ClaimStatistics {
  total: number
  approved: number
  rejected: number
  pending: number
  averageAmount: number
  totalClaimed: number
  totalPaid: number
  approvalRate: number
  monthlyTrend: Array<{
    month: string
    count: number
    claimed: number
    paid: number
  }>
}