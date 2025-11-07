import PropTypes from 'prop-types';

const getMinistryColor = (ministry) => {
  const colors = {
    'Music Ministry': 'bg-[#D4EFFF] text-[#0092FF]',
    'Media Ministry': 'bg-[#D4FFD9] text-[#00C853]',
    'Worship Ministry': 'bg-[#E8D4FF] text-[#9C27B0]',
    'Youth Ministry': 'bg-[#FFE8D4] text-[#FF9800]',
  };
  return colors[ministry] || 'bg-blue-100 text-blue-600';
};

export default function AttendanceMemberRow({ record, onToggleAttendance, disabled = false }) {
  return (
    <div
      className="bg-white rounded-xl shadow-md py-4 px-6 grid grid-cols-12 items-center gap-4"
      style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
    >
      <div className="col-span-5 text-gray-800 font-medium">
        {record.member_name || 'Unknown Member'}
      </div>
      <div className="col-span-2 text-gray-600 capitalize">
        {record.member_gender || 'N/A'}
      </div>
      <div className="col-span-3">
        {record.member_ministry ? (
          <span className={`inline-block text-sm px-3 py-1 rounded-full ${getMinistryColor(record.member_ministry)}`}>
            {record.member_ministry}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">No Ministry</span>
        )}
      </div>
      <div className="col-span-2 text-right flex items-center justify-end gap-3">
        {record.check_in_time && (
          <span className="text-xs text-gray-500">
            {new Date(record.check_in_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        <input
          type="checkbox"
          checked={record.attended || false}
          onChange={() => onToggleAttendance(record.id)}
          disabled={disabled}
          className="w-5 h-5 rounded border-gray-300 text-[#FDB54A] focus:ring-[#FDB54A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

AttendanceMemberRow.propTypes = {
  record: PropTypes.shape({
    id: PropTypes.number.isRequired,
    member_name: PropTypes.string,
    member_gender: PropTypes.string,
    member_ministry: PropTypes.string,
    attended: PropTypes.bool,
    check_in_time: PropTypes.string,
  }).isRequired,
  onToggleAttendance: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
