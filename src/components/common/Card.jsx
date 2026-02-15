const Card = ({ children, className = '', onClick, hover = false }) => {
  const baseStyles = 'bg-white rounded-2xl shadow-sm border border-gray-100'
  const hoverStyles = hover ? 'hover:shadow-md hover:border-gray-200 transition-all cursor-pointer' : ''
  const clickStyles = onClick ? 'cursor-pointer' : ''

  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${clickStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
