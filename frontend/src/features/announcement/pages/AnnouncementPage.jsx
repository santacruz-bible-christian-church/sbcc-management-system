import AnnouncementNavbar from "../components/AnnouncementNavbar";
import PinnedAnnouncements from "../components/PinnedAnnouncements";
import AnnouncementCards from "../components/AnnouncementCards";
import NewAnnouncementModal from "../components/NewAnnouncementModal"
import { useState } from "react";


const AnnouncementPage = () => {
    const [mock, setMock] = useState(
        [
            {
                id: 1,
                recipient: "Music Ministry",
                date: "Novermber 26, 9:00pm",
                title: "This is the title for item 1",
                announcement: "hehe",
                pinned: false
            },
            {
                id: 2,
                recipient: "Music Ministry",
                date: "Novermber 26 9:00pm",
                title: "Succesful",
                announcement: "We’re excited to have you join us. Your skills, perspective, and enthusiasm are valuable additions to our organization, and we look forward to achieving great things together. If you need anything as you get settled in, our team is here to support you every step of the way. Welcome aboard",
                pinned: false
            },
            {
                id: 3,
                recipient: "Music Ministry",
                date: "Novermber 26, 9:00pm",
                title: "This is a sample Title",
                announcement: "We’re excited to have you join us. Your skills, perspective, and enthusiasm are valuable additions to our organization, and we look forward to achieving great things together. If you need anything as you get settled in, our team is here to support you every step of the way. Welcome aboard",
                pinned: false
            },
            {
                id: 4,
                recipient: "Music Ministry",
                date: "Novermber 26, 9:00pm",
                title: "This is a sample Title",
                announcement: "We’re excited to have you join us. Your skills, perspective, and enthusiasm are valuable additions to our organization, and we look forward to achieving great things together. If you need anything as you get settled in, our team is here to support you every step of the way. Welcome aboard",
                pinned: false
            }
        ]
    )

    const [openForm, setOpenForm] = useState(false)
    const [query, setQuery] = useState("")

    const handleSetQuery = (q) => {
        setQuery(q)
    }


    const handleSetOpenForm = () => {
        setOpenForm(prev => !prev)
    }

    const handleSetMock = (mock, id) => {
        const newMock = mock.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    pinned: !item.pinned
                };
            }
            return item
        })
        setMock(newMock)
    }

    return (
        <div>

            <NewAnnouncementModal openForm={openForm} handleSetOpenForm={handleSetOpenForm} />

            <p className="pl-12 pt-12 text-[#A0A0A0] text-[15px]">Pages</p>
            <h1 className="pl-12 text-[30px] font-bold mb-2">Announcements</h1>

            <div className="flex w-[90%] mx-auto">
                {/* main view */}
                <div className="w-[65%] mr-5">
                    {/* Navbar */}
                    <div className="w-full mb-4">
                        <AnnouncementNavbar handleSetOpenForm={handleSetOpenForm} query={query} setQuery={setQuery} />
                    </div>
                    <AnnouncementCards mock={mock} handleSetMock={handleSetMock} query={query} />
                </div>

                {/* side view */}
                <div className="w-[35%]">
                    <PinnedAnnouncements mock={mock} handleSetMock={handleSetMock} handleSetQuery={handleSetQuery} />
                </div>
            </div>
        </div>
    )
}

export default AnnouncementPage