# SBCC Management System - Product Requirements Document

**Course:** CMSC 309 Software Engineering I

## Developer Team

| Name | Role |
|------|------|
| Agojo, Nigel | Developer |
| Alberto, Marc Justin | Developer |
| Aquino, Jose | Developer |
| Eleazar, CJ | Developer |
| Garin, Jeremy | Lead Developer |
| Mendez, Jerick | Developer |
| Mendoza, Nick Narry | Developer |
| Nazareno, Ross Cedric | Developer |
| Taquilid, Ella Edz | Developer |

---

## Project Overview

The SBCC Management System is a web-based platform designed to streamline church operations including membership management, attendance tracking, event coordination, volunteer scheduling, pastoral care, and inventory management.

---

## Project Goals

- Centralize and digitize all church data
- Automate member and volunteer management
- Improve record accuracy and accessibility
- Streamline communication among church departments
- Support administrative reports and printable records
- Provide offline access for uninterrupted usage
- Enhance transparency and efficiency across ministries

---

## Core Function Requirements

### Phase 2: Core Features Development

#### Authentication & User Management

- Role-based access control (Admin, Pastor, Ministry Leader, Volunteer, Member)
- Secure login and credential management
- Authentication per ministry head for data access
- Retain user credentials even after account archival
- Use real background images in login interface

#### Membership Database

- Add, update, and archive member profiles
- Track active and inactive members
- Record birthdays and anniversaries for reminders
- Enable PDF conversion and printing of member records
- Include Recycle Bin/Archives for soft-deleted data
- Retain login credentials after deletion
- Support offline access via a desktop variant
- Generate reports for attendance, membership, and anniversaries

#### Attendance Tracking

- Record member attendance for worship and ministry events
- Generate reports per member, ministry, or event
- Notify admins when a member is frequently absent
- Integrate attendance status with member activity tracking

#### Event & Calendar System

- Create, manage, and categorize events (worship, outreach, fellowship)
- Display events in an interactive calendar
- Prepare for upcoming event filtering (to be finalized with client)

#### Volunteer & Ministry Management

- Maintain volunteer rosters
- Automate rotational scheduling
- Notify via email (Django)

---

### Phase 3: Integration and Additional Modules

#### Records Tracking

- Maintain volunteer rosters per ministry
- Automate rotation and scheduling
- Support email notifications for assigned schedules
- Display mock-up data for prototype and demo purposes
- Integrate attendance & volunteer activity into dashboard summaries
- Add a basic audit log for volunteer changes (optional but beneficial)

#### Prayer Requests & Pastoral Care

- Allow digital submission of prayer requests
- Assign requests to pastors or elders
- Track progress and follow-up logs

#### Inventory Tracking

- Track all equipment with fields:
  - Item name, description, acquisition date, cost, status, quantity
  - Depreciation tracking
  - Label (donated / church-provided)
  - Remarks or notes field
- Enable printable inventory lists and sticker markings (QR/barcode)
- Authentication per ministry head for access control
- Generate depreciation and inventory reports (PDF exportable)

#### Task Management

- Replace single Due Date field with a Timeline feature (start–end date range)
- Display visual progress indicators (timeline bar or status)
- Allow admins or ministry leaders to assign and track tasks
- Dashboard widget showing:
  - Upcoming tasks
  - Late tasks
  - Tasks in progress

#### Minutes of Meetings

- Record and upload meeting minutes with file attachments
- Enable word search across meeting records
- Add categorization (Finance, Worship, Youth, Outreach, etc.)
- Version control for updated meeting notes
- Word search inside uploaded files (OCR or PDF text extraction)

#### Communication Module

- Post and schedule announcements
- Send group-specific messages (ministry or general)
- Display announcements on homepage

#### Dashboard Enhancements

- Demographic statistics (gender, age group, ministry count)
- Attendance trends
- Membership summaries
- Consolidated announcements
- Show attendance record inside membership profile
- Visitor attendance integration
- Missing member statistics (frequently absent)

#### Settings / System Config

- Editable app name (church name changes)
- Manage branding information
- Allow uploading church logo/banner
- About page auto-update based on config

#### Visitor Attendance

- Record attendance of attendees NOT in membership list
- Mark as:
  - Visitor
  - Member (if selected)
- Add follow-up option:
  - "Visited 1x"
  - "Visited 2x"
  - "Regular Visitor"
- Convert visitor → member (one-click migration)
- Visitor attendance report

#### Membership Profile Enhancements

- Show attendance history inside Membership Profile
- Stats:
  - % attendance
  - Last attended date
  - Ministry participation frequency
- Show anniversaries & birthdays
- Family links (optional Phase 4)

#### UI/UX Improvements

- Improve UI consistency
- Clean up table styles
- Make dashboard more engaging
- Replace placeholders with real icons & cards
- Use real images for login background

---

## Public Homepage (Separate Repository)

### Overview

The Public Homepage is a standalone website intended for church members, visitors, and the general public. It is separate from the SBCC Management System dashboard and serves as the church's primary online presence. The homepage provides access to public-facing features such as announcements, ministries, contact information, and prayer request submissions.

This project will be stored in a separate GitHub repository.

| Component | Stack |
|-----------|-------|
| Frontend | React (Vite), Tailwind CSS, Shadcn/UI |
| Deployment | Cloudflare |

