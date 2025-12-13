import React from 'react'
import { Disclosure } from '@headlessui/react'
import { HiChevronDown } from 'react-icons/hi'

const GettingStartedItem = ({ title, children, defaultOpen = false, id }) => (
    <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
            <div id={id} className="border-b border-gray-100 last:border-b-0 transition-all duration-300">
                <Disclosure.Button className="w-full px-4 md:px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                    <span className="text-gray-900 font-medium text-sm md:text-base">{title}</span>
                    <HiChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
                            open ? 'rotate-180' : ''
                        }`}
                    />
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 md:px-6 pb-5 text-sm text-gray-700 leading-relaxed">
                    {children}
                </Disclosure.Panel>
            </div>
        )}
    </Disclosure>
)

export default function GettingStarted() {
    return (
        <section className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Getting Started</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Essential topics to help you navigate and use the SBCC Management System effectively.
                    </p>
                </div>
                <div>
                    <GettingStartedItem title="Overview & User Roles" id="overview-user-roles" defaultOpen={false}>
                        <div className="space-y-3">
                            <p>
                                The SBCC Management System has three primary user roles, each with specific permissions and
                                capabilities:
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li>
                                    <strong className="text-gray-900">Admin:</strong> Full access to all modules including
                                    system settings, user management, role assignments, and sensitive data. Admins can create,
                                    edit, and delete any content across the platform.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Member:</strong> Access to core features like viewing
                                    events, submitting prayer requests, checking announcements, and viewing membership
                                    directories. Members can update their own profile information.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Volunteer:</strong> Similar to members but with
                                    additional permissions to manage specific ministry activities, update event attendance, and
                                    coordinate tasks within assigned ministries.
                                </li>
                            </ul>
                            <p className="text-gray-600 italic text-xs mt-2">
                                Note: If you need different permissions, contact your system administrator.
                            </p>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Navigating the Application" id="navigating-application" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                The SBCC Management System uses a sidebar navigation layout for easy access to all modules:
                            </p>
                            <ul className="space-y-2 ml-4">
                                <li>
                                    <strong className="text-gray-900">Dashboard:</strong> Your home base showing quick
                                    statistics, recent activities, and important updates at a glance.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Events:</strong> View, create, and manage church events,
                                    track attendance, and send event notifications.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Announcements:</strong> Stay informed with church-wide
                                    announcements and important notices.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Membership:</strong> Access the church directory,
                                    manage member profiles, and organize members by ministries.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Prayer Requests:</strong> Submit and view prayer
                                    requests, mark them as answered, and keep the church community connected in prayer.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Inventory:</strong> Track church assets, equipment, and
                                    supplies with quantity management and borrowing logs.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Documents:</strong> Centralized file management with
                                    folder organization, search capabilities, and multiple view options.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Tasks:</strong> Create and assign tasks, set
                                    priorities, track progress, and collaborate with team members.
                                </li>
                                <li>
                                    <strong className="text-gray-900">Settings:</strong> (Admin only) Configure system
                                    settings, manage user roles, and customize the application.
                                </li>
                            </ul>
                            <p className="mt-3">
                                <strong>Pro Tip:</strong> Use the search functionality available on most pages to quickly
                                find what you're looking for. Each module also has filters to narrow down results.
                            </p>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Managing Members & Attendance" id="managing-members-attendance" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>The Membership module is your comprehensive tool for managing church members:</p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Adding & Updating Members:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                                    <li>Navigate to Membership from the sidebar</li>
                                    <li>Click "Add Member" to create a new profile</li>
                                    <li>Fill in required information: name, email, phone, address</li>
                                    <li>Assign roles (Member, Volunteer) and ministry groups</li>
                                    <li>Add optional details like birthday, membership date, and emergency contacts</li>
                                    <li>Save the profile and it will appear in the directory</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Tracking Attendance:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                                    <li>Go to the Attendance module</li>
                                    <li>Select an event or service date</li>
                                    <li>Mark attendance for each member (Present, Absent, Excused)</li>
                                    <li>Use filters to view attendance by date range or ministry</li>
                                    <li>Export attendance reports for record-keeping</li>
                                </ol>
                            </div>
                            <p className="mt-3">
                                <strong>Best Practice:</strong> Keep member information up-to-date and record attendance
                                consistently to generate accurate reports and maintain communication.
                            </p>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Documents & File Management" id="documents-file-management" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                The Documents module provides a robust file management system similar to familiar file
                                explorers:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Organizing Files:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• Create folders to organize documents by category (Ministry, Events, Admin, etc.)</li>
                                    <li>• Use nested folders for deeper organization</li>
                                    <li>• Upload multiple files at once with drag-and-drop support</li>
                                    <li>
                                        • Supported file types include PDFs, images, documents, spreadsheets, and presentations
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Navigation Features:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>
                                        • <strong>Breadcrumbs:</strong> Click on any folder in the breadcrumb trail to quickly
                                        navigate back
                                    </li>
                                    <li>
                                        • <strong>Grid/List View:</strong> Toggle between visual grid layout and detailed list
                                        view
                                    </li>
                                    <li>
                                        • <strong>Search:</strong> Find files instantly by name or content (for supported
                                        formats)
                                    </li>
                                    <li>
                                        • <strong>Filters:</strong> Sort by date, file type, or size to locate specific
                                        documents
                                    </li>
                                    <li>
                                        • <strong>Quick Actions:</strong> Download, rename, move, or delete files with
                                        right-click context menu
                                    </li>
                                </ul>
                            </div>
                            <p className="mt-3 text-gray-600 italic text-xs">
                                Tip: Folders are always displayed first, followed by files, to keep your workspace organized.
                            </p>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Events & Calendar Management" id="events-calendar-management" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                Events are at the heart of church activities. The Events module helps you plan, communicate,
                                and track participation:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Creating Events:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                                    <li>Click "Create Event" from the Events page</li>
                                    <li>Enter event details: title, description, date and time</li>
                                    <li>Specify venue (physical location or virtual meeting link)</li>
                                    <li>Set event type (Service, Ministry Meeting, Social Gathering, Conference, etc.)</li>
                                    <li>Add organizers and assign volunteers if needed</li>
                                    <li>Enable registration if you need to track RSVPs</li>
                                    <li>Publish the event to make it visible to members</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Managing Events:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• Edit event details anytime before or after the event</li>
                                    <li>• Track who has registered or confirmed attendance</li>
                                    <li>• Send reminders and notifications to registered participants</li>
                                    <li>• Mark attendance during or after the event</li>
                                    <li>• Archive past events to keep your calendar clean</li>
                                    <li>• Use calendar view to see all upcoming events at a glance</li>
                                </ul>
                            </div>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Ministry Coordination & Volunteers" id="ministry-coordination-volunteers" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                Ministries are the building blocks of church organization, allowing you to group members by
                                their areas of service:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Setting Up Ministries:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                                    <li>Navigate to the Ministries section</li>
                                    <li>Create new ministries (e.g., Worship, Youth, Outreach, Children's Ministry)</li>
                                    <li>Assign ministry leaders and coordinators</li>
                                    <li>Add members and volunteers to each ministry</li>
                                    <li>Set ministry-specific roles and responsibilities</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Volunteer Management:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• Track volunteer availability and schedules</li>
                                    <li>• Assign volunteers to specific events or tasks</li>
                                    <li>• Send ministry-specific announcements and updates</li>
                                    <li>• View ministry activity logs and participation history</li>
                                    <li>• Coordinate ministry meetings and planning sessions</li>
                                </ul>
                            </div>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Tasks & Project Management" id="tasks-project-management" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                The Tasks module helps teams stay organized and accountable with clear assignments and
                                progress tracking:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Creating & Assigning Tasks:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                                    <li>Click "New Task" from the Tasks page</li>
                                    <li>Provide a clear title and detailed description</li>
                                    <li>Assign the task to one or more team members</li>
                                    <li>Set a due date to ensure timely completion</li>
                                    <li>Choose priority level (Low, Medium, High, Urgent)</li>
                                    <li>Add tags or categories for easy filtering</li>
                                    <li>Save the task to notify assignees</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Task Workflow:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>
                                        • <strong>To Do:</strong> Newly created tasks waiting to be started
                                    </li>
                                    <li>
                                        • <strong>In Progress:</strong> Tasks currently being worked on
                                    </li>
                                    <li>
                                        • <strong>Done:</strong> Completed tasks ready for review
                                    </li>
                                    <li>• Drag and drop tasks between columns to update status</li>
                                    <li>• Add comments and updates to keep everyone informed</li>
                                </ul>
                            </div>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Inventory & Asset Tracking" id="inventory-asset-tracking" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                Keep track of church property, equipment, and supplies with the Inventory module:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Adding Inventory Items:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                                    <li>Go to Inventory from the sidebar</li>
                                    <li>Click "Add Item" to create a new inventory entry</li>
                                    <li>Enter item name, description, and category</li>
                                    <li>Set quantity on hand and reorder threshold</li>
                                    <li>Add purchase date, cost, and supplier information (optional)</li>
                                    <li>Upload photos for visual identification</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Managing Inventory:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• Update quantities when items are used or restocked</li>
                                    <li>• Track who borrowed items and when they're due back</li>
                                    <li>• Set alerts for low stock levels</li>
                                    <li>• Generate inventory reports for budgeting and planning</li>
                                </ul>
                            </div>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Announcements & Communication" id="announcements-communication" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                Keep your congregation informed with timely announcements visible throughout the application:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Creating Announcements:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                                    <li>Access Announcements from the sidebar</li>
                                    <li>Click "Create Announcement"</li>
                                    <li>Write a clear, concise title (this appears in notification previews)</li>
                                    <li>Add detailed content with formatting options</li>
                                    <li>Optionally attach files or images</li>
                                    <li>Set publish date and expiration date if applicable</li>
                                    <li>Choose visibility (All Members, Specific Ministries, or Admins only)</li>
                                    <li>Publish immediately or schedule for later</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Announcement Types:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• <strong>General:</strong> Church-wide updates and information</li>
                                    <li>• <strong>Urgent:</strong> Time-sensitive notices (highlighted for visibility)</li>
                                    <li>• <strong>Ministry-Specific:</strong> Targeted messages to particular groups</li>
                                </ul>
                            </div>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Prayer Requests & Spiritual Support" id="prayer-requests-spiritual-support" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                The Prayer Requests module provides a sacred space for the church community to share needs
                                and lift each other up:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">Submitting Prayer Requests:</p>
                                <ol className="list-decimal list-inside space-y-1.5 ml-2">
                                    <li>Navigate to Prayer Requests</li>
                                    <li>Click "Submit Prayer Request"</li>
                                    <li>Choose privacy level (Public, Members Only, or Confidential/Admin Only)</li>
                                    <li>Describe the prayer need with appropriate detail</li>
                                    <li>Optionally request follow-up contact</li>
                                    <li>Submit and receive confirmation</li>
                                </ol>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Managing Prayer Requests:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• Review and approve requests for public visibility</li>
                                    <li>• Update status (Open, In Prayer, Answered, Archived)</li>
                                    <li>• Handle sensitive requests with care and confidentiality</li>
                                </ul>
                            </div>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="System Settings & Administration" id="system-settings-administration" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                <em>(Admin Only)</em> The Settings module provides comprehensive control over system
                                configuration:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">General Settings:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• Update church name and contact information</li>
                                    <li>• Upload and change church logo</li>
                                    <li>• Configure time zone and regional settings</li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">User Management:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• Create and manage user accounts</li>
                                    <li>• Assign and modify user roles (Admin, Member, Volunteer)</li>
                                    <li>• Reset passwords and manage authentication</li>
                                </ul>
                            </div>
                        </div>
                    </GettingStartedItem>

                    <GettingStartedItem title="Tips for Success & Best Practices" id="tips-success-best-practices" defaultOpen={true}>
                        <div className="space-y-3">
                            <p>
                                Maximize your effectiveness with the SBCC Management System using these proven practices:
                            </p>
                            <div>
                                <p className="font-medium text-gray-900 mb-2">General Usage Tips:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>
                                        • <strong>Use Search First:</strong> Most modules have powerful search – try it before
                                        browsing
                                    </li>
                                    <li>
                                        • <strong>Apply Filters:</strong> Narrow results by date, status, category, or ministry
                                    </li>
                                    <li>
                                        • <strong>Leverage Breadcrumbs:</strong> Quick navigation back through folder
                                        hierarchies
                                    </li>
                                    <li>
                                        • <strong>Check Dashboard First:</strong> Your daily starting point for important
                                        updates
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 mb-2 mt-3">Getting Help:</p>
                                <ul className="space-y-1.5 ml-4">
                                    <li>• Check this Help Center and FAQs first for common questions</li>
                                    <li>• Use the Guides section for detailed step-by-step instructions</li>
                                    <li>• Contact administrators through the Contacts page for technical support</li>
                                </ul>
                            </div>
                            <p className="mt-4 text-blue-700 bg-blue-50 p-3 rounded-lg text-xs">
                                <strong>💡 Pro Tip:</strong> Bookmark frequently used pages and set up notifications for
                                modules you manage regularly.
                            </p>
                        </div>
                    </GettingStartedItem>
                </div>
            </div>
        </section>
    )
}
