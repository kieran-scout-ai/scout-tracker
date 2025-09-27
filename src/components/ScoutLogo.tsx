import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ScoutLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const ScoutLogo: React.FC<ScoutLogoProps> = ({ 
  size = 'md', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="bg-gradient-to-br from-accent to-accent-foreground p-2 rounded-lg">
        <BarChart3 className={`${sizeClasses[size]} text-background`} />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-foreground`}>
          Scout
        </span>
      )}
    </div>
  );
};