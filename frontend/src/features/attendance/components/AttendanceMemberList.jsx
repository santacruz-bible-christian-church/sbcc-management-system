import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from 'flowbite-react';
import AttendanceMemberRow from './AttendanceMemberRow';

const ACCENT = '#FDB54A';

export default function AttendanceMemberList({
  members,
  page,
  pageCount,
  totalCount,
  pageSize,
  onPageChange,
  onToggleAttendance,
  saving = false,
}) {
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="relative">
      {/* Loading overlay */}
      {saving && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center">
            <Spinner size="xl" color="warning" />
            <p className="mt-3 text-gray-700 font-medium">Saving attendance...</p>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 px-2">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Gender</div>
          <div className="col-span-3">Ministry</div>
          <div className="col-span-2 text-right">Attendance</div>
        </div>

        {/* Member rows */}
        {members.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No members found</p>
          </div>
        ) : (
          members.map((record) => (
            <AttendanceMemberRow
              key={record.id}
              record={record}
              onToggleAttendance={onToggleAttendance}
              disabled={saving}
            />
          ))
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-center py-6">
            <nav className="inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
              <button
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={page === 1 || saving}
                onClick={() => onPageChange(Math.max(1, page - 1))}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              {Array.from({ length: pageCount }).map((_, idx) => {
                const num = idx + 1;
                const active = num === page;
                return (
                  <button
                    key={num}
                    onClick={() => onPageChange(num)}
                    disabled={saving}
                    className={`w-8 h-8 rounded-md text-sm flex items-center justify-center ${
                      active ? 'bg-[#FDB54A] text-white' : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50`}
                    style={{ backgroundColor: active ? ACCENT : undefined }}
                  >
                    {num}
                  </button>
                );
              })}

              <button
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={page === pageCount || saving}
                onClick={() => onPageChange(Math.min(pageCount, page + 1))}
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </nav>
          </div>
        )}

        {/* Results info */}
        {totalCount > 0 && (
          <div className="text-center text-sm text-gray-500">
            Showing {startIndex} - {endIndex} of {totalCount} members
          </div>
        )}
      </div>
    </div>
  );
}

AttendanceMemberList.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      member_name: PropTypes.string,
      member_gender: PropTypes.string,
      member_ministry: PropTypes.string,
      attended: PropTypes.bool,
      check_in_time: PropTypes.string,
    })
  ).isRequired,
  page: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onToggleAttendance: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};
