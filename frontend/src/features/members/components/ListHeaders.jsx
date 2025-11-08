import SCBCSidebar from '../../../components/layout/Sidebar';
import { useState } from 'react';
import { useSideBar } from '../../../context/SideBarContext';


export const ListHeaders = () => {
    const { collapsed, toggleSidebar } = useSideBar()
    return (

        <div class="flex gap-3 font-[15px] font-bold text-[#A0A0A0]">
            <h1 className={`${collapsed ? 'mr-[18.7%]' : 'mr-[12.6%]'} transition-all dureation-500 ease-in-out`}>
                Name
            </h1>
            <h1 className={`${collapsed ? 'mr-[9%]' : 'mr-[7%]'} transition-all duration-500 ease-in-out`}>
                Gender
            </h1>
            <h1 className={`${collapsed ? 'mr-[9.5%]' : 'mr-[9%]'} transition-all duration-500 ease-in-out`}>
                Contact No.
            </h1>
            <h1 className={`${collapsed ? 'mr-[8.7%]' : 'mr-[7.7%]'} transition-all duration-500 ease-in-out`}>
                Birthday
            </h1>
            <h1 className={`${collapsed ? 'mr-[8%]' : 'mr-[6.5%]'} transition-all duration-500 ease-in-out`}>
                Ministry
            </h1>
            <h1>
                Command
            </h1>
        </div>
    )
}