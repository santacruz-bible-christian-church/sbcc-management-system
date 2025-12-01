const AnnouncementNavbar = ({ handleSetOpenForm, query, setQuery }) => {

    return (
        <div className="flex w-full gap-2 relative">

            {/* New Announcement Button */}
            <button onClick={handleSetOpenForm} className="bg-[#FDB54A] p-3 rounded-[10px] shadow-[0px_4px_25px_rgba(0,0,0,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="text-white w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>

            {/* search bar */}
            <div className="relative text-[15px] rounded-[10px] w-[60%] mr-16 shadow-[0px_1px_15px_0px_rgba(0,0,0,0.2)]">
                <div className="relative w-full h-full">
                    <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full h-full rounded-[10px] pl-10 text-[#A0A0A0] focus:outline-none"
                        placeholder="Search Announcement...">
                    </input>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="absolute w-6 h-6 top-2 left-2 text-[#A0A0A0]">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                <button className="absolute rounded-r-[10px] bg-[#FDB54A] px-3 h-full text-white font-bold top-0 right-0">
                    SEARCH
                </button>
            </div>
        </div>
    )
}

export default AnnouncementNavbar