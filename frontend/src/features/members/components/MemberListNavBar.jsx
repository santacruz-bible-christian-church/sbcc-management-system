import { PrimaryButton } from '../../../components/ui/Button';
import { FaSliders } from "react-icons/fa6";
import { useState, useRef, useEffect } from 'react';
import { membersApi } from '../../../api/members.api';
import { HiOutlinePlus, HiOutlineUpload } from 'react-icons/hi';
import CSVImportModal from './CSVImportModal';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMinistries } from '../../ministries/hooks/useMinistries';
import { showSuccess, showError } from '../../../utils/toast';

const MANAGER_ROLES = ['admin', 'pastor', 'ministry_leader'];

export const MemberListNavBar = ({
    pagination,
    refreshMembers,
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    onCreateClick  // ← New prop from parent
}) => {
    const [isGenderOpen, setGenderIsOpen] = useState(false)
    const [MinistryIsOpen, setMinistryIsOpen] = useState(false)
    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const [importing, setImporting] = useState(false);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const { user } = useAuth();
    const canManage = MANAGER_ROLES.includes(user?.role);
    const { ministries, loading: ministriesLoading } = useMinistries();
    const [selectedMinistryName, setSelectedMinistryName] = useState('');

    const GenderDropdownRef = useRef(null);
    const MinistryDropdownRef = useRef(null);
    const StatusDropdownRef = useRef(null);

    const handleCSVImport = async (file) => {
        setImporting(true);
        try {
            await membersApi.importCSV(file);
            await refreshMembers(pagination.currentPage);
            showSuccess('Members imported successfully!');
            setCsvModalOpen(false);
        } catch (err) {
            console.error('CSV import error:', err);
            showError(err.response?.data?.detail || 'Failed to import CSV');
        } finally {
            setImporting(false);
        }
    };

    const handleClear = () => {
        handleSelectGender('')
        handleSelectStatus('')
        handleSelectMinistry('', '')
        setSelectedMinistryName('');
        setIsStatusOpen(false);
        setGenderIsOpen(false);
        setMinistryIsOpen(false);
    }

    const handleSelectGender = (value) => {
        setFilters(prev => ({ ...prev, gender: value }));
        setGenderIsOpen(false);
    };

    const handleSelectMinistry = (id, name) => {
        setFilters(prev => ({ ...prev, ministry: id }));
        setSelectedMinistryName(name);
        setMinistryIsOpen(false);
    };

    const handleSelectStatus = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        setIsStatusOpen(false);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (GenderDropdownRef.current && !GenderDropdownRef.current.contains(event.target)) {
                setGenderIsOpen(false);
            }
            if (StatusDropdownRef.current && !StatusDropdownRef.current.contains(event.target)) {
                setIsStatusOpen(false)
            }
            if (MinistryDropdownRef.current && !MinistryDropdownRef.current.contains(event.target)) {
                setMinistryIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className='flex justify-around gap-3 [@media(max-width:1100px)]:flex-col'>
            <div className="flex w-[60%] justify-between [@media(max-width:1100px)]:w-[100%]">
                {/* add members/ upload csv section */}
                {canManage && (
                    <div className="flex gap-2">
                        <button
                            className="rounded-lg p-3 bg-[#FDB54A] text-white hover:bg-[#e5a43b] transition-colors flex items-center justify-center"
                            onClick={onCreateClick}
                            title="Add new member"
                            aria-label="Add new member"
                        >
                            <HiOutlinePlus className="w-5 h-5" />
                        </button>

                        <button
                            className="rounded-lg p-3 bg-[#4CAF50] text-white hover:bg-[#45a049] transition-colors flex items-center justify-center"
                            onClick={() => setCsvModalOpen(true)}
                            title="Import CSV"
                            aria-label="Import members from CSV"
                        >
                            <HiOutlineUpload className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* search section */}
                <div className="w-[75%] [@media(max-width:1100px)]:w-[90%] ml-3 shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg">
                    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
                    <div className="relative rounded-lg h-full">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="default-search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="block w-full h-full bottom-0 ps-10 text-sm text-[#A0A0A0] rounded-lg bg-gray-50 focus:ring-yellow-500 border-none focus:border-yellow-500"
                            placeholder="Search..."
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* filter section */}
            <div className='w-[60%] [@media(max-width:1100px)]:w-[100%] flex justify-between shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg'>
                <PrimaryButton className="text-[#FDB54A]">
                    <FaSliders />
                </PrimaryButton>

                {/* Status Dropdown */}
                <div className="pt-1 w-[30%]" ref={StatusDropdownRef}>
                    <button
                        id="dropdownDefaultButton"
                        className="w-[90%] text-[#A0A0A0] border rounded-full bg-white text-sm m-2 pl-3 pr-3 text-center flex justify-between items-center"
                        type="button"
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                    >
                        <div className="truncate">
                            {filters.status ? filters.status.charAt(0).toUpperCase() + filters.status.slice(1) : 'All Status'}
                        </div>
                        <svg className={`w-2.5 h-2.5 ms-3 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 4 4 4-4"
                            />
                        </svg>
                    </button>

                    {isStatusOpen && (
                        <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-sm w-[100px]">
                            <ul className="py-2 text-sm text-gray-700 divide-y divide-gray-200">
                                <li>
                                    <button
                                        onClick={() => handleSelectStatus('')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        All Status
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleSelectStatus('active')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        Active
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleSelectStatus('inactive')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        Inactive
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleSelectStatus('archived')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        Archived
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Gender Dropdown */}
                <div className="pt-1 w-[30%]" ref={GenderDropdownRef}>
                    <button
                        id="genderDropdownButton"
                        className="w-[90%] text-[#A0A0A0] border rounded-full bg-white text-sm m-2 pl-3 pr-3 text-center flex justify-between items-center"
                        type="button"
                        onClick={() => setGenderIsOpen(!isGenderOpen)}
                    >
                        {filters.gender ? filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1) : 'Gender'}
                        <svg className={`w-2.5 h-2.5 ms-3 transition-transform duration-200 ${isGenderOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 4 4 4-4"
                            />
                        </svg>
                    </button>

                    {isGenderOpen && (
                        <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-sm w-[100px]">
                            <ul className="py-2 text-sm text-gray-700 divide-y divide-gray-200">
                                <li>
                                    <button
                                        onClick={() => handleSelectGender('')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        All
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleSelectGender('male')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        Male
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleSelectGender('female')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        Female
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Ministry Dropdown */}
                <div className='pt-1 w-[30%]' ref={MinistryDropdownRef}>
                    <button
                        id="ministryDropdownButton"
                        className="w-[90%] text-[#A0A0A0] border rounded-full bg-white text-sm m-2 pl-3 pr-3 text-center flex justify-between items-center"
                        type="button"
                        onClick={() => setMinistryIsOpen(!MinistryIsOpen)}
                    >
                        <span className="truncate overflow-hidden text-ellipsis w-[50px]">
                            {selectedMinistryName || 'Ministry'}
                        </span>
                        <svg className={`w-2.5 h-2.5 ms-3 transition-transform duration-200 ${MinistryIsOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m1 1 4 4 4-4"
                            />
                        </svg>
                    </button>

                    {MinistryIsOpen && (
                        <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-[140px]">
                            <ul className="py-2 text-sm text-gray-700 divide-y divide-gray-100">
                                <li>
                                    <button
                                        onClick={() => handleSelectMinistry('', '')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        All
                                    </button>
                                </li>

                                {!ministriesLoading && ministries?.map((ministry) => (
                                    <li key={ministry.id}>
                                        <button
                                            onClick={() => handleSelectMinistry(ministry.id, ministry.name)}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                            {ministry.name.charAt(0).toUpperCase() + ministry.name.slice(1)}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Clear Button */}
                <button
                    className="w-[20%] rounded-lg p-3 bg-[#FDB54A] text-white hover:bg-[#e5a43b] transition-colors flex items-center justify-center"
                    onClick={handleClear}
                    title="Clear filters"
                    aria-label="Clear filters"
                >
                    Clear
                </button>
            </div>

            <CSVImportModal
                open={csvModalOpen}
                onClose={() => setCsvModalOpen(false)}
                onImport={handleCSVImport}
                loading={importing}
            />
        </div>
    )
}
