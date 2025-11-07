import { Search } from 'lucide-react';

export const SearchBar = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search...",
  className = ""
}) => {
  return (
    <form onSubmit={onSubmit} className={`flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 ${className}`}>
      <div className="pl-3 pr-2">
        <Search className="w-4 h-4 text-gray-400" />
      </div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-80 md:w-96 py-2 px-2 outline-none text-sm text-gray-700"
      />
      <button
        type="submit"
        className="bg-[#FDB54A] text-white px-4 py-2 text-sm font-medium"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
