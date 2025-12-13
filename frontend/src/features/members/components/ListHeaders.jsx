import PropTypes from 'prop-types';

export const ListHeaders = ({ showCheckbox = false, allSelected = false, onSelectAll }) => {
    return (
        <div className="pr-3 pl-3 flex justify-between font-[15px] font-bold text-[#A0A0A0]">
            {/* Checkbox Column */}
            {showCheckbox && (
                <div className="w-[5%] flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => onSelectAll?.(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#FDB54A] focus:ring-[#FDB54A] cursor-pointer"
                    />
                </div>
            )}
            <h1 className={showCheckbox ? "w-[15%]" : "w-[18%]"}>
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

ListHeaders.propTypes = {
    showCheckbox: PropTypes.bool,
    allSelected: PropTypes.bool,
    onSelectAll: PropTypes.func,
};
