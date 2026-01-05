import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiClipboardList, HiDocumentText } from 'react-icons/hi';
import usePrayerRequests from '../hooks/usePrayerRequests';
import PrayerRequestsList from '../components/PrayerRequestsList';
import AssignModal from '../components/AssignModal';
import FollowUpModal from '../components/FollowUpModal';
import PrayerRequestsFilters from '../components/PrayerRequestsFilters';
import StatsCards from '../components/StatsCards';
import {
  assignPrayerRequest,
  addPrayerRequestFollowUp,
  getPrayerRequestStatistics,
} from '../../../api/prayer-requests.api';
import { SUMMARY_CARDS } from '../utils/constants';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useAuth } from '../../auth/hooks/useAuth';
import { usersApi } from '../../../api/users.api';

const INITIAL_FOLLOW_UP_DATA = {
  action_type: 'note',
  notes: '',
  is_private: true,
  update_status: '',
};

const PrayerRequestsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { user } = useAuth();

  // Fetch prayer requests
  const { requests, loading, error, totalCount, search, setSearch, refetch } =
    usePrayerRequests({ page: 1, pageSize: 50 });

  // UI State
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [assignToUserId, setAssignToUserId] = useState('');
  const [followUpData, setFollowUpData] = useState(INITIAL_FOLLOW_UP_DATA);

  // Statistics & Team Members
  const [statistics, setStatistics] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getPrayerRequestStatistics();
        setStatistics(data);
      } catch (err) {
        console.error('Failed to load statistics:', err);
      }
    };
    loadStats();
  }, [requests]);

  // Load pastors for assignment
  useEffect(() => {
    const loadPastors = async () => {
      try {
        const data = await usersApi.getUsers({ role: 'pastor' });
        const pastors = data.results || data || [];
        setTeamMembers(pastors.filter(u => u.is_active));
      } catch (err) {
        console.error('Failed to load pastors:', err);
        setTeamMembers([]);
      }
    };
    loadPastors();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesPriority = !priorityFilter || req.priority === priorityFilter;
    const matchesCategory = !categoryFilter || req.category === categoryFilter;
    const matchesSearch =
      !search ||
      req.title?.toLowerCase().includes(search.toLowerCase()) ||
      req.requester_name_display?.toLowerCase().includes(search.toLowerCase()) ||
      req.description?.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  // Calculate stats for cards
  const statsCards = [
    { ...SUMMARY_CARDS[0], count: requests.length },
    { ...SUMMARY_CARDS[1], count: requests.filter((r) => r.status === 'pending').length },
    {
      ...SUMMARY_CARDS[2],
      count: requests.filter((r) => ['assigned', 'in_progress', 'prayed'].includes(r.status)).length,
    },
    { ...SUMMARY_CARDS[3], count: requests.filter((r) => r.status === 'completed').length },
  ];

  // Handlers
  const handleAssign = async () => {
    if (!assignToUserId) {
      showError('Please select a team member');
      return;
    }

    try {
      await assignPrayerRequest(selectedRequest.id, parseInt(assignToUserId));
      showSuccess('Prayer request assigned successfully!');
      closeAssignModal();
      refetch();
    } catch (err) {
      console.error('Assign error:', err);
      showError(err.response?.data?.detail || 'Failed to assign prayer request');
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();

    if (!followUpData.notes.trim()) {
      showError('Please enter follow-up notes');
      return;
    }

    try {
      await addPrayerRequestFollowUp(selectedRequest.id, followUpData);
      showSuccess('Follow-up added successfully!');
      closeFollowUpModal();
      refetch();
    } catch (err) {
      console.error('Follow-up error:', err);
      showError(err.response?.data?.detail || 'Failed to add follow-up');
    }
  };

  const handleOpenAssign = (request) => {
    setSelectedRequest(request);
    setAssignToUserId(request.assigned_to || '');
    setShowAssignModal(true);
  };

  const handleOpenFollowUp = (request) => {
    setSelectedRequest(request);
    setShowFollowUpModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedRequest(null);
    setAssignToUserId('');
  };

  const closeFollowUpModal = () => {
    setShowFollowUpModal(false);
    setSelectedRequest(null);
    setFollowUpData(INITIAL_FOLLOW_UP_DATA);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFB84D] to-[#FFA726] p-8 shadow-md">
          <div className="relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <HiClipboardList className="text-5xl text-white" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Prayer Requests</h1>
                  <p className="text-sm text-white/90 mt-1">
                    {totalCount} total request{totalCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/30 flex items-center gap-2">
                <HiDocumentText className="text-white/80" />
                <p className="text-xs text-white/80">
                  Requests are submitted via the public homepage
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          statsCards={statsCards}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />

        {/* Filters */}
        <PrayerRequestsFilters
          search={search}
          onSearchChange={setSearch}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            <p className="font-medium">Error loading prayer requests</p>
            <p className="text-sm">{error.message || 'Please try again later'}</p>
          </div>
        )}

        {/* Prayer Requests List */}
        <PrayerRequestsList
          requests={filteredRequests}
          loading={loading}
          viewMode={viewMode}
          onView={(id) => navigate(`/prayer-requests/${id}`)}
          onAssign={handleOpenAssign}
          onFollowUp={handleOpenFollowUp}
        />

        {/* Modals */}
        <AssignModal
          isOpen={showAssignModal}
          onClose={closeAssignModal}
          request={selectedRequest}
          teamMembers={teamMembers}
          selectedUserId={assignToUserId}
          onSelectUser={setAssignToUserId}
          onAssign={handleAssign}
        />

        <FollowUpModal
          isOpen={showFollowUpModal}
          onClose={closeFollowUpModal}
          request={selectedRequest}
          formData={followUpData}
          onChange={setFollowUpData}
          onSubmit={handleAddFollowUp}
        />
      </div>
    </main>
  );
};

export default PrayerRequestsPage;
