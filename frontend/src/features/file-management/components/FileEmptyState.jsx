import { HiFolder } from 'react-icons/hi';

export const FileEmptyState = ({ viewingMeeting, onCreateNew }) => {
  return (
    <div className="text-center py-12">
      <HiFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {viewingMeeting ? 'No attachments' : 'No meeting minutes yet'}
      </h3>
      <p className="text-gray-500 mb-4">
        {viewingMeeting
          ? 'Upload files to this meeting record'
          : 'Create your first meeting minutes to get started'
        }
      </p>
      <button
        onClick={viewingMeeting ? undefined : onCreateNew}
        className="px-4 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#F6A635] transition-colors"
      >
        {viewingMeeting ? 'Upload File' : 'Create Meeting Minutes'}
      </button>
    </div>
  );
};

export default FileEmptyState;
