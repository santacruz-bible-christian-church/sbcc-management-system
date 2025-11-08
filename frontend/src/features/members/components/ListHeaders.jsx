export const ListHeaders = () => {
    return (
        <div className="pr-3 pl-3 flex justify-between font-[15px] font-bold text-[#A0A0A0]">
            <h1 className="w-[18%]">
                Name
            </h1>
            <h1 className="hidden lg:flex justify-center w-[10%]">
                Gender
            </h1>
            <h1 className="flex justify-center w-[15%] lg:w-[15%]">
                Contact No.
            </h1>
            <h1 className="hidden lg:flex justify-center w-[15%]">
                Birthday
            </h1>
            <h1 className="flex justify-center w-[20%]">
                Ministry
            </h1>
            <h1 className="flex justify-center w-[18%]">
                Command
            </h1>
        </div>
    );
};
