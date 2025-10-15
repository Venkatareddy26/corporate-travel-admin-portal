import React, { useState } from 'react';

export function Tabs({ defaultValue, children, className = '', onChange }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (onChange) onChange(value);
  };
  
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (child?.type === TabsList) {
          return React.cloneElement(child, { activeTab, onTabChange: handleTabChange });
        }
        if (child?.type === TabsContent) {
          return React.cloneElement(child, { activeTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className = '', activeTab, onTabChange }) {
  return (
    <div className={`
      flex items-center gap-1 p-1
      bg-gray-100 rounded-xl
      ${className}
    `}>
      {React.Children.map(children, child => {
        if (child?.type === TabsTrigger) {
          return React.cloneElement(child, { 
            isActive: activeTab === child.props.value,
            onClick: () => onTabChange(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, isActive, onClick, className = '', icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2
        px-4 py-2 rounded-lg
        font-medium text-sm
        transition-all duration-200
        ${isActive ? 
          'bg-white text-purple-700 shadow-md' : 
          'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

export function TabsContent({ value, children, activeTab, className = '' }) {
  if (value !== activeTab) return null;
  
  return (
    <div className={`animate-in ${className}`}>
      {children}
    </div>
  );
}

export function VerticalTabs({ defaultValue, children, className = '', onChange }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (onChange) onChange(value);
  };
  
  return (
    <div className={`flex gap-6 ${className}`}>
      {React.Children.map(children, child => {
        if (child?.type === VerticalTabsList) {
          return React.cloneElement(child, { activeTab, onTabChange: handleTabChange });
        }
        if (child?.type === VerticalTabsContent) {
          return React.cloneElement(child, { activeTab });
        }
        return child;
      })}
    </div>
  );
}

export function VerticalTabsList({ children, className = '', activeTab, onTabChange }) {
  return (
    <div className={`
      flex flex-col gap-2
      min-w-[200px]
      ${className}
    `}>
      {React.Children.map(children, child => {
        if (child?.type === VerticalTabsTrigger) {
          return React.cloneElement(child, { 
            isActive: activeTab === child.props.value,
            onClick: () => onTabChange(child.props.value)
          });
        }
        return child;
      })}
    </div>
  );
}

export function VerticalTabsTrigger({ value, children, isActive, onClick, className = '', icon: Icon, badge }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-between
        w-full px-4 py-3
        rounded-xl text-left
        font-medium text-sm
        transition-all duration-200
        ${isActive ? 
          'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30' : 
          'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
        }
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5" />}
        <span>{children}</span>
      </div>
      {badge && (
        <span className={`
          px-2 py-1 text-xs font-bold rounded-full
          ${isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}
        `}>
          {badge}
        </span>
      )}
    </button>
  );
}

export function VerticalTabsContent({ value, children, activeTab, className = '' }) {
  if (value !== activeTab) return null;
  
  return (
    <div className={`flex-1 animate-in ${className}`}>
      {children}
    </div>
  );
}
