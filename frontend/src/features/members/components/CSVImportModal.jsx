import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineUpload, HiOutlineDocumentText, HiX, HiOutlineDownload } from 'react-icons/hi';
import { showWarning } from '../../../utils/toast';

// Sample CSV template data
const SAMPLE_CSV_CONTENT = `first_name,last_name,email,phone,gender,date_of_birth,baptism_date,address
Juan,Dela Cruz,juan.delacruz@example.com,0917-123-4567,male,1990-05-15,2010-12-25,123 Main St. Quezon City
Maria,Santos,maria.santos@example.com,0918-234-5678,female,1985-03-20,2008-06-10,456 Church Ave. Manila
Pedro,Garcia,pedro.garcia@example.com,0919-345-6789,male,1995-11-08,,789 Faith Rd. Makati
Ana,Reyes,ana.reyes@example.com,0920-456-7890,female,2000-07-22,2020-01-15,321 Hope St. Pasig`;

const downloadSampleCSV = () => {
  const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sbcc_members_import_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const CSVImportModal = ({ open, onClose, onImport, loading }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        showWarning('Please upload a CSV file');
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        showWarning('Please upload a CSV file');
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      showWarning('Please select a file');
      return;
    }
    await onImport(file);
    setFile(null);
  };

  const handleCancel = () => {
    setFile(null);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Import Members from CSV
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">CSV Format Requirements:</h4>
              <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
                <li>First row must contain column headers</li>
                <li><strong>Required:</strong> first_name, last_name, email, date_of_birth</li>
                <li><strong>Optional:</strong> phone, gender, baptism_date, address</li>
                <li>Date format: YYYY-MM-DD (e.g., 1990-05-15)</li>
                <li>Gender: male, female, or other</li>
              </ul>
            </div>

            {/* File Upload Area */}
            <form
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className="relative"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
                disabled={loading}
              />

              <div
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  dragActive
                    ? 'border-[#FDB54A] bg-yellow-50'
                    : 'border-gray-300 hover:border-[#FDB54A] hover:bg-gray-50'
                }`}
              >
                {file ? (
                  <div className="space-y-3">
                    <HiOutlineDocumentText className="w-12 h-12 mx-auto text-[#FDB54A]" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    {!loading && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <HiOutlineUpload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="text-[#FDB54A] font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Sample CSV Download Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={downloadSampleCSV}
                className="inline-flex items-center gap-2 text-sm text-[#FDB54A] hover:text-[#e5a43b] hover:underline transition-colors"
              >
                <HiOutlineDownload className="w-4 h-4" />
                Download sample CSV template
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="px-4 py-2 bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

CSVImportModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CSVImportModal;
