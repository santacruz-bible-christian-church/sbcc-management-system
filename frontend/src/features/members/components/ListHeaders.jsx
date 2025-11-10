import SCBCSidebar from '../../../components/layout/Sidebar';
import { useState } from 'react';
import { useSideBar } from '../../../context/SideBarContext';


export const ListHeaders = () => {
    const { collapsed, toggleSidebar } = useSideBar()
    return (

        <div class=" pr-3 pl-3 flex justify-between font-[15px] font-bold text-[#A0A0A0]">
            <h1 className=' w-[18%]'>
                Name
            </h1>
            <h1 className={` ${collapsed ? 'smd-collapsed:hidden' : 'smd-not-collapsed:hidden'} flex justify-center w-[10%] transition-all duration-500 ease-in-out
            `}
            >
                Gender
            </h1>
            <h1 className={` ${collapsed ? 'smd-collapsed:w-[35%]' : 'smd-not-collapsed:w-[30%]'} flex justify-center w-[15%] transition-all duration-500 ease-in-out`}>
                Contact No.
            </h1>
            <h1 className={` ${collapsed ? 'smd-collapsed:hidden' : 'smd-not-collapsed:hidden'} flex justify-center w-[15%] transition-all duration-500 ease-in-out`}>
                Birthday
            </h1>
            <h1 className=' flex justify-center w-[20%] transition-all duration-500 ease-in-out'>
                Ministry
            </h1>
            <h1 className=' flex justify-center w-[18%] transition-all duration-500 ease-in-out'>
                Command
            </h1>
        </div>
    )
}