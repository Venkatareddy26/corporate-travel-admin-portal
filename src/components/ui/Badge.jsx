import React from 'react';

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  primary: 'bg-purple-100 text-purple-800 border-purple-200',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  gradient: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0'
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
};

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon: Icon,
  dot = false,
  className = '', 
  ...props 
}) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5
        font-semibold rounded-full
        border
        ${badgeVariants[variant]}
        ${badgeSizes[size]}
        ${className}
      `} 
      {...props}
    >
      {dot && (
        <span className={`
          w-2 h-2 rounded-full animate-pulse
          ${variant === 'success' ? 'bg-emerald-500' : 
            variant === 'danger' ? 'bg-red-500' : 
            variant === 'warning' ? 'bg-amber-500' : 
            variant === 'info' ? 'bg-blue-500' : 
            'bg-purple-500'}
        `} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '', ...props }) {
  const statusConfig = {
    active: { variant: 'success', label: 'Active', dot: true },
    inactive: { variant: 'default', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    approved: { variant: 'success', label: 'Approved' },
    rejected: { variant: 'danger', label: 'Rejected' },
    completed: { variant: 'info', label: 'Completed' },
    draft: { variant: 'default', label: 'Draft' },
    published: { variant: 'primary', label: 'Published' }
  };

  const config = statusConfig[status?.toLowerCase()] || { variant: 'default', label: status };

  return (
    <Badge 
      variant={config.variant} 
      dot={config.dot}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  );
}
