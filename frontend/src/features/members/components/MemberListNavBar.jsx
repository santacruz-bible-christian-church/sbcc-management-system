import { PrimaryButton, SecondaryButton, IconButton } from '../../../components/ui/Button';
import { FaSliders } from "react-icons/fa6";
import { useState, useRef, useEffect, useCallback } from 'react';
import { membersApi } from '../../../api/members.api';
import { HiOutlinePlus, HiOutlineUpload } from 'react-icons/hi';
import CSVImportModal from './CSVImportModal';
import { useAuth } from '../../auth/hooks/useAuth';
import { MemberFormModal } from '../components/MemberFormModal';
import { useMinistries } from '../../ministries/hooks/useMinistries';

const MANAGER_ROLES = ['admin', 'pastor', 'ministry_leader'];

export const MemberListNavBar = ({ pagination, refreshMembers, filters, setFilters, searchTerm, setSearchTerm, createMember, updateMember }) => {
    const [isGenderOpen, setGenderIsOpen] = useState(false)
    const [MinistryIsOpen, setMinistryIsOpen] = useState(false)
    const [isStatusOpen, setIsStatusOpen] = useState(false)
    const [importing, setImporting] = useState(false);
    const [csvModalOpen, setCsvModalOpen] = useState(false);
    const { user } = useAuth();
    const canManage = MANAGER_ROLES.includes(user?.role);
    const [formModalState, setFormModalState] = useState({ open: false, member: null });
    const [formLoading, setFormLoading] = useState(false);
    const { ministries, loading: ministriesLoading } = useMinistries();

    const GenderDropdownRef = useRef(null);
    const MinistryDropdownRef = useRef(null);
    const StatusDropdownRef = useRef(null);

    const handleCSVImport = async (file) => {
        setImporting(true);
        try {
            await membersApi.importCSV(file);
            await refreshMembers(pagination.currentPage); // refresh the list
            alert('Members imported successfully!');
            setCsvModalOpen(false); // close the modal
        } catch (err) {
            console.error('CSV import error:', err);
            alert(err.response?.data?.detail || 'Failed to import CSV');
        } finally {
            setImporting(false);
        }
    };


    const handleSelectGender = (value) => {
        setFilters(prev => ({ ...prev, gender: value }));
        setGenderIsOpen(false);
    };

    const handleSelectMinistry = (value) => {
        setFilters(prev => ({ ...prev, ministry: value }));
        setMinistryIsOpen(false);
    };

    const handleSelectStatus = (value) => {
        setFilters(prev => ({ ...prev, status: value }));
        setIsStatusOpen(false);
    };

    const handleCreateMember = useCallback(() => {
        setFormModalState({ open: true, member: null });
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        setSearch(searchTerm);
        e.preventDefault();
    };

    const closeFormModal = useCallback(() => {
        setFormModalState({ open: false, member: null });
    }, []);

    const handleFormSubmit = useCallback(async (formData) => {
        setFormLoading(true);
        try {
            if (formModalState.member) {
                // Update existing member
                await updateMember(formModalState.member.id, formData);
            } else {
                // Create new member
                await createMember(formData);
            }
            closeFormModal();
        } catch (err) {
            console.error('Form submit error:', err);
            alert(err.response?.data?.detail || 'Failed to save member');
        } finally {
            setFormLoading(false);
        }
    }, [formModalState.member, createMember, updateMember, closeFormModal]);

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


            <div class="flex w-[60%] justify-between [@media(max-width:1100px)]:w-[100%]">
                {/* add members/ upload csv section */}
                {canManage && (
                    <div className="flex gap-2">

                        <button
                            className="rounded-lg p-3 bg-[#FDB54A] text-white hover:bg-[#e5a43b] transition-colors flex items-center justify-center"
                            onClick={handleCreateMember}
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
                <form class="w-[75%] [@media(max-width:1100px)]:w-[90%] ml-3 shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg"
                    onSubmit={handleSearchSubmit}>
                    <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                    <div class="relative rounded-lg h-full">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input type="search" id="default-search" value={searchTerm}
                            onChange={handleSearchChange} class="block w-full h-full bottom-0 ps-10 text-sm text-[#A0A0A0] rounded-lg bg-gray-50 focus:ring-yellow-500 border-none focus:border-yellow-500" placeholder="Search... " required
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-[90px] flex items-center px-2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}

                        <button type="submit" class="text-white absolute end-0 bottom-0 h-full  bg-[#FDB54A] hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-l-none rounded-r-lg border-none text-sm px-5 py-[8.5px]">Search</button>
                    </div>
                </form>
            </div>


            {/* filter section */}
            <div className=' w-[60%] [@media(max-width:1100px)]:w-[100%] flex justify-between shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg'>
                <PrimaryButton className="text-[#FDB54A]">
                    <FaSliders />
                </PrimaryButton>

                {/* Status Dropdown */}
                <div className="pt-1 w-[30%] " ref={StatusDropdownRef}>
                    <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" class="w-[90%] text-[#A0A0A0] border rounded-full bg-white rounded-full text-sm m-2 pl-3 pr-3 text-center flex justify-between items-center" type="button"
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                    >
                        <div class="truncate">
                            {filters.status ? filters.status.charAt(0).toUpperCase() + filters.status.slice(1) : 'All Status'}
                        </div>
                        <svg className={`w-2.5 h-2.5 ms-3" transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}


                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 1 4 4 4-4"
                            />
                        </svg>
                    </button>

                    {/*  Dropdown menu */}
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
                        </ div>
                    )}
                </div>





                {/* Gender Dropdown */}
                <div className="pt-1 w-[30%] " ref={GenderDropdownRef}>
                    <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" class=" w-[90%] text-[#A0A0A0] border rounded-full bg-white rounded-full text-sm m-2 pl-3 pr-3 text-center flex justify-between items-center" type="button"
                        onClick={() => setGenderIsOpen(!isGenderOpen)}
                    >
                        {filters.gender ? filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1) : 'Gender'}
                        <svg className={`w-2.5 h-2.5 ms-3" transition-transform duration-200 ${isGenderOpen ? 'rotate-180' : ''}`}


                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 1 4 4 4-4"
                            />
                        </svg>
                    </button>



                    {/*  Dropdown menu */}
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
                        </ div>
                    )}
                </div>


                {/* Ministry Dropdown */}
                <div className='pt-1 w-[30%]' ref={MinistryDropdownRef}>
                    <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" class=" w-[90%] text-[#A0A0A0] border rounded-full bg-white rounded-full text-sm m-2 pl-3 pr-3 text-center flex justify-between items-center" type="button"
                        onClick={() => setMinistryIsOpen(!MinistryIsOpen)}
                    >
                        <span className="truncate overflow-hidden text-elipsis w-[50px]">
                            {filters.ministry ? filters.ministry.charAt(0).toUpperCase() + filters.ministry.slice(1) : 'Ministry'}
                        </span>
                        <svg className={`w-2.5 h-2.5 ms-3" transition-transform duration-200 ${MinistryIsOpen ? 'rotate-180' : ''}`}


                            aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 1 4 4 4-4"
                            />
                        </svg>
                    </button>

                    {/* <!-- Dropdown menu --> */}
                    {MinistryIsOpen && (
                        <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-[140px]">
                            <ul className="py-2 text-sm text-gray-700 divide-y divid-gray-100">
                                <li>
                                    <button
                                        onClick={() => handleSelectMinistry('')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        All
                                    </button>
                                </li>

                                {!ministriesLoading && ministries?.map((ministry) => (
                                    <li key={ministry.id}>
                                        <button
                                            onClick={() => handleSelectMinistry(ministry.name)}
                                            className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                            {ministry.name.charAt(0).toUpperCase() + ministry.name.slice(1)}
                                        </button>

                                    </li>
                                ))}

                            </ul>
                        </ div>
                    )}

                </div>

                {/* Clear Button */}
                <button
                    className="w-[20%] rounded-lg p-3 bg-[#FDB54A] text-white hover:bg-[#e5a43b] transition-colors flex items-center justify-center"
                    onClick={handleCreateMember}
                    title="Add new member"
                    aria-label="Add new member"
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
            <MemberFormModal
                open={formModalState.open}
                onClose={closeFormModal}
                onSubmit={handleFormSubmit}
                member={formModalState.member}
                loading={formLoading}
                ministries={ministries}
            />

        </div>
    )
}