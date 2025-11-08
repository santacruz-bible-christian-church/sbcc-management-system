import { useSideBar } from '../../../context/SideBarContext'

export const ListCards = () => {
    const { collapsed, toggleSideBar } = useSideBar()

    return (
        <div>
            <div className='flex gap-3 pr-3 pl-3 pt-6 pb-6 rounded-[20px] shadow-[2px_2px_10px_rgba(0,0,0,0.2)]'>
                <p className={`font-bold text-[#383838] text-left ${collapsed ? 'w-[210px] line-clamp-2 overflow-hidden text-ellipsis pl-7 mr-[0%]' : 'line-clamp-2 overflow-hidden text-ellipsis w-[160px] pl-3 mr-[1.5%]'} transition-all duration-500 ease-in-out`}>
                    Ross Cedric Nazareno
                </p>
                <p className={`flex justify-center ${collapsed ? 'w-[110px] pt-0 mr-[1.5%]' : 'w-[100px] pt-3 mr-[1%]'}  transition-all duration-500 ease-in-out font-regular text-[#383838]`}>
                    female
                </p>
                <p className={`truncate text-center ${collapsed ? 'w-[210px] pt-0 mr-[1%]' : 'w-[250px] pt-3 mr-[2%]'}  transition-all duration-500 ease-in-out font-regular text-[#383838]`}>
                    0968 632 6314
                </p>
                <p className={`flex justify-center ${collapsed ? 'w-[130px] pt-0 mr-[2.3%]' : 'pt-3 mr-[4%]'}  transition-all duration-500 ease-in-out font-regular text-[#383838]`}>
                    05/12/2004
                </p>
                <div className="border bg-blue-100 text-[#0092FF] text-[15px] font-regular rounded-full pl-8 pr-8 pt-1 pb-1 mr-[2.5%] text-center">
                    Music Ministry
                </div>
                <div className={`${collapsed ? 'pt-0' : 'pt-3.5 pr-5'}  transition-all duration-500 ease-in-out flex gap-5`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-[#FFB039]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-[#FFB039]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-[#E55050]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </div>


                {/* <p>Male</p>
                <p>0686326314</p>
                <p>05/12/2004</p>
                <p>Music Ministry</p> */}
            </div>
        </div >
    )
}