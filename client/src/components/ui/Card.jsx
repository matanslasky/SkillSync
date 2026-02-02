import { forwardRef } from 'react'

/**
 * Enhanced Card component with animations and variants
 */
const Card = forwardRef(({
  children,
  variant = 'default',
  hover = true,
  padding = 'md',
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'rounded-xl border transition-all duration-300 animate-fade-in'
  
  const variants = {
    default: 'glass-effect border-gray-800',
    solid: 'bg-dark-card border-gray-800',
    outlined: 'bg-transparent border-2 border-gray-700 hover:border-gray-600',
    elevated: 'bg-dark-card border-gray-800 shadow-card',
    neon: 'glass-effect border-neon-green/30 shadow-neon-green',
  }
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  const hoverClasses = hover && onClick ? 'cursor-pointer card-hover' : ''
  
  const cardClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${paddings[padding]}
    ${hoverClasses}
    ${className}
  `
  
  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// Card Header component
export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
)

// Card Title component
export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-bold text-white ${className}`} {...props}>
    {children}
  </h3>
)

// Card Description component
export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-gray-400 mt-1 ${className}`} {...props}>
    {children}
  </p>
)

// Card Content component
export const CardContent = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
)

// Card Footer component
export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-800 ${className}`} {...props}>
    {children}
  </div>
)

export default Card
