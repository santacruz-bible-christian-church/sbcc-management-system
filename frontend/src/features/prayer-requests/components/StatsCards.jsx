import React from 'react';

const StatsCards = ({ statsCards, activeFilter, onFilterChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statsCards.map((stat) => {
        const IconComponent = stat.icon;

        return (
          <div
            key={stat.key}
            onClick={() => onFilterChange(stat.filterValue)}
            className={`cursor-pointer rounded-2xl border-2 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              activeFilter === stat.filterValue
                ? 'border-[#FFB84D] ring-2 ring-[#FFB84D]/20 shadow-md'
                : 'border-gray-200 hover:border-[#FFB84D]/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.count}</p>
              </div>
              <IconComponent className="text-4xl text-[#FFB84D]" />
            </div>
            {activeFilter === stat.filterValue && (
              <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-[#FFB84D] to-[#FFA726]" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
