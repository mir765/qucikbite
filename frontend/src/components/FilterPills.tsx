import React from 'react';
import {
  UtensilsCrossed,
  Leaf,
  Clock,
  Star,
  Sparkles,
  Flame,
  Tag,
  CirclePercent
} from 'lucide-react';

interface Props {
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  isPureVeg: boolean;
  onTogglePureVeg: () => void;
}

export const FilterPills: React.FC<Props> = ({
  activeFilter,
  onSelectFilter,
  isPureVeg,
  onTogglePureVeg
}) => {
  const filters = [
    { id: 'all', label: 'All Places', icon: UtensilsCrossed },
    { id: 'kerala', label: 'Kerala Heritage', icon: Flame },
    { id: 'fast', label: '< 25 Mins', icon: Clock },
    { id: 'top_rated', label: 'Top Rated 4.5+', icon: Star },
    { id: 'budget', label: 'Budget-Friendly', icon: CirclePercent },
    { id: 'seafood', label: 'Coastal Seafood', icon: Sparkles },
    { id: 'lastcall', label: 'LastCall Surplus', icon: Tag },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar mb-6">
      {/* Pure Veg Switch */}
      <button
        onClick={onTogglePureVeg}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
          isPureVeg
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
        }`}
      >
        <Leaf size={13} className={isPureVeg ? 'text-white' : 'text-emerald-600'} />
        <span>Pure Veg</span>
      </button>

      <div className="h-5 w-px bg-slate-200 mx-1"></div>

      {/* Filter Chips */}
      {filters.map((f) => {
        const Icon = f.icon;
        const isSelected = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
              isSelected
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            <Icon
              size={13}
              className={isSelected ? 'text-orange-400' : 'text-slate-500'}
            />
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
};