### Objectives

- Provide a modern, accessible, welcoming homepage for SBCC
- Give members access to announcements and updates
- Allow visitors to submit prayer requests and inquire about ministries
- Redirect leaders/members to the internal Management System
- Improve the church's online presence and communication

### Core Features

#### Public Announcements

- Fetch and display announcements from SBCCMS Public API
- Display announcement cards with:
  - Title
  - Date
  - Category
  - Thumbnail
  - Description snippet
- "Read more" modal or expanded view

#### Online Prayer Request Submission

- Public form allowing members and visitors to submit prayer requests
- Fields:
  - Name (optional)
  - Email (optional)
  - Prayer Request (required)
  - Category (Healing, Guidance, Family, Thanksgiving, etc.)
  - "Submit Anonymously" toggle
- Sends request to SBCCMS via: `POST /public/prayer-request/`
- Show success confirmation

#### About the Church

- Church mission & vision
- Church history
- Statement of faith
- Pastoral & leadership team
- Generated imagery of church themes

#### Contact Page

- Phone numbers
- Email addresses
- Church location map
- Facebook and social media links
- Contact form (optional)

#### Events & Calendar (Optional / After Phase 4)

- Public version of the SBCCMS events module
- Display upcoming events
- Filters for worship, outreach, fellowships, etc.

#### Online Giving Page (Optional / After Phase 4)

- GCash and bank transfer details
- Instructions
- Disclaimer message

#### Navigation Elements

- CTA: Access the Management System
- Navbar
- Hero section
- Footer

### Design & Development Requirements

- Built using React (Vite)
- Styled with Tailwind CSS + shadcn/ui components
- Fully responsive (mobile-first)
- SEO optimized
- Modular folder structure
- Lazy loading for images
- Smooth animations
- ARIA & a11y compliance
- Clean and well-structured React components

### Public APIs (Provided by SBCCMS Backend)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/public/announcements/` | GET | Announcements |
| `/public/prayer-request/` | POST | Prayer Request Submission |
| `/public/events/` | GET | Events (optional) |

---

## Target Users

| Role | Description |
|------|-------------|
| Super Admin | Has full system access; manages users, modules, and settings |
| Admin Staff | Manage memberships, attendance, events, and reports |
| Pastor / Elders | Handle prayer requests, track pastoral care, and manage member spiritual records |
| Ministry Leaders | Assigned by Admin; Receive reports via email and manage volunteers, inventory, and events within their ministry |
| Volunteers | View their assigned schedules and ministry activities through email |
| Members | Access the public website for announcements, events, and prayer requests |
| Visitors | Access the public website to learn about the church and submit prayer requests |

---

## System Architecture

| Component | Stack |
|-----------|-------|
| Frontend | React (Vite), Tailwind CSS, Flowbite React, Figma (UI/UX) |
| Backend | Django REST Framework |
| Database (Web) | PostgreSQL (centralized, scalable, relational) |
| Database (Desktop) | SQLite (lightweight, local, synced when connected) |
| Design Tool | Figma |
| Version Control | Git + GitHub (monorepo) |
| Testing | Pytest-Django, Vitest, Playwright |
| Deployment | Cloud Hosting (Cloudflare/Railway) |

---

## Development Workflow

1. **UI/UX Team (Figma):** Create component-based designs aligned with Tailwind tokens
2. **Frontend Team:** Use Figma as reference → Manually code components → Use Flowbite/DaisyUI for base components
3. **Backend Team:** Build Django REST APIs, handle authentication, scheduling logic, and certificate generation
4. **Integration:** Connect frontend React components to backend APIs
5. **Testing & QA:** Conduct UAT with church staff; fix based on feedback
6. **Deployment:**
   - Web: Deployed on a cloud server (e.g., AWS, DigitalOcean, or Heroku)
   - Desktop (For offline use): Packaged with Tauri for offline distribution

---

## Testing Requirements

### Backend

- Django unit tests (pytest-django)
- API endpoint tests
- Model validation tests
- **Target:** 80% code coverage

### Frontend

- Component tests (Vitest + React Testing Library)
- Integration tests (Playwright)
- **Target:** 70% code coverage

### Quality Assurance

- Manual UAT with church staff
- Cross-browser testing (Chrome, Firefox, Safari)
- Responsive design testing (mobile, tablet, desktop)

---

## Project Timeline

| Milestone | Date |
|-----------|------|
| Prototype Presentation | November 09, 2025 |
| Final Presentation | December 14, 2025 |

### Progress Reports

Send to:

- rudycambel11@gmail.com
- 1992.sbcc@gmail.com
- badillomarife19@gmail.com

---

## Feedback: Prototype Presentation (November 09, 2025)

### Admin Login

- Use real images for the login background
- Strengthen authentication experience

### Inventory

- Include depreciation tracking (already added to Phase 3)
- Printable lists
- QR code/sticker markings
- Labels per item
- Remarks field
- Access authentication per ministry head

### Tasks

- Replace due date → timeline feature (start–end)

### Attendance

- Notify admin when members are frequently absent
- Integrate with membership activity
- Support visitors not in membership list

### Minutes of Meetings

- Add word search
- Add categorization of files

### System Management

- Add system/account management to edit app name
- Support for potential church name changes

### General UI

- UI/UX improvements
- Dashboard improvements
