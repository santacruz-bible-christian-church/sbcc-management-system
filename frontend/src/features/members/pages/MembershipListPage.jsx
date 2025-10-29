import { useCallback, useState } from 'react';
import { Spinner } from 'flowbite-react';
import { HiOutlinePlus } from 'react-icons/hi';
import { FaSliders } from 'react-icons/fa6';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMembers } from '../hooks/useMembers';
import { MemberTable } from '../components/MemberTable';
import { ConfirmationModal } from '../../../components/ui/Modal';

const MANAGER_ROLES = ['admin', 'pastor', 'staff'];

export const MembershipListPage = () => {
  const { user } = useAuth();
  const canManage = MANAGER_ROLES.includes(user?.role);

  const {
    members,
    loading,
    error,
    filters,
    search,
    setFilters,
    setSearch,
    resetFilters,
    deleteMember,
  } = useMembers();

  const [searchDraft, setSearchDraft] = useState(search);
  const [deleteState, setDeleteState] = useState({ open: false, member: null });

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    setSearch(searchDraft.trim());
  }, [searchDraft, setSearch]);

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, [setFilters]);

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setSearchDraft('');
  }, [resetFilters]);

  const openDeleteModal = useCallback((member) => {
    setDeleteState({ open: true, member });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteState({ open: false, member: null });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState.member) return;

    let cancelled = false;

    try {
      await deleteMember(deleteState.member.id);
      if (!cancelled) {
        closeDeleteModal();
      }
    } catch (err) {
      if (!cancelled) {
        console.error('Delete member error:', err);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [deleteState.member, deleteMember, closeDeleteModal]);

  const handleCreateMember = useCallback(() => {
    // TODO: Open create modal
  }, []);

  const handleEditMember = useCallback((member) => {
    // TODO: Open edit modal with member data
    console.log('Edit member:', member);
  }, []);

  const handleViewDetails = useCallback((member) => {
    // TODO: Open details modal with member data
    console.log('View member:', member);
  }, []);

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <p className="text-[15px] text-[#A0A0A0] leading-none mb-1">
          Pages/Membership
        </p>
        <h1 className="text-[30px] text-[#383838] leading-none font-bold">
          Member List
        </h1>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 mb-6">
        {/* Add Button */}
        {canManage && (
          <button
            className="border rounded-lg p-3 bg-[#FDB54A] text-white hover:bg-[#e5a43b] transition-colors flex items-center justify-center"
            onClick={handleCreateMember}
            aria-label="Add new member"
          >
            <HiOutlinePlus className="w-5 h-5" />
          </button>
        )}

        {/* Search Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg">
          <div className="relative rounded-lg h-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" aria-hidden="true">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="block w-full h-full ps-10 text-sm text-[#383838] placeholder:text-[#A0A0A0] rounded-lg bg-gray-50 focus:ring-[#FDB54A] border-none focus:border-[#FDB54A]"
              placeholder="Search members..."
              aria-label="Search members"
            />
            <button
              type="submit"
              className="text-white absolute end-0 bottom-0 h-full bg-[#FDB54A] hover:bg-[#e5a43b] focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-l-none rounded-r-lg border-none text-sm px-8"
              aria-label="Submit search"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Section */}
        <div className="flex-1 flex shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg">
          {/* Filter Icon */}
          <button
            className="p-3 text-[#FDB54A] hover:bg-gray-50 flex items-center justify-center transition-colors"
            type="button"
            aria-label="Filter options"
          >
            <FaSliders className="w-5 h-5" />
          </button>

          {/* Gender Dropdown */}
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="flex-1 text-[#383838] border rounded-full bg-white text-sm m-2 px-3 focus:ring-[#FDB54A] focus:border-[#FDB54A]"
            aria-label="Filter by gender"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Ministry Dropdown */}
          <select
            value={filters.ministry}
            onChange={(e) => handleFilterChange('ministry', e.target.value)}
            className="flex-1 text-[#383838] border rounded-full bg-white text-sm m-2 px-3 focus:ring-[#FDB54A] focus:border-[#FDB54A]"
            aria-label="Filter by ministry"
          >
            <option value="">Ministry</option>
            <option value="1">Music Ministry</option>
            <option value="2">Media Ministry</option>
            <option value="3">Worship Ministry</option>
            <option value="4">Youth Ministry</option>
          </select>

          {/* Clear Button */}
          <button
            onClick={handleClearFilters}
            className="text-white bg-[#FDB54A] hover:bg-[#e5a43b] focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-l-none rounded-r-lg border-none text-sm px-8 m-0 transition-colors"
            type="button"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Members Table */}
      {loading && members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="xl" />
          <p className="mt-3 text-[#A0A0A0]">Loading members...</p>
        </div>
      ) : (
        <MemberTable
          members={members}
          canManage={canManage}
          onEdit={handleEditMember}
          onDelete={openDeleteModal}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteState.open}
        title="Delete Member?"
        message={`Are you sure you want to delete ${deleteState.member?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
        loading={loading}
      />
    </div>
  );
};

export default MembershipListPage;
