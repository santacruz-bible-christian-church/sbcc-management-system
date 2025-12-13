import React, { useEffect } from 'react'
import { scrollToSection } from '../hooks/useHelpSearch'

const Section = ({ title, children, id }) => (
  <section id={id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
    <div className="text-sm text-gray-700 space-y-2">{children}</div>
  </section>
)

export default function GuidesDirectory({ onBack, targetSection }) {
  useEffect(() => {
    if (targetSection) {
      scrollToSection(targetSection)
    }
  }, [targetSection])

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <button
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 text-sm font-medium"
          onClick={onBack}
        >
          ← Back to Help Center
        </button>
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Guides</h1>
          <p className="text-gray-600">Step-by-step instructions to manage the SBCC Management System.</p>
        </div>

        <Section title="Dashboard Overview" id="guide-dashboard">
          <ol className="list-decimal list-inside space-y-2">
            <li>Use the dashboard to view quick stats for members, events, tasks, and announcements.</li>
            <li>Click any card to navigate to the corresponding module for deeper actions.</li>
          </ol>
        </Section>

        <Section title="Events Management" id="guide-events">
          <ol className="list-decimal list-inside space-y-2">
            <li>Go to Events via the sidebar.</li>
            <li>Create an event with title, date/time, venue, and description.</li>
            <li>Edit events to update details or add notes; archive past events if needed.</li>
            <li>Use filters to see events by status or date range.</li>
          </ol>
        </Section>

        <Section title="Membership & Attendance" id="guide-membership">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Membership to view the members list and details.</li>
            <li>Add or update member information (role, contact, ministry).</li>
            <li>Track attendance from the Attendance module; filter by date or ministry.</li>
          </ol>
        </Section>

        <Section title="Ministries" id="guide-ministries">
          <ol className="list-decimal list-inside space-y-2">
            <li>Create ministries and assign members to groups for coordination.</li>
            <li>Use ministry details to view members, roles, and related activities.</li>
          </ol>
        </Section>

        <Section title="Documents (File Management)" id="guide-documents">
          <ol className="list-decimal list-inside space-y-2">
            <li>Navigate to Documents; folders are shown first, files after.</li>
            <li>Click a folder to drill down; use the breadcrumbs to go back.</li>
            <li>Use the search bar and filters to find files quickly.</li>
            <li>Toggle Grid/List views to change the layout; upload files via the action button.</li>
          </ol>
        </Section>

        <Section title="Inventory" id="guide-inventory">
          <ol className="list-decimal list-inside space-y-2">
            <li>Add items with quantity and categorize them for easy tracking.</li>
            <li>Update stock and log notes for borrowed/returned items.</li>
          </ol>
        </Section>

        <Section title="Tasks" id="guide-tasks">
          <ol className="list-decimal list-inside space-y-2">
            <li>Create tasks, set assignees, due dates, and priorities.</li>
            <li>Monitor status (To Do, In Progress, Done) and leave comments.</li>
          </ol>
        </Section>

        <Section title="Announcements & Prayer Requests" id="guide-announcements">
          <ol className="list-decimal list-inside space-y-2">
            <li>Publish announcements to keep members informed.</li>
            <li>Review and manage prayer requests respectfully with statuses/notes.</li>
          </ol>
        </Section>

        <Section title="Settings (Admin)" id="guide-settings">
          <ol className="list-decimal list-inside space-y-2">
            <li>Admins can update system settings (app name/logo) and manage roles.</li>
            <li>Ensure only authorized users can access sensitive actions.</li>
          </ol>
        </Section>
      </div>
    </div>
  )
}
