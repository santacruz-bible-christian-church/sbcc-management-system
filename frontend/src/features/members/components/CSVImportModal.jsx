import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { HiOutlineUpload, HiOutlineDocumentText, HiX, HiOutlineDownload, HiCheckCircle } from 'react-icons/hi';
import { showWarning } from '../../../utils/toast';

// Updated Sample CSV template with all new fields
const SAMPLE_CSV_CONTENT = `first_name,last_name,email,phone,gender,date_of_birth,complete_address,occupation,marital_status,wedding_anniversary,elementary_school,elementary_year_graduated,secondary_school,secondary_year_graduated,vocational_school,vocational_year_graduated,college,college_year_graduated,accepted_jesus,salvation_testimony,spiritual_birthday,baptism_date,willing_to_be_baptized,previous_church,how_introduced,began_attending_since,is_active
Juan,Dela Cruz,juan.delacruz@example.com,0917-123-4567,male,1990-05-15,"123 Main St. Quezon City",Software Engineer,married,2015-06-20,ABC Elementary,2002,XYZ High School,2008,,"",University of the Philippines,2014,true,"Accepted Christ at a youth camp in 2005",2005-07-15,2010-12-25,false,First Baptist Church Manila,Invited by a friend,2018-01-10,true
Maria,Santos,maria.santos@example.com,0918-234-5678,female,1985-03-20,"456 Church Ave. Manila",Teacher,single,,"",,"DEF High School",2003,"Tech Institute",2005,"",2009,true,"Found Jesus through Bible study",2008-03-15,2008-06-10,false,"","Found online",2015-05-20,true
Pedro,Garcia,pedro.garcia@example.com,0919-345-6789,male,1995-11-08,"789 Faith Rd. Makati",Business Owner,divorced,,"GHI Elementary",2007,"JKL High School",2013,"","","Ateneo de Manila",2017,true,"Testimony here...",2012-08-20,"",true,"","Passing by the church",2019-03-15,true
Ana,Reyes,ana.reyes@example.com,0920-456-7890,female,2000-07-22,"321 Hope St. Pasig",Student,single,,"","MNO High School",2018,"",,"","University of Santo Tomas - Currently Enrolled",2022,false,"","","",false,"","Invited by family member",2020-01-15,true`;

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
  const [showDetails, setShowDetails] = useState(false);
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
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Import Members
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload a CSV file to import multiple members
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSV File
                </label>
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
                    className={`border-2  border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    } ${
                      dragActive
                        ? 'border-[#FDB54A] bg-orange-50'
                        : file
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {file ? (
                      <div className="space-y-3">
                        <HiCheckCircle className="w-12 h-12 mx-auto text-green-600" />
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
                            className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors"
                          >
                            Remove file
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <HiOutlineUpload className="w-12 h-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="text-[#FDB54A] font-medium">Choose a file</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Required Fields Notice */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Required Fields</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    <span>First Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    <span>Last Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    <span>Email Address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    <span>Phone Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                    <span>Date of Birth</span>
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full text-left py-2 hover:text-gray-900 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700">
                    Optional Fields & Formatting Guide
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDetails && (
                  <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-200">
                    {/* Personal Information */}
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Personal Information
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex justify-between">
                          <span>Gender</span>
                          <span className="text-gray-400 text-xs">male, female, other</span>
                        </li>
                        <li>Complete Address</li>
                        <li>Occupation</li>
                        <li className="flex justify-between">
                          <span>Marital Status</span>
                          <span className="text-gray-400 text-xs">single, married, divorced, etc.</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Wedding Anniversary</span>
                          <span className="text-gray-400 text-xs">YYYY-MM-DD</span>
                        </li>
                      </ul>
                    </div>

                    {/* Educational Background */}
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Educational Background
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Elementary School & Year Graduated</li>
                        <li>Secondary School & Year Graduated</li>
                        <li>Vocational School & Year Graduated</li>
                        <li>College/University & Year Graduated</li>
                      </ul>
                    </div>

                    {/* Spiritual Information */}
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Spiritual Information
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex justify-between">
                          <span>Accepted Jesus</span>
                          <span className="text-gray-400 text-xs">true/false</span>
                        </li>
                        <li>Salvation Testimony</li>
                        <li className="flex justify-between">
                          <span>Spiritual Birthday</span>
                          <span className="text-gray-400 text-xs">YYYY-MM-DD</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Baptism Date</span>
                          <span className="text-gray-400 text-xs">YYYY-MM-DD</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Willing to be Baptized</span>
                          <span className="text-gray-400 text-xs">true/false</span>
                        </li>
                      </ul>
                    </div>

                    {/* Church Background */}
                    <div>
                      <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Church Background
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Previous Church</li>
                        <li>How Introduced to Church</li>
                        <li className="flex justify-between">
                          <span>Began Attending Since</span>
                          <span className="text-gray-400 text-xs">YYYY-MM-DD</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Active Status</span>
                          <span className="text-gray-400 text-xs">true/false (default: true)</span>
                        </li>
                      </ul>
                    </div>

                    {/* Formatting Notes */}
                    <div className="pt-3 border-t border-gray-200">
                      <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                        Formatting Notes
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Dates must use format: YYYY-MM-DD</li>
                        <li>• Phone format: 0912-345-6789</li>
                        <li>• Use quotes for text containing commas</li>
                        <li>• Empty fields: use "" (empty string)</li>
                        <li>• First row must be column headers</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Download Template Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="inline-flex items-center gap-2 text-sm text-[#FDB54A] hover:text-[#e5a43b] font-medium transition-colors"
                >
                  <HiOutlineDownload className="w-4 h-4" />
                  Download CSV Template
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="px-5 py-2 text-sm font-medium bg-[#FDB54A] text-white rounded-lg hover:bg-[#e5a43b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                <>
                  <HiOutlineUpload className="w-4 h-4" />
                  Import Members
                </>
              )}
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
