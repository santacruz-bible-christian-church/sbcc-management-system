import React, { useState } from 'react';

// Mock data for team members
const TEAM_MEMBERS = [
  { id: '1', name: 'Pastor John', role: 'Lead Pastor', avatar: '👨‍🏫' },
  { id: '2', name: 'Sister Mary', role: 'Prayer Coordinator', avatar: '👩‍💼' },
  { id: '3', name: 'Brother David', role: 'Prayer Warrior', avatar: '🧑‍🤝‍🧑' },
  { id: '4', name: 'Sister Grace', role: 'Counselor', avatar: '👩‍⚕️' },
];

// Mock prayer requests data
const INITIAL_REQUESTS = [
  {
    id: '1',
    title: 'Healing for My Mother',
    requester: 'Jane Smith',
    category: 'Health',
    priority: 'urgent',
    status: 'pending',
    description: 'Please pray for my mother who is recovering from surgery. She has been experiencing complications and needs strength.',
    assignedTo: null,
    followUps: [],
    createdAt: '2024-03-15',
    lastFollowUp: null,
  },
  {
    id: '2',
    title: 'Job Interview Success',
    requester: 'Mike Johnson',
    category: 'Career',
    priority: 'normal',
    status: 'praying',
    description: 'I have an important job interview next week. Praying for wisdom, peace, and favor.',
    assignedTo: '2',
    followUps: [
      { date: '2024-03-14', note: 'Praying daily for wisdom and peace. Mike is feeling more confident.', by: 'Sister Mary' }
    ],
    createdAt: '2024-03-10',
    lastFollowUp: '2024-03-14',
  },
  {
    id: '3',
    title: 'Family Reconciliation',
    requester: 'Sarah Williams',
    category: 'Family',
    priority: 'high',
    status: 'praying',
    description: 'Please pray for healing and reconciliation between me and my sister. We have not spoken in months.',
    assignedTo: '1',
    followUps: [],
    createdAt: '2024-03-12',
    lastFollowUp: null,
  },
];

