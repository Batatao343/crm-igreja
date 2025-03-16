import React from 'react';
import { Filter, RefreshCcw } from 'lucide-react';

interface FilterBarProps {
  onRefresh: () => void;
  children: React.ReactNode;
}

const FilterBar: React.FC<FilterBarProps> = ({ onRefresh, children }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCcw className="w-4 h-4 mr-1" />
          Atualizar
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
};

export default FilterBar;