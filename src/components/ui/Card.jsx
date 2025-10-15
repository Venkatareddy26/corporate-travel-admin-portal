import React from 'react';

export function Card({ 
  children, 
  className = '', 
  hover = false,
  gradient = false,
  glass = false,
  ...props 
}) {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white border border-gray-100 shadow-lg shadow-gray-200/50',
    hover: hover ? 'hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1' : '',
    gradient: gradient ? 'bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 border border-purple-100/50' : '',
    glass: glass ? 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl' : ''
  };
  
  const selectedVariant = glass ? 'glass' : gradient ? 'gradient' : 'default';
  
  return (
    <div 
      className={`
        ${baseStyles} 
        ${variants[selectedVariant]} 
        ${variants.hover}
        ${className}
      `} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-5 border-b border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', subtitle, icon: Icon, ...props }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <h3 className={`text-xl font-bold text-gray-900 ${className}`} {...props}>
            {children}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CardContent({ children, className = '', noPadding = false, ...props }) {
  return (
    <div className={`${noPadding ? '' : 'p-6'} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
