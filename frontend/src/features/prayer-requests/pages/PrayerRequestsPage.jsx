import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePrayerRequests from '../hooks/usePrayerRequests';
import PrayerRequestsList from '../components/PrayerRequestsList';
import {
  submitPrayerRequest,
  assignPrayerRequest,
  addPrayerRequestFollowUp,
  getPrayerRequestStatistics,
} from '../../../api/prayer-requests.api';
import {
  PRAYER_CATEGORY_OPTIONS,
  PRAYER_PRIORITY_OPTIONS,
  PRAYER_STATUS_OPTIONS,
  FOLLOW_UP_ACTION_OPTIONS,
  DEFAULT_FORM_VALUES,
  SUMMARY_CARDS,
} from '../utils/constants';
import { useSnackbar } from '../../../hooks/useSnackbar';
import { useAuth } from '../../auth/hooks/useAuth';

const PrayerRequestsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useSnackbar();
  const { user } = useAuth();

  // Fetch prayer requests
  const {
    requests,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    setPage,
    search,
    setSearch,
    refetch,
  } = usePrayerRequests({ page: 1, pageSize: 50 });

  // UI State
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Modal States
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Form States
  const [newRequest, setNewRequest] = useState(DEFAULT_FORM_VALUES);
  const [followUpData, setFollowUpData] = useState({
    action_type: 'note',
    notes: '',
    is_private: true,
    update_status: '',
  });
  const [assignToUserId, setAssignToUserId] = useState('');

  // Statistics
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Team members for assignment (this should come from a users API endpoint)
  const [teamMembers, setTeamMembers] = useState([]);

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const data = await getPrayerRequestStatistics();
        setStatistics(data);
      } catch (err) {
        console.error('Failed to load statistics:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, [requests]);

  // TODO: Load team members from users API
  useEffect(() => {
    // This should fetch users with role pastor/elder/admin
    // For now, using mock data
    setTeamMembers([
      { id: 1, first_name: 'Pastor', last_name: 'John', role: 'pastor' },
      { id: 2, first_name: 'Sister', last_name: 'Mary', role: 'elder' },
      { id: 3, first_name: 'Brother', last_name: 'David', role: 'elder' },
    ]);
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
    {
      ...SUMMARY_CARDS[0],
      count: requests.length,
    },
    {
      ...SUMMARY_CARDS[1],
      count: requests.filter((r) => r.status === 'pending').length,
    },
    {
      ...SUMMARY_CARDS[2],
      count: requests.filter((r) =>
        ['assigned', 'in_progress', 'prayed'].includes(r.status)
      ).length,
    },
    {
      ...SUMMARY_CARDS[3],
      count: requests.filter((r) => r.status === 'completed').length,
    },
  ];

  // Handlers
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!newRequest.title || !newRequest.description) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      await submitPrayerRequest(newRequest);
      showSuccess('Prayer request submitted successfully!');
      setShowNewRequestModal(false);
      setNewRequest(DEFAULT_FORM_VALUES);
      refetch();
    } catch (err) {
      console.error('Submit error:', err);
      showError(err.response?.data?.detail || 'Failed to submit prayer request');
    }
  };

  const handleAssign = async () => {
    if (!assignToUserId) {
      showError('Please select a team member');
      return;
    }

    try {
      await assignPrayerRequest(selectedRequest.id, parseInt(assignToUserId));
      showSuccess(`Prayer request assigned successfully!`);
      setShowAssignModal(false);
      setSelectedRequest(null);
      setAssignToUserId('');
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
      setShowFollowUpModal(false);
      setSelectedRequest(null);
      setFollowUpData({
        action_type: 'note',
        notes: '',
        is_private: true,
        update_status: '',
      });
      refetch();
    } catch (err) {
      console.error('Follow-up error:', err);
      showError(err.response?.data?.detail || 'Failed to add follow-up');
    }
  };

  const handleView = (id) => {
    navigate(`/prayer-requests/${id}`);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFB84D] to-[#FFA726] p-8 shadow-md">
          <div className="relative z-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🙏</span>
                <div>
                  <h1 className="text-3xl font-bold text-white">Prayer Requests</h1>
                  <p className="text-sm text-white/90 mt-1">
                    {totalCount} total request{totalCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-[#FFB84D] shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                + New Request
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <div
              key={stat.key}
              onClick={() => setStatusFilter(stat.filterValue)}
              className={`cursor-pointer rounded-2xl border-2 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                statusFilter === stat.filterValue
                  ? 'border-[#FFB84D] ring-2 ring-[#FFB84D]/20 shadow-md'
                  : 'border-gray-200 hover:border-[#FFB84D]/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.count}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
              {statusFilter === stat.filterValue && (
                <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-[#FFB84D] to-[#FFA726]" />
              )}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search requests…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
            />

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
            >
              <option value="">All Priorities</option>
              {PRAYER_PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
            >
              <option value="">All Categories</option>
              {PRAYER_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#FFB84D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#FFB84D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ☰ List
              </button>
            </div>
          </div>
        </div>

        {/* Prayer Requests List */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            <p className="font-medium">Error loading prayer requests</p>
            <p className="text-sm">{error.message || 'Please try again later'}</p>
          </div>
        )}

        <PrayerRequestsList
          requests={filteredRequests}
          loading={loading}
          onView={handleView}
          onAssign={handleOpenAssign}
          onFollowUp={handleOpenFollowUp}
        />

        {/* New Request Modal */}
        {showNewRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">New Prayer Request</h2>
                <button
                  onClick={() => {
                    setShowNewRequestModal(false);
                    setNewRequest(DEFAULT_FORM_VALUES);
                  }}
                  className="text-3xl text-gray-400 hover:text-gray-600 leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Request Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newRequest.title}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    placeholder="Brief title for the prayer request"
                  />
                </div>

                {/* Name & Email */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name {!user && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      required={!user}
                      value={newRequest.requester_name}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, requester_name: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                      placeholder={user ? 'Optional' : 'Your name'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newRequest.requester_email}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, requester_email: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newRequest.requester_phone}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, requester_phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    placeholder="Optional"
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newRequest.category}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, category: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    >
                      {PRAYER_CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newRequest.priority}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, priority: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    >
                      {PRAYER_PRIORITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prayer Request Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={newRequest.description}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, description: e.target.value })
                    }
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    placeholder="Share your prayer request in detail..."
                  />
                </div>

                {/* Privacy Options */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_anonymous"
                      checked={newRequest.is_anonymous}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, is_anonymous: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#FFB84D] focus:ring-[#FFB84D]"
                    />
                    <label htmlFor="is_anonymous" className="text-sm text-gray-700">
                      Submit anonymously (hide my name)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_private"
                      checked={newRequest.is_private}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, is_private: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#FFB84D] focus:ring-[#FFB84D]"
                    />
                    <label htmlFor="is_private" className="text-sm text-gray-700">
                      Keep private (visible only to prayer team)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={newRequest.is_public}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, is_public: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#FFB84D] focus:ring-[#FFB84D]"
                    />
                    <label htmlFor="is_public" className="text-sm text-gray-700">
                      Share with congregation for prayer
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewRequestModal(false);
                      setNewRequest(DEFAULT_FORM_VALUES);
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[#FFB84D] px-6 py-3 font-medium text-white hover:bg-[#FFA726] transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Assign Prayer Team</h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedRequest(null);
                    setAssignToUserId('');
                  }}
                  className="text-3xl text-gray-400 hover:text-gray-600 leading-none"
                >
                  ×
                </button>
              </div>

              <p className="mb-6 text-sm text-gray-600">
                Assign "{selectedRequest.title}" to a prayer team member
              </p>

              <div className="space-y-3 mb-6">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setAssignToUserId(String(member.id))}
                    className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-[#FFB84D] hover:bg-[#FFB84D]/5 text-left ${
                      assignToUserId === String(member.id)
                        ? 'border-[#FFB84D] bg-[#FFB84D]/10'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="text-3xl">👤</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                    </div>
                    {assignToUserId === String(member.id) && (
                      <span className="text-[#FFB84D] text-xl">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedRequest(null);
                    setAssignToUserId('');
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={!assignToUserId}
                  className="flex-1 rounded-lg bg-[#FFB84D] px-6 py-3 font-medium text-white hover:bg-[#FFA726] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Follow-Up Modal */}
        {showFollowUpModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Add Follow-Up</h2>
                <button
                  onClick={() => {
                    setShowFollowUpModal(false);
                    setSelectedRequest(null);
                    setFollowUpData({
                      action_type: 'note',
                      notes: '',
                      is_private: true,
                      update_status: '',
                    });
                  }}
                  className="text-3xl text-gray-400 hover:text-gray-600 leading-none"
                >
                  ×
                </button>
              </div>

              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-800">{selectedRequest.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  by {selectedRequest.requester_name_display}
                </p>
              </div>

              {/* Previous Follow-Ups */}
              {selectedRequest.follow_ups && selectedRequest.follow_ups.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Previous Follow-Ups
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedRequest.follow_ups.map((followUp) => (
                      <div
                        key={followUp.id}
                        className="rounded-lg border border-gray-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {followUp.created_by_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {followUp.action_type_display}
                              {followUp.is_private && ' (Private)'}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(followUp.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{followUp.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAddFollowUp} className="space-y-4">
                {/* Action Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Type
                  </label>
                  <select
                    value={followUpData.action_type}
                    onChange={(e) =>
                      setFollowUpData({ ...followUpData, action_type: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                  >
                    {FOLLOW_UP_ACTION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-Up Note <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={followUpData.notes}
                    onChange={(e) =>
                      setFollowUpData({ ...followUpData, notes: e.target.value })
                    }
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    placeholder="Share an update, testimony, or continued prayer points..."
                  />
                </div>

                {/* Update Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Status (Optional)
                  </label>
                  <select
                    value={followUpData.update_status}
                    onChange={(e) =>
                      setFollowUpData({ ...followUpData, update_status: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                  >
                    <option value="">Keep current status</option>
                    {PRAYER_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Privacy */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_private_followup"
                    checked={followUpData.is_private}
                    onChange={(e) =>
                      setFollowUpData({ ...followUpData, is_private: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-[#FFB84D] focus:ring-[#FFB84D]"
                  />
                  <label htmlFor="is_private_followup" className="text-sm text-gray-700">
                    Private note (visible only to prayer team)
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFollowUpModal(false);
                      setSelectedRequest(null);
                      setFollowUpData({
                        action_type: 'note',
                        notes: '',
                        is_private: true,
                        update_status: '',
                      });
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[#FFB84D] px-6 py-3 font-medium text-white hover:bg-[#FFA726] transition-colors"
                  >
                    Add Follow-Up
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerRequestsPage;
