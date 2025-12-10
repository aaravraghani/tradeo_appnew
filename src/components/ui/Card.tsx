interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void  // ✅ Added
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  hover = false, 
  onClick  // ✅ Added
}) => {
  return (
    <div
      onClick={onClick}  // ✅ Added
      className={cn(
        'bg-white rounded-lg shadow-card p-6',
        hover && 'transition-transform duration-300 hover:scale-105 hover:shadow-xl',
        onClick && 'cursor-pointer',  // ✅ Added
        className
      )}
    >
      {children}
    </div>
  )
}
