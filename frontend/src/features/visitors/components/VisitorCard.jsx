import {
  HiPhone,
  HiMail,
  HiCalendar,
  HiPencil,
  HiTrash,
  HiUserAdd,
  HiCheckCircle,
} from 'react-icons/hi';
import { FollowUpBadge } from './FollowUpBadge';
import { STATUS_COLORS } from '../utils/constants';

export function VisitorCard({
  visitor,
  onEdit,
  onDelete,
  onCheckIn,
  onConvert,
}) {
  const statusColors = STATUS_COLORS[visitor.status] || STATUS_COLORS.visitor;
  const isConverted = visitor.status === 'member';
  const canCheckIn = typeof onCheckIn === 'function';
  const canConvert = typeof onConvert === 'function';
  const canEdit = typeof onEdit === 'function';
  const canDelete = typeof onDelete === 'function';
  const showConvertedInfo = isConverted && visitor.converted_to_member_id;
  const showActions =
    (!isConverted && (canCheckIn || canConvert)) ||
    showConvertedInfo ||
    canEdit ||
    canDelete;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {visitor.full_name}
            </h3>
            {visitor.is_first_time && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                First Time
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FollowUpBadge status={visitor.follow_up_status} />
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}
            >
              {visitor.status_display || visitor.status}
            </span>
          </div>
        </div>

        {/* Visit Count */}
        <div className="text-center">
          <div className="text-2xl font-bold text-[#FDB54A]">
            {visitor.visit_count || 0}
          </div>
          <div className="text-xs text-gray-500">visits</div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-4 text-sm text-gray-600">
        {visitor.phone && (
          <div className="flex items-center gap-2">
            <HiPhone className="w-4 h-4 text-gray-400" />
            <span>{visitor.phone}</span>
          </div>
        )}
        {visitor.email && (
          <div className="flex items-center gap-2">
            <HiMail className="w-4 h-4 text-gray-400" />
            <span>{visitor.email}</span>
          </div>
        )}
        {visitor.date_added && (
          <div className="flex items-center gap-2">
            <HiCalendar className="w-4 h-4 text-gray-400" />
            <span>Added {new Date(visitor.date_added).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {visitor.notes && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{visitor.notes}</p>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          {!isConverted && canCheckIn && (
            <button
              onClick={() => onCheckIn(visitor)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <HiCheckCircle className="w-4 h-4" />
              Check In
            </button>
          )}
          {!isConverted && canConvert && (
            <button
              onClick={() => onConvert(visitor)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <HiUserAdd className="w-4 h-4" />
              Convert
            </button>
          )}
          {showConvertedInfo && (
            <span className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600">
              <HiCheckCircle className="w-4 h-4" />
              Converted to Member #{visitor.converted_to_member_id}
            </span>
          )}
          {canEdit && (
            <button
              onClick={() => onEdit(visitor)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiPencil className="w-4 h-4" />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(visitor)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <HiTrash className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default VisitorCard;
