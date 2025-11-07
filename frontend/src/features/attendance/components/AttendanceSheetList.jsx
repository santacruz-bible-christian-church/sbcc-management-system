import { AttendanceSheetCard } from './AttendanceSheetCard';

export const AttendanceSheetList = ({
  sheets,
  onDownload,
  onEdit,
  onDelete,
  formatDate
}) => {
  return (
    <div className="grid gap-4">
      {/* Header row */}
      <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 px-2">
        <div className="col-span-4">Event</div>
        <div className="col-span-2">Date</div>
        <div className="col-span-2">Attendance</div>
        <div className="col-span-1">Rate</div>
        <div className="col-span-3 text-right">Actions</div>
      </div>

      {/* List items */}
      {sheets.map((sheet) => (
        <AttendanceSheetCard
          key={sheet.id}
          sheet={sheet}
          onDownload={onDownload}
          onEdit={onEdit}
          onDelete={onDelete}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default AttendanceSheetList;
