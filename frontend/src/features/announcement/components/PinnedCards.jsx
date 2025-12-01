const PinnedCards = ({ mock, handleSetMock, handleSetQuery }) => {
    const pinnedItems = mock.filter(item => item.pinned)
    console.log(handleSetQuery)
    return (
        <div>
            {

                pinnedItems.map((item, index) => {
                    return (
                        <div>
                            <div className="flex justify-between mx-5 mt-5 mb-5">
                                <div>
                                    <h1 className="text-[15px] font-bold">{item.title}</h1>
                                    <p class="text-[10px] font-light">{item.date}</p>
                                </div>
                                <button className="flex relative rounded-[15px] pl-7 pr-3  h-[30px] font-light">

                                    <svg onClick={() => handleSetMock(mock, item.id)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#FDB54A"
                                        d="M16 5v7l1.7 1.7q.15.15.225.338t.075.387V15q0 .425-.288.712T17 16h-4v5.85q0 .425-.288.713T12 22.85t-.712-.288T11
                                            21.85V16H7q-.425 0-.712-.288T6 15v-.575q0-.2.075-.387T6.3 13.7L8 12V5q-.425 0-.712-.288T7 4t.288-.712T8 3h8q.425 0
                                        .713.288T17 4t-.288.713T16 5" /></svg>
                                </button>
                            </div>
                            <div className="flex text-[10px] mx-5 justify-between">
                                <p className="w-[60%] line-clamp-2">
                                    {item.announcement}
                                </p>
                                <button onClick={() => handleSetQuery(item.title)} class="underline pt-[14px] font-bold">View Announcement</button>
                            </div>
                            {index < pinnedItems.length - 1 && (
                                <div className="border-b-2 border-gray mt-4 w-[95%] mx-auto"></div>
                            )}
                        </div>
                    )
                })}
        </div>
    )
}

export default PinnedCards