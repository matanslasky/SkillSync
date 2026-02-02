import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Enhanced Button component with animations and variants
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 btn-hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
  
  const variants = {
    primary: 'bg-neon-green text-dark hover:bg-neon-green/90 shadow-neon-green focus:ring-neon-green',
    secondary: 'bg-neon-blue text-dark hover:bg-neon-blue/90 shadow-neon-blue focus:ring-neon-blue',
    danger: 'bg-neon-pink text-white hover:bg-neon-pink/90 shadow-neon-pink focus:ring-neon-pink',
    outline: 'bg-transparent border-2 border-neon-green text-neon-green hover:bg-neon-green hover:text-dark focus:ring-neon-green',
    ghost: 'bg-transparent text-gray-400 hover:bg-dark-lighter hover:text-white',
    glass: 'glass-effect text-white hover:border-neon-green/30',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  }
  
  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `
  
  const isDisabled = disabled || isLoading
  
  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
      
      {!isLoading && Icon && iconPosition === 'left' && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
      
      {children}
      
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
