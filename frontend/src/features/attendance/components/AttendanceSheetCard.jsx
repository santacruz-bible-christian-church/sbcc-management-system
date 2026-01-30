import { Download, Edit2, Trash2 } from 'lucide-react';

export const AttendanceSheetCard = ({
  sheet,
  onDownload,
  onEdit,
  onDelete,
  formatDate
}) => {
  const canEdit = typeof onEdit === 'function';
  const canDelete = typeof onDelete === 'function';

  return (
    <div
      className="bg-white rounded-xl shadow-md py-4 px-6 grid grid-cols-12 items-center gap-4"
      style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
    >
      <div className="col-span-4 text-gray-700 font-medium">
        {sheet.event_title || 'Untitled Event'}
      </div>
      <div className="col-span-2 text-gray-600">
        {formatDate(sheet.date)}
      </div>
      <div className="col-span-2 text-gray-600">
        {sheet.total_attended || 0} / {sheet.total_expected || 0}
      </div>
      <div className="col-span-1 text-gray-600">
        {sheet.attendance_rate ? `${sheet.attendance_rate.toFixed(0)}%` : 'N/A'}
      </div>
      <div className="col-span-3 text-right flex items-center justify-end gap-4">
        <button
          title="Download CSV"
          onClick={() => onDownload(sheet)}
          className="p-2 rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4 text-[#FDB54A]" />
        </button>
        {canEdit && (
          <button
            title="Open tracker"
            onClick={() => onEdit(sheet)}
            className="p-2 rounded-lg hover:bg-gray-50"
          >
            <Edit2 className="w-4 h-4 text-[#FDB54A]" />
          </button>
        )}
        {canDelete && (
          <button
            title="Delete"
            onClick={() => onDelete(sheet)}
            className="p-2 rounded-lg hover:bg-gray-50"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AttendanceSheetCard;
