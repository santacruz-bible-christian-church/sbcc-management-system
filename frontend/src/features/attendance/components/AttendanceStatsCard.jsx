import PropTypes from 'prop-types';

export default function AttendanceStatsCard({ label, value, variant = 'default' }) {
  const variantStyles = {
    default: 'text-gray-800',
    success: 'text-green-600',
    accent: 'text-[#FDB54A]',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${variantStyles[variant]}`}>
        {value}
      </p>
    </div>
  );
}

AttendanceStatsCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'accent']),
};
