// frontend/src/utils/charts.js
export const generateChartData = (data, options = {}) => {
  const {
    type = 'line',
    labels,
    datasets,
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  } = options

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: {
          family: "'Inter', sans-serif",
          size: 12,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 11,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
        },
      },
    },
  }

  const chartData = {
    labels: labels || [],
    datasets: datasets || [],
  }

  return {
    data: chartData,
    options: { ...defaultOptions, ...options.customOptions },
  }
}

export const getGradient = (ctx, color, opacity = 0.2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, `${color}${Math.round(opacity * 255).toString(16)}`)
  gradient.addColorStop(1, `${color}00`)
  return gradient
}

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`
}

export const getRiskColor = (score) => {
  if (score < 25) return '#10b981' // green
  if (score < 50) return '#84cc16' // lime
  if (score < 75) return '#f59e0b' // yellow
  if (score < 90) return '#ef4444' // red
  return '#7c2d12' // very high risk
}

export const getStatusColor = (status) => {
  const colors = {
    active: '#10b981',
    approved: '#10b981',
    pending: '#f59e0b',
    submitted: '#3b82f6',
    'under-review': '#8b5cf6',
    rejected: '#ef4444',
    cancelled: '#6b7280',
    expired: '#6b7280',
  }
  return colors[status] || '#6b7280'
}