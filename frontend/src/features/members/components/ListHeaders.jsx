import SCBCSidebar from '../../../components/layout/Sidebar';
import { useState } from 'react';


export const ListHeaders = () => {
    const [collapsed, setCollapsed] = useState(false);

    const handleSidebarToggle = () => {
        setCollapsed(!collapsed);
    };


    return (

        <div class="flex gap-3 font-[15px] font-bold text-[#A0A0A0]">
            <h1 class="mr-[18.7%]">
                Name
            </h1>
            <h1 class="mr-[9.2%]">
                Gender
            </h1>
            <h1 class="mr-[8.8%]">
                Contact No.
            </h1>
            <h1 class="mr-[8.9%]">
                Birthday
            </h1>
            <h1 class="mr-[9.2%]">
                Ministry
            </h1>
            <h1>
                Command
            </h1>
        </div>
    )
}