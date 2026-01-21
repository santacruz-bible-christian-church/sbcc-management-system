import { useState, useCallback, useMemo } from 'react';
import { membersApi } from '../../../api/members.api';
import { showError, showSuccess } from '../../../utils/toast';

/**
 * Hook for managing multi-select and bulk actions
 * Extracted to reduce page component complexity
 */
export function useMembersBulkActions({ members, refreshMembers, pagination }) {
  // Selection mode toggle
  const [selectionMode, setSelectionMode] = useState(false);

  // Selected member IDs
  const [selectedIds, setSelectedIds] = useState([]);

  // Bulk action loading state
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Bulk confirmation modals
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false);

  // Calculate if all current page members are selected
  const allSelected = useMemo(() => {
    if (members.length === 0) return false;
    return members.every((member) => selectedIds.includes(member.id));
  }, [members, selectedIds]);

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) setSelectedIds([]);
      return !prev;
    });
  }, []);

  // Handle individual selection
  const handleSelect = useCallback((memberId, isSelected) => {
    setSelectedIds((prev) =>
      isSelected ? [...prev, memberId] : prev.filter((id) => id !== memberId)
    );
  }, []);

  // Handle select all on current page
  const handleSelectAll = useCallback((selectAll) => {
    const currentPageIds = members.map((m) => m.id);
    setSelectedIds((prev) =>
      selectAll
        ? [...prev, ...currentPageIds.filter((id) => !prev.includes(id))]
        : prev.filter((id) => !currentPageIds.includes(id))
    );
  }, [members]);

  // Clear selection
  const clearSelection = useCallback(() => setSelectedIds([]), []);

  // Bulk archive
  const handleBulkArchive = useCallback(async () => {
    setBulkActionLoading(true);
    try {
      await membersApi.bulkArchive(selectedIds);
      showSuccess(`Successfully archived ${selectedIds.length} members`);
      setSelectedIds([]);
      setSelectionMode(false);
      await refreshMembers(pagination.currentPage);
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to archive members');
    } finally {
      setBulkActionLoading(false);
      setBulkArchiveOpen(false);
    }
  }, [selectedIds, refreshMembers, pagination.currentPage]);

  // Bulk delete - NOW USES SINGLE API CALL
  const handleBulkDelete = useCallback(async () => {
    setBulkActionLoading(true);
    const count = selectedIds.length;
    
    try {
      // ✅ Single API call instead of N separate requests
      const result = await membersApi.bulkDelete(selectedIds);
      
      showSuccess(`Successfully deleted ${selectedIds.length} members`);
      setSelectedIds([]);
      setSelectionMode(false);
      
      // Handle pagination - if current page might be empty, go to page 1
      const remainingOnPage = members.length - result.deleted_count;
      if (remainingOnPage <= 0 && pagination.currentPage > 1) {
        await refreshMembers(1);
      } else {
        await refreshMembers(pagination.currentPage);
      }
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to delete members');
    } finally {
      setBulkActionLoading(false);
      setBulkDeleteOpen(false);
    }
  }, [selectedIds, members.length, refreshMembers, pagination.currentPage]);

  return {
    // State
    selectionMode,
    selectedIds,
    allSelected,
    bulkActionLoading,
    bulkDeleteOpen,
    bulkArchiveOpen,

    // Setters
    setBulkDeleteOpen,
    setBulkArchiveOpen,

    // Handlers
    toggleSelectionMode,
    handleSelect,
    handleSelectAll,
    clearSelection,
    handleBulkArchive,
    handleBulkDelete,
  };
}

export default useMembersBulkActions;
