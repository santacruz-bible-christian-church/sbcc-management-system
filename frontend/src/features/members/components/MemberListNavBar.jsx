import { PrimaryButton, SecondaryButton, IconButton } from '../../../components/ui/Button';
import { FaPlus } from 'react-icons/fa';
import { FaSliders } from "react-icons/fa6";
import { useSideBar } from "../../../context/SideBarContext"


export const MemberListNavBar = () => {
    const { collapsed, toggleSidebar } = useSideBar();

    return (
        <div className='flex justify-around gap-3'>

            <PrimaryButton class="border rounded p-2 bg-[#FDB54A] text-white">
                <FaPlus />
            </PrimaryButton>

            <form class="w-2/4 shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg">
                <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div class="relative rounded-lg h-full">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input type="search" id="default-search" class="block w-full h-full bottom-0 ps-10 text-sm text-[#A0A0A0] rounded-lg bg-gray-50 focus:ring-yellow-500 border-none focus:border-yellow-500" placeholder="Search... " required />
                    <button type="submit" class="text-white absolute end-0 bottom-0 h-full  bg-[#FDB54A] hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-l-none rounded-r-lg border-none text-sm px-8 py-[8.5px]">Search</button>
                </div>
            </form>

            <div className=' w-2/3 flex shadow-[2px_2px_10px_rgba(0,0,0,0.15)] rounded-lg'>
                <PrimaryButton className="text-[#FDB54A]">
                    <FaSliders />
                </PrimaryButton>

                {/* Gender Dropdown */}
                <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" class=" w-[90%] text-[#A0A0A0] border rounded-full bg-white rounded-full text-sm m-2 pl-3 pr-3 text-center flex justify-between items-center" type="button">Gender <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                </svg>
                </button>

                {/*  Dropdown menu */}
                <div id="dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
                    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</a>
                        </li>
                    </ul>
                </div>

                {/* Ministry Dropdown */}
                <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" class=" w-[90%] text-[#A0A0A0] border rounded-full bg-white rounded-full text-sm m-2 pr-3 pl-3 text-center flex justify-between items-center" type="button">Ministry <svg class="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                </svg>
                </button>

                {/* <!-- Dropdown menu --> */}
                <div id="dropdown" class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
                    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownDefaultButton">
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                        </li>
                        <li>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</a>
                        </li>
                    </ul>
                </div>

                <div class="relative w-full">
                    <button type="clear" class="absolute end-0 bottom-0 text-white bg-[#FDB54A] hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-l-none rounded-r-lg border-none text-sm px-8 py-[8.5px]">Clear</button>
                </div>

                {/* Clear Button */}
                {/* <PrimaryButton className="border">
                    Clear
                </PrimaryButton> */}

            </div>

        </div>
    )
}