const PrayerRequestsPage = () => {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // New request form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    requester: '',
    email: '',
    phone: '',
    category: 'General',
    priority: 'normal',
    description: '',
    isConfidential: false,
  });

  // Follow-up form state
  const [followUpNote, setFollowUpNote] = useState('');

  const statusTabs = [
    { value: 'all', label: 'All Requests', count: requests.length, icon: '📋' },
    { value: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length, icon: '⏳' },
    { value: 'praying', label: 'In Prayer', count: requests.filter(r => r.status === 'praying').length, icon: '🙏' },
    { value: 'answered', label: 'Answered', count: requests.filter(r => r.status === 'answered').length, icon: '✅' },
  ];

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch = search === '' ||
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.requester.toLowerCase().includes(search.toLowerCase()) ||
      req.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleSubmitRequest = () => {
    if (!newRequest.title || !newRequest.requester || !newRequest.description) {
      alert('Please fill in all required fields');
      return;
    }

    const request = {
      id: String(Date.now()),
      ...newRequest,
      status: 'pending',
      assignedTo: null,
      followUps: [],
      createdAt: new Date().toISOString().split('T')[0],
      lastFollowUp: null,
    };
    setRequests([request, ...requests]);
    setShowNewRequestModal(false);
    setNewRequest({
      title: '',
      requester: '',
      email: '',
      phone: '',
      category: 'General',
      priority: 'normal',
      description: '',
      isConfidential: false,
    });
  };

  const handleAssign = (memberId) => {
    setRequests(requests.map(req =>
      req.id === selectedRequest.id
        ? { ...req, assignedTo: memberId, status: 'praying' }
        : req
    ));
    setShowAssignModal(false);
    setSelectedRequest(null);
  };

  const handleAddFollowUp = () => {
    if (!followUpNote.trim()) return;

    const followUp = {
      date: new Date().toISOString().split('T')[0],
      note: followUpNote,
      by: 'Current User',
    };

    setRequests(requests.map(req =>
      req.id === selectedRequest.id
        ? {
            ...req,
            followUps: [...req.followUps, followUp],
            lastFollowUp: followUp.date,
          }
        : req
    ));

    setFollowUpNote('');
    setShowFollowUpModal(false);
    setSelectedRequest(null);
  };

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(req =>
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
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
                  <p className="text-sm text-white/90 mt-1">{requests.length} prayer requests</p>
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
          {statusTabs.map((stat) => (
            <div
              key={stat.value}
              onClick={() => setStatusFilter(stat.value)}
              className={`cursor-pointer rounded-2xl border-2 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                statusFilter === stat.value
                  ? 'border-[#FFB84D] ring-2 ring-[#FFB84D]/20 shadow-md'
                  : 'border-gray-200 hover:border-[#FFB84D]/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.count}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
              {statusFilter === stat.value && (
                <div className="mt-3 h-1 w-full rounded-full bg-gradient-to-r from-[#FFB84D] to-[#FFA726]" />
              )}
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, title, or content…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#FFB84D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="mr-2">⊞</span> Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-[#FFB84D] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="mr-2">☰</span> List
              </button>
            </div>
          </div>
        </div>

        {/* Prayer Requests Grid/List */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <span className="text-6xl">🙏</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-800">No prayer requests found</h3>
            <p className="mt-2 text-sm text-gray-600">
              {search ? "Try adjusting your search or filters" : "Be the first to add a prayer request"}
            </p>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="mt-4 rounded-lg bg-[#FFB84D] px-6 py-2 font-medium text-white hover:bg-[#FFA726] transition-colors"
            >
              + Add Prayer Request
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {filteredRequests.map((request) => {
              const assignedMember = TEAM_MEMBERS.find(m => m.id === request.assignedTo);
              const priorityColors = {
                urgent: 'bg-red-100 text-red-700 border-red-200',
                high: 'bg-orange-100 text-orange-700 border-orange-200',
                normal: 'bg-blue-100 text-blue-700 border-blue-200',
                low: 'bg-gray-100 text-gray-700 border-gray-200',
              };

              return (
                <div key={request.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 truncate">{request.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">by {request.requester}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap ${priorityColors[request.priority]}`}>
                        {request.priority}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 line-clamp-3">{request.description}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="rounded-full bg-gray-100 px-3 py-1">{request.category}</span>
                      <span className="rounded-full bg-gray-100 px-3 py-1">📅 {request.createdAt}</span>
                      {request.followUps.length > 0 && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                          {request.followUps.length} follow-up{request.followUps.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Assigned Member */}
                    {assignedMember ? (
                      <div className="flex items-center gap-2 rounded-lg bg-[#FFB84D]/10 p-3">
                        <span className="text-2xl">{assignedMember.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{assignedMember.name}</p>
                          <p className="text-xs text-gray-600 truncate">{assignedMember.role}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border-2 border-dashed border-gray-300 p-3 text-center">
                        <p className="text-sm text-gray-500">Not assigned</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowAssignModal(true);
                          }}
                          className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {request.assignedTo ? 'Reassign' : 'Assign'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowFollowUpModal(true);
                          }}
                          className="flex-1 rounded-lg bg-[#FFB84D] px-4 py-2 text-sm font-medium text-white hover:bg-[#FFA726] transition-colors"
                        >
                          Follow Up
                        </button>
                      </div>
                      <select
                        value={request.status}
                        onChange={(e) => handleStatusChange(request.id, e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium focus:border-[#FFB84D] focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="praying">In Prayer</option>
                        <option value="answered">Answered</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New Request Modal */}
        {showNewRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">New Prayer Request</h2>
                <button onClick={() => setShowNewRequestModal(false)} className="text-3xl text-gray-400 hover:text-gray-600 leading-none">×</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Title *</label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    placeholder="Brief title for the prayer request"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={newRequest.requester}
                      onChange={(e) => setNewRequest({...newRequest, requester: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newRequest.email}
                      onChange={(e) => setNewRequest({...newRequest, email: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newRequest.category}
                      onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    >
                      <option>General</option>
                      <option>Health</option>
                      <option>Family</option>
                      <option>Career</option>
                      <option>Spiritual</option>
                      <option>Financial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newRequest.priority}
                      onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prayer Request Details *</label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                    placeholder="Share your prayer request in detail..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confidential"
                    checked={newRequest.isConfidential}
                    onChange={(e) => setNewRequest({...newRequest, isConfidential: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-[#FFB84D] focus:ring-[#FFB84D]"
                  />
                  <label htmlFor="confidential" className="text-sm text-gray-700">
                    Keep this request confidential (visible only to prayer team)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNewRequestModal(false)}
                    className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    disabled={!newRequest.title || !newRequest.requester || !newRequest.description}
                    className="flex-1 rounded-lg bg-[#FFB84D] px-6 py-3 font-medium text-white hover:bg-[#FFA726] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Assign Prayer Team</h2>
                <button onClick={() => setShowAssignModal(false)} className="text-3xl text-gray-400 hover:text-gray-600 leading-none">×</button>
              </div>

              <p className="mb-6 text-sm text-gray-600">
                Assign "{selectedRequest.title}" to a prayer team member
              </p>

              <div className="space-y-3">
                {TEAM_MEMBERS.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleAssign(member.id)}
                    className={`w-full flex items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-[#FFB84D] hover:bg-[#FFB84D]/5 ${
                      selectedRequest.assignedTo === member.id ? 'border-[#FFB84D] bg-[#FFB84D]/10' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-3xl">{member.avatar}</span>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    {selectedRequest.assignedTo === member.id && (
                      <span className="text-[#FFB84D] text-xl">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAssignModal(false)}
                className="mt-6 w-full rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Follow-Up Modal */}
        {showFollowUpModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Add Follow-Up</h2>
                <button onClick={() => {
                  setShowFollowUpModal(false);
                  setFollowUpNote('');
                }} className="text-3xl text-gray-400 hover:text-gray-600 leading-none">×</button>
              </div>

              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-800">{selectedRequest.title}</h3>
                <p className="text-sm text-gray-600 mt-1">by {selectedRequest.requester}</p>
              </div>

              {/* Previous Follow-Ups */}
              {selectedRequest.followUps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Previous Follow-Ups</h3>
                  <div className="space-y-3">
                    {selectedRequest.followUps.map((followUp, index) => (
                      <div key={index} className="rounded-lg border border-gray-200 bg-white p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-gray-800">{followUp.by}</p>
                          <p className="text-xs text-gray-500">{followUp.date}</p>
                        </div>
                        <p className="text-sm text-gray-700">{followUp.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-Up Note</label>
                <textarea
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  rows={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#FFB84D] focus:outline-none focus:ring-2 focus:ring-[#FFB84D]/20"
                  placeholder="Share an update, testimony, or continued prayer points..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowFollowUpModal(false);
                    setFollowUpNote('');
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFollowUp}
                  disabled={!followUpNote.trim()}
                  className="flex-1 rounded-lg bg-[#FFB84D] px-6 py-3 font-medium text-white hover:bg-[#FFA726] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Follow-Up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerRequestsPage;
