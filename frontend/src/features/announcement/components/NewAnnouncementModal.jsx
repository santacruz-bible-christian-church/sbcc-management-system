import ReactDom from "react-dom";

const NewAnnouncementModal = ({ openForm, handleSetOpenForm }) => {
    console.log(openForm)
    return ReactDom.createPortal(
        openForm ? (
            <div className="fixed z-[10] flex inset-0 scale-100 opacity-100">
                <div className="absolute inset-0 bg-black opacity-50 z-[20]"></div>
                <div className="flex w-[40%] h-auto bg-white m-auto z-[20] p-8 shadow-[0px_4px_45px_0px_rgba(0,0,0,0.3)] rounded-[30px] flex-col">
                    <input className="focus:placeholder-transparent focus:outline-none border-b-2 pb-2 text-[15px]" placeholder="To..."></input>
                    <input className="focus:placeholder-transparent focus:outline-none border-b-2 pb-2 pt-3 text-[25px] font-medium" placeholder="Title..."></input>
                    <textarea rows={10} className="focus:placeholder-transparent focus:outline-none text-[15px] border-t-none border-none resize-none" placeholder="Announcement..."></textarea>
                    <div className="flex border-t-2 border-gray mt-2 pt-2">
                        <button onClick={handleSetOpenForm} className="text-[15px] text-white font-medium bg-gray-400 w-[80px] p-2 ml-auto rounded-[15px]">Cancel</button>
                        <button onClick={handleSetOpenForm} className="text-[15px] text-white font-medium bg-[#FDB54A] w-[110px] p-2 ml-3 rounded-[15px]">Announce</button>
                    </div>
                </div>
            </div>

        ) : null
        ,
        document.getElementById("portal")
    )
}

export default NewAnnouncementModal;