/**
 * Badge component for status indicators and labels
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200'
  
  const variants = {
    default: 'bg-gray-800 text-gray-300',
    primary: 'bg-neon-green/10 text-neon-green border border-neon-green/30',
    secondary: 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30',
    success: 'bg-neon-green/10 text-neon-green border border-neon-green/30',
    warning: 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30',
    danger: 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30',
    purple: 'bg-neon-purple/10 text-neon-purple border border-neon-purple/30',
    outline: 'bg-transparent text-gray-300 border border-gray-700',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }
  
  const dotColors = {
    default: 'bg-gray-500',
    primary: 'bg-neon-green',
    secondary: 'bg-neon-blue',
    success: 'bg-neon-green',
    warning: 'bg-neon-yellow',
    danger: 'bg-neon-pink',
    purple: 'bg-neon-purple',
    outline: 'bg-gray-500',
  }
  
  const badgeClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `
  
  return (
    <span className={badgeClasses} {...props}>
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full
            ${dotColors[variant]}
            ${pulse ? 'animate-pulse' : ''}
          `}
        />
      )}
      {children}
    </span>
  )
}

export default Badge
