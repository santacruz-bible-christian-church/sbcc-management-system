import { HiOutlineArchive, HiOutlineTrash } from 'react-icons/hi';

/**
 * BulkActionsBar - Toolbar for bulk member actions
 * Shown when members are selected in selection mode
 */
export function BulkActionsBar({
  selectedCount,
  onArchive,
  onDelete,
  onClearSelection,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="p-4 bg-[#FFF8E7] border border-[#FDB54A] rounded-xl flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-[#383838] font-medium">
          {selectedCount} member{selectedCount > 1 ? 's' : ''} selected
        </span>
        <button
          onClick={onClearSelection}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear selection
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onArchive}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF9800] text-white rounded-lg hover:bg-[#e68900] transition-colors"
        >
          <HiOutlineArchive className="w-5 h-5" />
          Archive Selected
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2 bg-[#E55050] text-white rounded-lg hover:bg-[#d13e3e] transition-colors"
        >
          <HiOutlineTrash className="w-5 h-5" />
          Delete Selected
        </button>
      </div>
    </div>
  );
}

export default BulkActionsBar;
