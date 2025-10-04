import React from 'react';

interface TrainIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export const TrainIcon: React.FC<TrainIconProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  return (
    <svg 
      className={`${sizeClasses[size]} ${className}`} 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5h1.5L9 19h6l1.5 1.5H18L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9.5zM6 6h12v9.5c0 .83-.67 1.5-1.5 1.5h-9c-.83 0-1.5-.67-1.5-1.5V6z"/>
      <circle cx="8.5" cy="12.5" r="1.5"/>
      <circle cx="15.5" cy="12.5" r="1.5"/>
      <path d="M7 8h10v2H7V8z"/>
      <path d="M7 11h10v1H7v-1z"/>
    </svg>
  );
};

export default TrainIcon;
