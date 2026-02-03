// frontend/src/components/ui/Badge/StatusBadge.jsx
import React from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, PauseCircle, PlayCircle } from 'lucide-react'
import Badge from './Badge'

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      label: 'Active',
      icon: CheckCircle,
      variant: 'success',
    },
    inactive: {
      label: 'Inactive',
      icon: XCircle,
      variant: 'danger',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      variant: 'warning',
    },
    review: {
      label: 'Under Review',
      icon: AlertCircle,
      variant: 'info',
    },
    paused: {
      label: 'Paused',
      icon: PauseCircle,
      variant: 'warning',
    },
    processing: {
      label: 'Processing',
      icon: PlayCircle,
      variant: 'info',
    },
  }

  const config = statusConfig[status] || statusConfig.pending
  const Icon = config.icon

  return (
    <Badge variant={config.variant}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

export { StatusBadge }
export default StatusBadge