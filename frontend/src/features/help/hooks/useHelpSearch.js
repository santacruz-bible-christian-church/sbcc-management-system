import { useState, useMemo, useCallback, useEffect, useRef } from 'react'

// Generate ID from title
const generateId = (title, prefix = '') => {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return prefix ? `${prefix}-${slug}` : slug
}

// Dynamic content registry - components register their content here
let contentRegistry = []

export const registerHelpContent = (items) => {
  contentRegistry = [...contentRegistry, ...items]
}

export const clearHelpContent = () => {
  contentRegistry = []
}

// Helper to create searchable items
export const createSearchableItem = (type, category, title, keywords = []) => ({
  type,
  category,
  title,
  id: generateId(title, type === 'topic' ? '' : type),
  keywords: [...keywords, ...title.toLowerCase().split(/\s+/).filter(w => w.length > 2)]
})

// Default content (fallback if components don't register)
const getDefaultContent = () => [
  // Getting Started topics
  createSearchableItem('topic', 'Getting Started', 'Overview & User Roles', ['admin', 'member', 'volunteer', 'roles', 'permissions', 'access']),
  createSearchableItem('topic', 'Getting Started', 'Navigating the Application', ['sidebar', 'navigation', 'dashboard', 'menu', 'modules']),
  createSearchableItem('topic', 'Getting Started', 'Managing Members & Attendance', ['members', 'attendance', 'tracking', 'profile', 'directory']),
  createSearchableItem('topic', 'Getting Started', 'Documents & File Management', ['documents', 'files', 'upload', 'folders', 'storage', 'breadcrumbs']),
  createSearchableItem('topic', 'Getting Started', 'Events & Calendar Management', ['events', 'calendar', 'schedule', 'venue', 'registration']),
  createSearchableItem('topic', 'Getting Started', 'Ministry Coordination & Volunteers', ['ministry', 'volunteers', 'coordination', 'groups', 'teams']),
  createSearchableItem('topic', 'Getting Started', 'Tasks & Project Management', ['tasks', 'projects', 'assignments', 'due date', 'priority', 'to do']),
  createSearchableItem('topic', 'Getting Started', 'Inventory & Asset Tracking', ['inventory', 'assets', 'equipment', 'stock', 'supplies']),
  createSearchableItem('topic', 'Getting Started', 'Announcements & Communication', ['announcements', 'notifications', 'communication', 'publish']),
  createSearchableItem('topic', 'Getting Started', 'Prayer Requests & Spiritual Support', ['prayer', 'requests', 'spiritual', 'confidential']),
  createSearchableItem('topic', 'Getting Started', 'System Settings & Administration', ['settings', 'admin', 'configuration', 'users', 'security']),
  createSearchableItem('topic', 'Getting Started', 'Tips for Success & Best Practices', ['tips', 'best practices', 'help', 'success']),

  // Guides
  createSearchableItem('guide', 'Guides', 'Dashboard Overview', ['dashboard', 'stats', 'overview', 'quick view']),
  createSearchableItem('guide', 'Guides', 'Events Management', ['events', 'create event', 'edit', 'archive', 'filters']),
  createSearchableItem('guide', 'Guides', 'Membership & Attendance', ['members', 'attendance', 'tracking', 'filter']),
  createSearchableItem('guide', 'Guides', 'Ministries', ['ministries', 'groups', 'assign', 'members']),
  createSearchableItem('guide', 'Guides', 'Documents (File Management)', ['documents', 'files', 'folders', 'upload', 'grid', 'list']),
  createSearchableItem('guide', 'Guides', 'Inventory', ['inventory', 'items', 'quantity', 'stock', 'borrowed']),
  createSearchableItem('guide', 'Guides', 'Tasks', ['tasks', 'assignees', 'due dates', 'priorities', 'status']),
  createSearchableItem('guide', 'Guides', 'Announcements & Prayer Requests', ['announcements', 'prayer', 'publish', 'status']),
  createSearchableItem('guide', 'Guides', 'Settings (Admin)', ['settings', 'admin', 'roles', 'system']),

  // FAQs
  createSearchableItem('faq', 'FAQs', 'How do I reset my password?', ['password', 'reset', 'forgot', 'login']),
  createSearchableItem('faq', 'FAQs', 'Why can\'t I access Settings?', ['settings', 'access', 'permissions', 'admin', 'restricted']),
  createSearchableItem('faq', 'FAQs', 'Where do I upload documents?', ['upload', 'documents', 'files', 'folder']),
  createSearchableItem('faq', 'FAQs', 'How do I track attendance?', ['attendance', 'track', 'filter', 'ministry', 'date']),
  createSearchableItem('faq', 'FAQs', 'Can I switch views in Documents?', ['documents', 'views', 'grid', 'list', 'toggle']),
  createSearchableItem('faq', 'FAQs', 'How do I create an event?', ['event', 'create', 'title', 'date', 'venue']),
  createSearchableItem('faq', 'FAQs', 'Who can manage roles?', ['roles', 'manage', 'admin', 'permissions']),
]

