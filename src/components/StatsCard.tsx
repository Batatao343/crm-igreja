import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
          <p className={`text-3xl font-bold ${colorClasses}`}>{value}</p>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {icon && (
          <div className={`${colorClasses} opacity-20`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;