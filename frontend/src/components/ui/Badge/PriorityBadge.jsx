// frontend/src/components/ui/Badge/PriorityBadge.jsx
import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import Badge from './Badge'

const PriorityBadge = ({ priority = 'medium' }) => {
  const priorityConfig = {
    low: {
      label: 'Low',
      icon: CheckCircle,
      variant: 'success',
      color: 'text-green-600',
    },
    medium: {
      label: 'Medium',
      icon: Info,
      variant: 'info',
      color: 'text-blue-600',
    },
    high: {
      label: 'High',
      icon: AlertTriangle,
      variant: 'warning',
      color: 'text-yellow-600',
    },
    critical: {
      label: 'Critical',
      icon: AlertCircle,
      variant: 'danger',
      color: 'text-red-600',
    },
  }

  const config = priorityConfig[priority] || priorityConfig.medium
  const Icon = config.icon

  return (
    <Badge variant={config.variant}>
      <Icon className={`h-3 w-3 mr-1 ${config.color}`} />
      {config.label}
    </Badge>
  )
}

export default PriorityBadge