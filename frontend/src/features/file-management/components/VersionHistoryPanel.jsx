import { useState } from 'react';
import PropTypes from 'prop-types';
import { HiClock, HiRefresh, HiEye, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { format } from 'date-fns';

export const VersionHistoryPanel = ({
  versions = [],
  currentContent,
  onRestore,
  loading = false,
}) => {
  const [expandedVersion, setExpandedVersion] = useState(null);
  const [restoringVersion, setRestoringVersion] = useState(null);

  const handleRestore = async (versionNumber) => {
    if (!onRestore) return;

    try {
      setRestoringVersion(versionNumber);
      await onRestore(versionNumber);
    } finally {
      setRestoringVersion(null);
    }
  };

  const toggleExpand = (versionNumber) => {
    setExpandedVersion(expandedVersion === versionNumber ? null : versionNumber);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FDB54A]"></div>
        <span className="ml-3 text-gray-600">Loading version history...</span>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-12">
        <HiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No version history</h3>
        <p className="text-gray-500">
          Version history will appear here after you make changes to the meeting notes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <HiClock className="w-5 h-5 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">
          {versions.length} version{versions.length !== 1 ? 's' : ''} saved
        </h3>
      </div>

      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.version_number}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Version Header */}
            <div
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleExpand(version.version_number)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FDB54A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {version.version_number}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Version {version.version_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {version.created_at
                      ? format(new Date(version.created_at), 'MMM d, yyyy h:mm a')
                      : 'Unknown date'}
                    {version.changed_by_name && (
                      <span> • by {version.changed_by_name}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {version.change_summary && (
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {version.change_summary}
                  </span>
                )}
                {expandedVersion === version.version_number ? (
                  <HiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <HiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedVersion === version.version_number && (
              <div className="p-4 border-t border-gray-200">
                {/* Content Preview */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Content at this version:
                  </label>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {version.content || 'No content'}
                    </pre>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRestore(version.version_number)}
                    disabled={restoringVersion === version.version_number}
                    className="flex items-center gap-2 px-3 py-2 bg-[#FDB54A] text-white text-sm rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 transition-colors"
                  >
                    <HiRefresh className={`w-4 h-4 ${restoringVersion === version.version_number ? 'animate-spin' : ''}`} />
                    {restoringVersion === version.version_number ? 'Restoring...' : 'Restore this version'}
                  </button>
                </div>

                {/* Diff indicator */}
                {currentContent && version.content !== currentContent && (
                  <p className="mt-3 text-xs text-amber-600 flex items-center gap-1">
                    <HiEye className="w-4 h-4" />
                    This version differs from the current content
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

VersionHistoryPanel.propTypes = {
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      version_number: PropTypes.number.isRequired,
      content: PropTypes.string,
      changed_by_name: PropTypes.string,
      change_summary: PropTypes.string,
      created_at: PropTypes.string,
    })
  ),
  currentContent: PropTypes.string,
  onRestore: PropTypes.func,
  loading: PropTypes.bool,
};

export default VersionHistoryPanel;
