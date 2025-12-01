import { useState } from "react";

const AnnouncementCards = ({ mock, handleSetMock, query }) => {
    return (
        query === "" ?
            <div className="space-y-4">
                {mock.map((item) => {
                    return (
                        <div className="px-5 py-5 shadow border rounded-[15px]" >
                            <div className="flex justify-between">
                                <h1 className="text-[20px]">Santa Cruz Bible Christian Church</h1>
                                <div class="flex gap-2">
                                    <button onClick={() => handleSetMock(mock, item.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill={item.pinned ? "#FDB54A" : "#000"}
                                            d="M16 5v7l1.7 1.7q.15.15.225.338t.075.387V15q0 .425-.288.712T17 16h-4v5.85q0 .425-.288.713T12 22.85t-.712-.288T11
                        21.85V16H7q-.425 0-.712-.288T6 15v-.575q0-.2.075-.387T6.3 13.7L8 12V5q-.425 0-.712-.288T7 4t.288-.712T8 3h8q.425 0
                        .713.288T17 4t-.288.713T16 5" /></svg>
                                    </button>
                                    <button>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div class="flex mb-7">
                                <p className="text-[15px] font-light">
                                    To {item.recipient}
                                </p>
                                <div class="border border-[#383838] mx-2"></div>
                                <p className="text-[15px] font-light">
                                    {item.date}
                                </p>
                            </div>

                            <h1 className="text-[#383838] text-[20px] font-bold mb-5">{item.title}</h1>
                            <p className="text-[#383838] text-[15px] w-[90%]">{item.announcement}</p>

                        </div >
                    )
                })}

            </div >

            :

            <div className="space-y-4">
                {mock
                    .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
                    .map((item) => {
                        return (
                            <div className="px-5 py-5 shadow border rounded-[15px]" >
                                <div className="flex justify-between">
                                    <h1 className="text-[20px]">Santa Cruz Bible Christian Church</h1>
                                    <div class="flex gap-2">
                                        <button onClick={() => handleSetMock(mock, item.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill={item.pinned ? "#FDB54A" : "#000"}
                                                d="M16 5v7l1.7 1.7q.15.15.225.338t.075.387V15q0 .425-.288.712T17 16h-4v5.85q0 .425-.288.713T12 22.85t-.712-.288T11
                        21.85V16H7q-.425 0-.712-.288T6 15v-.575q0-.2.075-.387T6.3 13.7L8 12V5q-.425 0-.712-.288T7 4t.288-.712T8 3h8q.425 0
                        .713.288T17 4t-.288.713T16 5" /></svg>
                                        </button>
                                        <button>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div class="flex mb-7">
                                    <p className="text-[15px] font-light">
                                        To {item.recipient}
                                    </p>
                                    <div class="border border-[#383838] mx-2"></div>
                                    <p className="text-[15px] font-light">
                                        {item.date}
                                    </p>
                                </div>

                                <h1 className="text-[#383838] text-[20px] font-bold mb-5">{item.title}</h1>
                                <p className="text-[#383838] text-[15px] w-[90%]">{item.announcement}</p>

                            </div >
                        )
                    })}

            </div >
    )
}

export default AnnouncementCards