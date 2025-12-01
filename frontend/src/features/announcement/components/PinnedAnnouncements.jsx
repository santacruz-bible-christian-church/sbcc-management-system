import PinnedCards from "./PinnedCards"

const PinnedAnnouncements = ({ mock, handleSetMock, handleSetQuery }) => {
    return (
        <div className="border shadow rounded-[15px] pb-6">
            <h1 className="pl-5 pt-5 font-bold text-[#FDB54A] text - [20px]">Pinned Announcements</h1>
            < PinnedCards mock={mock} handleSetMock={handleSetMock} handleSetQuery={handleSetQuery} />
        </div >
    )
}

export default PinnedAnnouncements