import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlineUserAdd,
  HiOutlineAnnotation,
  HiOutlineCheckCircle,
  HiOutlineChatAlt2
} from 'react-icons/hi';
import { formatDateTime } from '../../../utils/format';
import usePrayerRequestDetails from '../hooks/usePrayerRequestDetails';
import { PRIORITY_METADATA, STATUS_METADATA } from '../utils/constants';
import { usersApi } from '../../../api/users.api';
import { assignPrayerRequest, addPrayerRequestFollowUp, markPrayerRequestCompleted } from '../../../api/prayer-requests.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import AssignModal from '../components/AssignModal';
import FollowUpModal from '../components/FollowUpModal';

const INITIAL_FOLLOW_UP_DATA = {
  action_type: 'note',
  notes: '',
  is_private: true,
  update_status: '',
};

const PrayerRequestsDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { request, loading, error, refetch } = usePrayerRequestDetails(id);

  // Team members (pastors)
  const [teamMembers, setTeamMembers] = useState([]);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [assignToUserId, setAssignToUserId] = useState('');
  const [followUpData, setFollowUpData] = useState(INITIAL_FOLLOW_UP_DATA);

  // Load pastors for assignment
  useEffect(() => {
    const loadPastors = async () => {
      try {
        const data = await usersApi.getUsers({ role: 'pastor' });
        const pastors = data.results || data || [];
        setTeamMembers(pastors.filter(u => u.is_active));
      } catch (err) {
        console.error('Failed to load pastors:', err);
      }
    };
    loadPastors();
  }, []);

  const handleBack = () => {
    navigate('/prayer-requests');
  };

  const handleAssign = async () => {
    if (!assignToUserId) {
      showError('Please select a pastor');
      return;
    }
    try {
      await assignPrayerRequest(id, parseInt(assignToUserId));
      showSuccess('Prayer request assigned successfully!');
      setShowAssignModal(false);
      setAssignToUserId('');
      refetch();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to assign');
    }
  };

  const handleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpData.notes.trim()) {
      showError('Please enter notes');
      return;
    }
    try {
      await addPrayerRequestFollowUp(id, followUpData);
      showSuccess('Follow-up added!');
      setShowFollowUpModal(false);
      setFollowUpData(INITIAL_FOLLOW_UP_DATA);
      refetch();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to add follow-up');
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await markPrayerRequestCompleted(id);
      showSuccess('Marked as completed!');
      refetch();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to mark completed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="h-6 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
              <div className="h-24 w-full bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <p className="text-red-600 mb-4">
              Unable to load this prayer request. It may have been removed or there was an error.
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              Back to list
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    requester_name_display,
    requester_email,
    submitted_at,
    is_anonymous,
    status,
    priority,
    category_display,
    assigned_to_name,
    follow_ups,
  } = request;

  const priorityInfo = PRIORITY_METADATA[priority] || PRIORITY_METADATA.medium;
  const statusInfo = STATUS_METADATA[status] || STATUS_METADATA.pending;
  const isCompleted = status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Prayer Requests
          </button>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {!isCompleted && (
              <>
                <button
                  onClick={() => {
                    setAssignToUserId(request.assigned_to || '');
                    setShowAssignModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                >
                  <HiOutlineUserAdd className="w-4 h-4" />
                  {assigned_to_name ? 'Reassign' : 'Assign'}
                </button>
                <button
                  onClick={() => setShowFollowUpModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                >
                  <HiOutlineAnnotation className="w-4 h-4" />
                  Follow Up
                </button>
                <button
                  onClick={handleMarkCompleted}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  Complete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Priority Accent Bar */}
          <div className="h-1.5" style={{ backgroundColor: priorityInfo.tint }} />

          <div className="p-6 space-y-6">
            {/* Title & Tags */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: `${priorityInfo.tint}15`, color: priorityInfo.tint }}
                >
                  {priorityInfo.label} Priority
                </span>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: `${statusInfo.tint}15`, color: statusInfo.tint }}
                >
                  {statusInfo.label}
                </span>
                {category_display && (
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {category_display}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title || 'Prayer Request'}
              </h1>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {description}
              </p>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <HiOutlineUser className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Submitted by</p>
                  {is_anonymous ? (
                    <p className="font-medium italic">Anonymous</p>
                  ) : (
                    <p className="font-medium text-gray-900">{requester_name_display || 'Unknown'}</p>
                  )}
                </div>
              </div>

              {requester_email && !is_anonymous && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <HiOutlineMail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium text-gray-900">{requester_email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm text-gray-600">
                <HiOutlineCalendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="font-medium text-gray-900">{formatDateTime(submitted_at)}</p>
                </div>
              </div>

              {assigned_to_name && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <HiOutlineUserAdd className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-xs text-gray-400">Assigned to</p>
                    <p className="font-medium text-gray-900">{assigned_to_name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Follow-ups Section */}
        {follow_ups && follow_ups.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineChatAlt2 className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">
                Follow-ups ({follow_ups.length})
              </h2>
            </div>
            <div className="space-y-4">
              {follow_ups.map((fu, idx) => (
                <div key={fu.id || idx} className="border-l-2 border-amber-400 pl-4 py-2">
                  <p className="text-sm text-gray-700">{fu.notes}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {fu.created_by_name} • {formatDateTime(fu.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        request={request}
        teamMembers={teamMembers}
        selectedUserId={assignToUserId}
        onSelectUser={setAssignToUserId}
        onAssign={handleAssign}
      />

      <FollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        request={request}
        formData={followUpData}
        onChange={setFollowUpData}
        onSubmit={handleFollowUp}
      />
    </div>
  );
};

export default PrayerRequestsDetails;
