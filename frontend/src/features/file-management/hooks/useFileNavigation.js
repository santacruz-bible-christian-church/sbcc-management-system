import { useState, useCallback } from 'react';

/**
 * Hook for managing breadcrumb navigation in file management
 */
export const useFileNavigation = ({ categories, setFilters, setSelectedMeeting }) => {
  const [currentCategory, setCurrentCategory] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Meeting Minutes' }]);

  // Handle category (folder) click
  const handleFolderClick = useCallback((categoryId) => {
    const category = categories.find((c) => c.value === categoryId);
    if (category) {
      setCurrentCategory(categoryId);
      setFilters((prev) => ({ ...prev, category: categoryId }));
      setBreadcrumbs((prev) => [...prev, { id: categoryId, name: category.label, type: 'category' }]);
    }
  }, [categories, setFilters]);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((crumb) => {
    const index = breadcrumbs.findIndex((b) => b.id === crumb.id);
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);

    if (crumb.id === null) {
      setCurrentCategory(null);
      setViewingMeeting(false);
      setSelectedMeeting(null);
      setFilters((prev) => ({ ...prev, category: null }));
    } else if (crumb.type === 'category') {
      setCurrentCategory(crumb.id);
      setViewingMeeting(false);
      setSelectedMeeting(null);
      setFilters((prev) => ({ ...prev, category: crumb.id }));
    }
  }, [breadcrumbs, setFilters, setSelectedMeeting]);

  // Handle filter change (from dropdown)
  const handleFilterChange = useCallback((value) => {
    if (value) {
      const category = categories.find((c) => c.value === value);
      if (category) {
        setCurrentCategory(value);
        setFilters((prev) => ({ ...prev, category: value }));
        setBreadcrumbs([
          { id: null, name: 'Meeting Minutes' },
          { id: value, name: category.label, type: 'category' }
        ]);
      }
    } else {
      setCurrentCategory(null);
      setFilters((prev) => ({ ...prev, category: null }));
      setBreadcrumbs([{ id: null, name: 'Meeting Minutes' }]);
    }
  }, [categories, setFilters]);

  // Handle clear filter
  const handleClearFilter = useCallback((refetch) => {
    setCurrentCategory(null);
    setFilters({ category: null, search: '' });
    setBreadcrumbs([{ id: null, name: 'Meeting Minutes' }]);
    setViewingMeeting(false);
    setSelectedMeeting(null);
    refetch();
  }, [setFilters, setSelectedMeeting]);

  return {
    currentCategory,
    viewingMeeting,
    breadcrumbs,
    setCurrentCategory,
    setViewingMeeting,
    setBreadcrumbs,
    handleFolderClick,
    handleBreadcrumbClick,
    handleFilterChange,
    handleClearFilter,
  };
};

export default useFileNavigation;
