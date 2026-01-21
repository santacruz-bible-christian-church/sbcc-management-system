import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineUserAdd,
  HiOutlineAnnotation,
  HiOutlineCheckCircle,
  HiOutlineDotsVertical,
  HiOutlineClock,
  HiOutlineChat,
} from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import usePrayerRequestDetails from '../hooks/usePrayerRequestDetails';
import { PRIORITY_METADATA, STATUS_METADATA } from '../utils/constants';
import { usersApi } from '../../../api/users.api';
import { assignPrayerRequest, addPrayerRequestFollowUp, markPrayerRequestCompleted } from '../../../api/prayer-requests.api';
import { useSnackbar } from '../../../hooks/useSnackbar';
import AssignModal from '../components/AssignModal';
import FollowUpModal from '../components/FollowUpModal';
import ActivityTimeline from '../components/ActivityTimeline';
import RequesterCard from '../components/RequesterCard';
import AssignmentCard from '../components/AssignmentCard';

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
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

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
    setIsAssigning(true);
    try {
      await assignPrayerRequest(id, parseInt(assignToUserId));
      showSuccess('Prayer request assigned successfully!');
      setShowAssignModal(false);
      setAssignToUserId('');
      refetch();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to assign');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpData.notes.trim()) {
      showError('Please enter notes');
      return;
    }
    setIsSubmittingFollowUp(true);
    try {
      await addPrayerRequestFollowUp(id, followUpData);
      showSuccess('Follow-up added!');
      setShowFollowUpModal(false);
      setFollowUpData(INITIAL_FOLLOW_UP_DATA);
      refetch();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to add follow-up');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const handleMarkCompleted = async () => {
    setIsMarkingComplete(true);
    try {
      await markPrayerRequestCompleted(id);
      showSuccess('Marked as completed!');
      refetch();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to mark completed');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const openAssignModal = () => {
    setAssignToUserId(request?.assigned_to || '');
    setShowAssignModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-24 w-full bg-gray-200 rounded" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-40 bg-gray-200 rounded-xl" />
                <div className="h-32 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
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
    status,
    priority,
    category_display,
    follow_ups,
  } = request;

  const priorityInfo = PRIORITY_METADATA[priority] || PRIORITY_METADATA.medium;
  const statusInfo = STATUS_METADATA[status] || STATUS_METADATA.pending;
  const isCompleted = status === 'completed';

  // Quick stats
  const followUpCount = follow_ups?.length || 0;
  const daysSinceSubmitted = request.submitted_at
    ? formatDistanceToNow(new Date(request.submitted_at))
    : 'Unknown';

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors ${isCompleted ? 'bg-gray-100' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Back Navigation */}
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-amber-600 font-medium hover:underline"
        >
          <HiOutlineArrowLeft className="w-4 h-4 mr-1" />
          Back to Prayer Requests
        </button>

        {/* Completed Banner */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Prayer Request Completed</p>
              <p className="text-sm text-green-600">This request has been marked as answered/completed.</p>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Card */}
            <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${isCompleted ? 'border-green-200' : 'border-gray-200'}`}>
              {/* Priority Accent Bar */}
              <div className="h-1.5" style={{ backgroundColor: priorityInfo.tint }} />

              {/* Card Header with Title + Actions */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: `${priorityInfo.tint}15`, color: priorityInfo.tint }}
                      >
                        {priorityInfo.label}
                      </span>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ backgroundColor: `${statusInfo.tint}15`, color: statusInfo.tint }}
                      >
                        {statusInfo.label}
                      </span>
                      {category_display && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {category_display}
                        </span>
                      )}
                    </div>
                    {/* Title */}
                    <h1 className={`text-xl font-bold ${isCompleted ? 'text-gray-600' : 'text-gray-900'}`}>
                      {title || 'Prayer Request'}
                    </h1>
                  </div>

                  {/* Action Buttons - Inside Card Header */}
                  {!isCompleted && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowFollowUpModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
                      >
                        <HiOutlineAnnotation className="w-4 h-4" />
                        Follow-up
                      </button>
                      <button
                        onClick={handleMarkCompleted}
                        disabled={isMarkingComplete}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 border border-green-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        {isMarkingComplete ? 'Completing...' : 'Complete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body - Description */}
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className={`whitespace-pre-line leading-relaxed ${isCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                    {description}
                  </p>
                </div>
              </div>
            </div>


            {/* Activity Timeline Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                <HiOutlineChat className="w-5 h-5 text-gray-400" />
                Activity Timeline
              </h2>

              <ActivityTimeline request={request} />
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-4">
            {/* Requester Card */}
            <RequesterCard request={request} />

            {/* Assignment Card */}
            <AssignmentCard
              request={request}
              onReassign={openAssignModal}
              isCompleted={isCompleted}
            />

            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineChat className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    <strong className="text-gray-900">{followUpCount}</strong> follow-up{followUpCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <HiOutlineClock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Open for <strong className="text-gray-900">{daysSinceSubmitted}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        submitting={isAssigning}
      />

      <FollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        request={request}
        formData={followUpData}
        onChange={setFollowUpData}
        onSubmit={handleFollowUp}
        submitting={isSubmittingFollowUp}
      />
    </div>
  );
};

export default PrayerRequestsDetails;