export function useHelpSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  // Get searchable content - use registry if populated, otherwise default
  const searchableContent = useMemo(() => {
    return contentRegistry.length > 0 ? contentRegistry : getDefaultContent()
  }, [])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase().trim()
    const words = query.split(/\s+/).filter(w => w.length >= 2)

    const scored = searchableContent.map(item => {
      let score = 0
      const titleLower = item.title.toLowerCase()

      // Exact title match (highest priority)
      if (titleLower === query) score += 100
      // Title starts with query
      else if (titleLower.startsWith(query)) score += 50
      // Title contains query
      else if (titleLower.includes(query)) score += 30

      // Word matches in title
      words.forEach(word => {
        if (titleLower.includes(word)) score += 15
      })

      // Keyword matches
      item.keywords.forEach(kw => {
        const kwLower = kw.toLowerCase()
        if (kwLower === query) score += 20
        else if (kwLower.includes(query) || query.includes(kwLower)) score += 10
        words.forEach(word => {
          if (kwLower.includes(word) || word.includes(kwLower)) score += 5
        })
      })

      // Category match
      if (item.category.toLowerCase().includes(query)) score += 5

      return { ...item, score }
    })

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }, [searchQuery, searchableContent])

  const handleSearch = useCallback((e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowResults(value.trim().length > 0)
    setSelectedIndex(-1)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setShowResults(false)
    setSelectedIndex(-1)
  }, [])

  const openResults = useCallback(() => {
    if (searchQuery.trim()) {
      setShowResults(true)
    }
  }, [searchQuery])

  const closeResults = useCallback(() => {
    setShowResults(false)
    setSelectedIndex(-1)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback((e, onNavigate) => {
    if (!showResults || searchResults.length === 0) {
      if (e.key === 'Escape') {
        closeResults()
        inputRef.current?.blur()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          onNavigate(searchResults[selectedIndex])
        } else if (searchResults.length > 0) {
          onNavigate(searchResults[0])
        }
        break
      case 'Escape':
        e.preventDefault()
        closeResults()
        inputRef.current?.blur()
        break
      default:
        break
    }
  }, [showResults, searchResults, selectedIndex, closeResults])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        closeResults()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeResults])

  return {
    searchQuery,
    searchResults,
    showResults,
    selectedIndex,
    searchRef,
    inputRef,
    handleSearch,
    clearSearch,
    openResults,
    closeResults,
    handleKeyDown,
  }
}

// Helper to scroll to element by ID with highlight
export function scrollToSection(id) {
  if (!id) return

  setTimeout(() => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Add highlight effect
      element.classList.add('ring-2', 'ring-[#FDB54A]', 'ring-offset-2')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-[#FDB54A]', 'ring-offset-2')
      }, 2000)
    }
  }, 150)
}

// Helper to generate consistent IDs
export { generateId }
