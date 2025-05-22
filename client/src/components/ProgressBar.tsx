import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  colorClass?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showPercentage = true,
  colorClass = 'bg-secondary'
}) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs mb-1">
          {label && <span>{label}</span>}
          {showPercentage && <span>{percentage}%</span>}
        </div>
      )}
      <div className="bg-white/30 h-2 rounded-full overflow-hidden">
        <div 
          className={`${colorClass} h-full rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
