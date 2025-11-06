// frontend/src/features/ministries/components/MinistryShiftsTab.jsx
import { useCallback, useEffect, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlinePlus } from 'react-icons/hi';
import { ministriesApi } from '../../../api/ministries.api';

export const MinistryShiftsTab = ({ ministryId, canManage, onRefresh }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ministriesApi.listShifts({ ministry: ministryId });
      setShifts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load shifts');
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, [ministryId]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Spinner size="lg" />
        <p className="mt-3 text-[#A0A0A0]">Loading shifts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[18px] font-bold text-[#383838]">
          Shifts ({shifts.length})
        </h3>
        {canManage && (
          <button
            className="flex items-center gap-2 bg-[#FDB54A] hover:bg-[#e5a43b] text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => {/* TODO: Add shift modal */}}
          >
            <HiOutlinePlus className="w-4 h-4" />
            Create Shift
          </button>
        )}
      </div>

      {/* Shifts List */}
      {shifts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-[#A0A0A0]">No shifts scheduled</p>
          {canManage && (
            <button
              className="mt-4 text-[#FDB54A] hover:underline"
              onClick={() => {/* TODO: Add shift modal */}}
            >
              Create your first shift
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="bg-gray-50 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[16px] font-semibold text-[#383838]">
                    {shift.role}
                  </p>
                  {shift.assignment_info ? (
                    <span className="text-[12px] bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Assigned
                    </span>
                  ) : (
                    <span className="text-[12px] bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                      Unassigned
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-[#A0A0A0]">
                  {formatDate(shift.date)}
                  {shift.start_time && ` • ${shift.start_time.slice(0, 5)}`}
                  {shift.end_time && ` - ${shift.end_time.slice(0, 5)}`}
                </p>
                {shift.assignment_info && (
                  <p className="text-[14px] text-[#383838] mt-1">
                    Assigned to: <span className="font-semibold">{shift.assignment_info.user_name}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MinistryShiftsTab;
