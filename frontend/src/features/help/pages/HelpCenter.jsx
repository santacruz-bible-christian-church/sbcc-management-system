import React, { useState } from 'react'
import { HiSearch, HiOutlineBookOpen, HiOutlineQuestionMarkCircle, HiOutlineMail, HiOutlineLightBulb } from 'react-icons/hi'
import GettingStarted from '../components/GettingStarted'
import Guides from '../components/GuidesDirectory'
import FAQs from '../components/FAQsDirectory'
import { useHelpSearch, scrollToSection } from '../hooks/useHelpSearch'

const CategoryCard = ({ icon: Icon, title, desc, onClick, disabled }) => (
  <div
    className={`text-left bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-full ${disabled ? 'opacity-100 cursor-default' : 'hover:shadow-md transition-shadow cursor-pointer'}`}
    {...(!disabled && onClick ? { onClick } : {})}
    tabIndex={disabled ? -1 : 0}
    role={disabled ? undefined : 'button'}
    style={disabled ? { pointerEvents: 'none' } : {}}
  >
    <div className="flex items-center gap-3 mb-1">
      <span className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
        <Icon className="text-[#FDB54A]" size={20} />
      </span>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="text-sm text-gray-600 pl-13 ml-[52px] -mt-3">{desc}</div>
  </div>
)

function ContactsCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
          <HiOutlineMail className="text-[#FDB54A]" size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        For customer support or system assistance, please reach out to any of our dedicated support team members below:
      </p>

      <div className="space-y-3">
        <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Jeremy Garin</span>
            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded-full">Lead Developer</span>
          </div>
          <a
            href="mailto:garinjeremy6@gmail.com"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            garinjeremy6@gmail.com
          </a>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Marc Justin Alberto</span>
            <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded-full">Frontend Specialist</span>
          </div>
          <a
            href="mailto:mjg.alberto2@gmail.com"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            mjg.alberto2@gmail.com
          </a>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Jose Aquino III</span>
            <span className="text-xs text-gray-500 bg-purple-100 px-2 py-1 rounded-full">Backend Specialist</span>
          </div>
          <a
            href="mailto:aquinojxse@gmail.com"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            aquinojxse@gmail.com
          </a>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          📧 Expected response time: 24-48 hours
        </p>
      </div>
    </div>
  )
}

function SearchResults({ results, onNavigate, onClear, selectedIndex }) {
  if (results.length === 0) {
    return (
      <div className="absolute z-10 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-2">
        <p className="text-gray-500 text-center">No results found. Try different keywords.</p>
      </div>
    )
  }

  const groupedResults = results.reduce((acc, item, index) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push({ ...item, flatIndex: index })
    return acc
  }, {})

  return (
    <div className="absolute z-10 w-full bg-white rounded-xl shadow-lg border border-gray-200 mt-2 max-h-96 overflow-y-auto">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
        <span className="text-sm text-gray-600">{results.length} result{results.length !== 1 ? 's' : ''} found</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">↑↓ Navigate • Enter Select • Esc Close</span>
          <button
            onClick={onClear}
            className="text-sm text-[#FDB54A] hover:text-[#e5a43b] font-medium"
          >
            Clear
          </button>
        </div>
      </div>
      {Object.entries(groupedResults).map(([category, items]) => (
        <div key={category}>
          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide sticky top-12">
            {category}
          </div>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item)}
              className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-50 last:border-b-0 ${
                selectedIndex === item.flatIndex
                  ? 'bg-orange-50 border-l-2 border-l-[#FDB54A]'
                  : 'hover:bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {item.type === 'faq' ? 'Frequently Asked Question' : item.type === 'guide' ? 'Step-by-step Guide' : 'Getting Started Topic'}
              </p>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function HelpCenter() {
  const [currentView, setCurrentView] = useState('home')
  const [targetSection, setTargetSection] = useState(null)

  const {
    searchQuery,
    searchResults,
    showResults,
    selectedIndex,
    searchRef,
    inputRef,
    handleSearch,
    clearSearch,
    openResults,
    handleKeyDown,
  } = useHelpSearch()

  const handleNavigate = (item) => {
    clearSearch()

    if (item.type === 'guide') {
      setTargetSection(item.id)
      setCurrentView('guides')
    } else if (item.type === 'faq') {
      setTargetSection(item.id)
      setCurrentView('faqs')
    } else if (item.type === 'topic') {
      // For topics, scroll to section on current page
      scrollToSection(item.id)
    }
  }

  // When navigating to guides/faqs with a target section
  const handleBackToHome = () => {
    setCurrentView('home')
    setTargetSection(null)
  }

  if (currentView === 'guides') {
    return <Guides onBack={handleBackToHome} targetSection={targetSection} />
  }

  if (currentView === 'faqs') {
    return <FAQs onBack={handleBackToHome} targetSection={targetSection} />
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            How can we <span className="text-[#FDB54A]">help you?</span>
          </h1>
          <div className="mt-4 relative max-w-2xl" ref={searchRef}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for topics, guides, or FAQs..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={openResults}
              onKeyDown={(e) => handleKeyDown(e, handleNavigate)}
              className="w-full h-14 rounded-full bg-white border border-gray-200 shadow-sm pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-[#FDB54A] focus:border-transparent"
            />
            <button
              type="button"
              onClick={openResults}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FDB54A] text-white flex items-center justify-center shadow hover:bg-[#e5a43b] transition-colors"
              aria-label="Search"
            >
              <HiSearch size={18} />
            </button>

            {/* Search Results Dropdown */}
            {showResults && (
              <SearchResults
                results={searchResults}
                onNavigate={handleNavigate}
                onClear={clearSearch}
                selectedIndex={selectedIndex}
              />
            )}
          </div>
          <p className="text-gray-500 text-sm mt-3">
            {searchQuery ? `Searching for "${searchQuery}"...` : 'Or choose an option to explore our guides and FAQs.'}
          </p>
        </div>

        {/* Layout: Left content + Right cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: Getting Started */}
          <GettingStarted />

          {/* Right: Cards (Guides / FAQ / Contacts) */}
          <aside className="space-y-4 xl:sticky xl:top-4 h-fit">
            <CategoryCard icon={HiOutlineBookOpen} title="Guides" desc="Step-by-step instructions for core modules" onClick={() => setCurrentView('guides')} />
            <CategoryCard icon={HiOutlineQuestionMarkCircle} title="FAQs" desc="Common questions answered quickly" onClick={() => setCurrentView('faqs')} />
            <ContactsCard />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-2">
                <HiOutlineLightBulb className="text-[#FDB54A]" size={20} />
                <h3 className="text-base font-semibold text-gray-900">Tips</h3>
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Use search and filters on each page.</li>
                <li>• Look for breadcrumbs in Documents to navigate.</li>
                <li>• Admins can manage system settings and users.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
