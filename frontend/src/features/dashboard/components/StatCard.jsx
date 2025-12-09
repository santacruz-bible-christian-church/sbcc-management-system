import { useNavigate } from 'react-router-dom';
import { HiChevronRight, HiTrendingUp } from 'react-icons/hi';

export const StatCard = ({ card, index }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => card.link && navigate(card.link)}
      className="bg-white rounded-2xl px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 text-left group relative overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${card.iconBg} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm`}>
            <card.icon className={`w-6 h-6 ${card.iconColor}`} />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <HiTrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div>
          <p className="text-sbcc-gray text-sm font-medium mb-1">{card.title}</p>
          <p className="text-3xl font-bold text-sbcc-dark group-hover:text-sbcc-primary transition-colors">
            {card.value}
          </p>
        </div>

        {card.link && (
          <div className="mt-2 flex items-center text-sbcc-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            View Details <HiChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </div>
    </button>
  );
};
