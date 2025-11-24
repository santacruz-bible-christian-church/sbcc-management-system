import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from 'flowbite-react';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import AttendanceMemberRow from './AttendanceMemberRow';
import { Pagination } from '../../../components/ui/Pagination';

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
  // Multi-select props
  isMultiSelectMode = false,
  selectedRecords = new Set(),
  onToggleSelection = () => {},
  isAllPageSelected = false,
  isSomePageSelected = false,
  onToggleAllPage = () => {},
}) {
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No members found matching your filters.</p>
      </div>
    );
  }

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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isMultiSelectMode && (
                <th scope="col" className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={isAllPageSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomePageSelected;
                      }
                    }}
                    onChange={onToggleAllPage}
                    className="h-4 w-4 rounded border-gray-300 text-sbcc-primary focus:ring-sbcc-primary cursor-pointer"
                    title={isAllPageSelected ? 'Deselect all on page' : 'Select all on page'}
                  />
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ministry
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.map((record) => {
              const isSelected = selectedRecords.has(record.id);

              return (
                <tr
                  key={record.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  {isMultiSelectMode && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection(record.id)}
                        className="h-4 w-4 rounded border-gray-300 text-sbcc-primary focus:ring-sbcc-primary cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-sbcc-primary flex items-center justify-center text-white font-semibold">
                          {record.member_name?.charAt(0).toUpperCase() || 'M'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.member_name || 'Unknown Member'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.member_ministry || 'No Ministry'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => onToggleAttendance(record.id)}
                      disabled={saving}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        record.attended
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      title={record.attended ? 'Mark as absent' : 'Mark as present'}
                    >
                      {record.attended ? (
                        <>
                          <HiCheckCircle className="mr-1.5 h-4 w-4" />
                          Present
                        </>
                      ) : (
                        <>
                          <HiXCircle className="mr-1.5 h-4 w-4" />
                          Absent
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={page}
            totalPages={pageCount}
            onPageChange={onPageChange}
            totalItems={totalCount}
            itemsPerPage={pageSize}
          />
        </div>
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
  // Multi-select props
  isMultiSelectMode: PropTypes.bool,
  selectedRecords: PropTypes.instanceOf(Set),
  onToggleSelection: PropTypes.func,
  isAllPageSelected: PropTypes.bool,
  isSomePageSelected: PropTypes.bool,
  onToggleAllPage: PropTypes.func,
};
