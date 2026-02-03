// frontend/src/components/ui/Button/ButtonGroup.jsx
import React from 'react'

const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-xl overflow-hidden border border-gray-300 ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!child) return null
        
        return React.cloneElement(child, {
          className: `
            ${child.props.className || ''}
            rounded-none
            ${index === 0 ? 'rounded-l-xl' : ''}
            ${index === React.Children.count(children) - 1 ? 'rounded-r-xl' : ''}
            ${index > 0 ? 'border-l border-gray-300' : ''}
          `
        })
      })}
    </div>
  )
}

export { ButtonGroup }
export default ButtonGroup