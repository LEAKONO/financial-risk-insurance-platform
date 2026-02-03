// frontend/src/components/ui/Form/DatePicker.jsx
import React from 'react'
import { Calendar } from 'lucide-react'

const DatePicker = ({
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="date"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          disabled={disabled}
          className={`
            w-full pl-10 pr-4 py-3 rounded-xl border
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}
            focus:ring-2 focus:outline-none transition-all
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export { DatePicker }
export default DatePicker