import { useState } from "react";
import { useAuth } from '../../auth/hooks/useAuth';
import SCBCSidebar from '../../../components/layout/Sidebar';
import { Button, PrimaryButton, SecondaryButton, IconButton } from '../../../components/ui/Button';
import { MemberListNavBar } from '../components/MemberListNavBar';
import { ListHeaders } from '../components/ListHeaders';
import { Card } from '../../../components/ui/Card';
import { ListCards } from '../components/ListCards';


export const MembershipListPage = () => {

    const [collapsed, setCollapsed] = useState(false)

    const ToggleCollapsed = () => {
        setCollapsed(!collapsed)
    }

    return (
        <div className='ml-12 mt-12 mr-10'>

            <p className='text-[15px] text-[#A0A0A0] leading-none'>
                Pages/Membership
            </p>

            <h1 className='text-[30px] text-[#383838] leading-none font-bold mb-5'>
                Member List
            </h1>
            <div class="space-y-4">
                <MemberListNavBar />
                <ListHeaders />
                {/* <Card /> */}
                <ListCards />
                <ListCards />
                <ListCards />
                <ListCards />
                <ListCards />

            </div>



        </div>
    )
}
