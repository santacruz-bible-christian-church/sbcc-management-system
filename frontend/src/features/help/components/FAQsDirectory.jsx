import React, { useEffect } from 'react'
import { scrollToSection } from '../hooks/useHelpSearch'

const QA = ({ q, a, id }) => (
  <div id={id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-300">
    <p className="font-semibold text-gray-900 mb-1">{q}</p>
    <p className="text-sm text-gray-700">{a}</p>
  </div>
)

export default function FAQsDirectory({ onBack, targetSection }) {
  const faqs = [
    { id: 'faq-reset-password', q: 'How do I reset my password?', a: 'Use the "Forgot Password" link on the login page and follow the steps sent to your email.' },
    { id: 'faq-access-settings', q: "Why can't I access Settings?", a: "Settings are restricted to Admins. Ask an Admin to grant appropriate role permissions." },
    { id: 'faq-upload-documents', q: 'Where do I upload documents?', a: 'Go to Documents, open a folder if needed, and click the Upload action. Use search or filters to find files.' },
    { id: 'faq-track-attendance', q: 'How do I track attendance?', a: 'Open the Attendance module. Filter by date/ministry and mark attendance for each member or import data if available.' },
    { id: 'faq-switch-views', q: 'Can I switch views in Documents?', a: 'Yes. Use the List/Grid toggle to change layout. Breadcrumbs help navigate folders.' },
    { id: 'faq-create-event', q: 'How do I create an event?', a: 'From Events, click "Create Event", fill details (title, date/time, venue), and save. You can edit or archive later.' },
    { id: 'faq-manage-roles', q: 'Who can manage roles?', a: 'Only Admins. They can assign roles (Admin, Member, Volunteer) in the Settings area.' },
  ]

  useEffect(() => {
    if (targetSection) {
      scrollToSection(targetSection)
    }
  }, [targetSection])

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F5F5F5]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        <button
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-sm font-medium"
          onClick={onBack}
        >
          ← Back to Help Center
        </button>
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">FAQs</h1>
          <p className="text-gray-600">Common questions and quick answers.</p>
        </div>
        {faqs.map((item) => (
          <QA key={item.id} id={item.id} q={item.q} a={item.a} />
        ))}
      </div>
    </div>
  )
}
