# VillageFund — Transparent Community Fundraising Platform
## Complete Project Feature Reference (AI Editor Context Document)

---

## PROJECT OVERVIEW

VillageFund is a full-stack web application built to digitize and bring complete financial
transparency to community fundraising in Indian villages. The core problem it solves: village
youth and community members collect money for pujas, cultural events, and development works
into one person's personal bank account — a process that has zero accountability, causes
mistrust, and reduces contributions over time.

VillageFund replaces that with a public, verifiable, gamified platform where every rupee
collected and every rupee spent is visible to the entire community.

---

## TECH STACK

### Backend
- Framework:        Django 5.x + Django REST Framework
- Authentication:   JWT (djangorestframework-simplejwt) + Google OAuth (django-allauth)
- Database:         PostgreSQL
- File Storage:     Cloudinary (images, receipt photos, campaign media)
- PDF Generation:   ReportLab
- Email:            SendGrid (via Django email backend)
- SMS:              Fast2SMS API (Indian SMS gateway)
- WhatsApp:         WhatsApp Cloud API (Meta)
- Task Queue:       Celery + Redis (for notifications and async tasks)

### Frontend
- Framework:        React 18 + Vite
- Styling:          Tailwind CSS
- Routing:          React Router v6
- State:            React Context API + useState/useReducer
- HTTP Client:      Axios
- Google Login:     @react-oauth/google
- Charts:           Recharts
- PDF Preview:      react-pdf
- Animations:       Framer Motion
- Icons:            Lucide React

### Deployment
- Backend:          Railway (with PostgreSQL addon)
- Frontend:         Vercel
- Media Storage:    Cloudinary
- Environment:      python-decouple for env variable management

---

## COLOR THEME & BRANDING

- Primary Color:    Saffron Orange (#FF6B00)
- Secondary Color:  Deep Green (#1A6B3C)
- Background:       Off-white (#FAFAF7)
- Text:             Dark Charcoal (#1C1C1C)
- Accent:           Gold (#D4AF37)
- Font:             Poppins (headings) + Inter (body)
- Language:         English UI with Hindi option toggle
- Currency Format:  Indian style (₹ with lakh/crore formatting)
- Village Name:     [VILLAGE_NAME] — to be set in environment variable

---

## USER ROLES & PERMISSIONS

### Role 1: SUPER_ADMIN
- Full platform access
- Can create/delete/edit any campaign, contribution, or expense
- Can assign and revoke roles for any user
- Can view complete audit log
- Can generate all reports
- Can manage platform settings

### Role 2: TREASURER
- Can create and manage campaigns
- Can approve or reject pending contributions
- Can post expenses with receipt images
- Can generate campaign-level reports
- Cannot change other users' roles
- One treasurer is designated as "Active Treasurer" per campaign

### Role 3: CONTRIBUTOR
- Can view all campaigns (active, completed, archived)
- Can submit contributions (UTR number + amount)
- Can view public ledger, leaderboard, gallery, transparency page
- Can comment on campaigns
- Can raise flags on suspicious expenses
- Cannot approve their own contributions

### Role 4: VIEWER (Guest / NRI / Outside-Village)
- Read-only access to all public pages
- Can view campaigns, ledger, gallery, transparency data
- Cannot contribute directly (admin must upgrade to CONTRIBUTOR)
- NRI contributors get a special GUEST_CONTRIBUTOR sub-role
  that allows them to submit contributions from outside the village

### Default role for new registrations: CONTRIBUTOR
### Default role for Google OAuth new users: CONTRIBUTOR
### Role upgrades: Only SUPER_ADMIN can upgrade a user's role

---

## DATABASE MODELS

### User (Custom AbstractUser)
```
id                  UUID (primary key)
phone_number        CharField (unique, required for phone login)
email               EmailField (required for Google login)
full_name           CharField
profile_photo       CloudinaryField (optional)
role                CharField (choices: SUPER_ADMIN, TREASURER, CONTRIBUTOR, VIEWER)
is_nri              BooleanField (default False)
village_name        CharField (for multi-village future support)
google_id           CharField (nullable, for OAuth users)
date_joined         DateTimeField
last_login          DateTimeField
is_active           BooleanField
```

### Campaign
```
id                  UUID (primary key)
title               CharField
description         TextField
category            CharField (choices: RELIGIOUS, INFRASTRUCTURE, SOCIAL, CULTURAL, EDUCATION, HEALTH)
goal_amount         DecimalField
raised_amount       DecimalField (auto-calculated from approved contributions)
status              CharField (choices: DRAFT, VOTING, ACTIVE, FUNDED, COMPLETED, CANCELLED, ARCHIVED)
start_date          DateField
end_date            DateField
cover_image         CloudinaryField
created_by          ForeignKey(User)
treasurer           ForeignKey(User) — designated treasurer for this campaign
campaign_upi_id     CharField (UPI ID to display for payments)
campaign_qr_image   CloudinaryField (QR code image for UPI)
requires_voting     BooleanField (if True, campaign needs community approval before going ACTIVE)
voting_threshold    IntegerField (default 60 — percentage needed to pass vote)
created_at          DateTimeField
updated_at          DateTimeField
```

### CampaignMilestone
```
id                  UUID
campaign            ForeignKey(Campaign)
title               CharField
target_amount       DecimalField
description         TextField
is_unlocked         BooleanField (auto-set when raised_amount reaches target_amount)
proof_photo         CloudinaryField (uploaded when milestone is complete)
unlocked_at         DateTimeField (nullable)
```

### CampaignBudgetItem
```
id                  UUID
campaign            ForeignKey(Campaign)
label               CharField (e.g., "Materials", "Labour", "Decoration")
planned_amount      DecimalField
```

### CampaignUpdate
```
id                  UUID
campaign            ForeignKey(Campaign)
posted_by           ForeignKey(User)
title               CharField
body                TextField
photo               CloudinaryField (optional)
video_url           CharField (YouTube embed URL, optional)
posted_at           DateTimeField
```

### CampaignVote
```
id                  UUID
campaign            ForeignKey(Campaign)
voter               ForeignKey(User)
vote                BooleanField (True = Yes, False = No)
voted_at            DateTimeField
```

### Contribution
```
id                  UUID
campaign            ForeignKey(Campaign)
contributor         ForeignKey(User)
amount              DecimalField
utr_number          CharField (12-digit UPI transaction reference)
payment_method      CharField (default "UPI")
status              CharField (choices: PENDING, APPROVED, REJECTED)
submitted_at        DateTimeField
approved_at         DateTimeField (nullable)
approved_by         ForeignKey(User) (nullable — treasurer who approved)
rejection_reason    TextField (nullable)
pledge_id           ForeignKey(Pledge) (nullable — if part of installment pledge)
note                CharField (optional message from contributor)
```

### Pledge (Installment Contribution)
```
id                  UUID
campaign            ForeignKey(Campaign)
contributor         ForeignKey(User)
total_amount        DecimalField
installment_amount  DecimalField
installment_count   IntegerField
frequency           CharField (choices: MONTHLY, WEEKLY)
start_date          DateField
next_due_date       DateField
installments_paid   IntegerField (default 0)
status              CharField (choices: ACTIVE, COMPLETED, CANCELLED)
```

### Expense
```
id                  UUID
campaign            ForeignKey(Campaign)
posted_by           ForeignKey(User)
amount              DecimalField
description         CharField
category            CharField (e.g., "Material", "Labour", "Food", "Transport")
receipt_image       CloudinaryField (optional but encouraged)
posted_at           DateTimeField
approval_status     CharField (choices: PENDING, APPROVED, REJECTED)
approved_by         ForeignKey(User) (nullable)
requires_multi_sig  BooleanField (True if amount > MULTI_SIG_THRESHOLD)
approval_count      IntegerField (number of approvals received so far)
```

### ExpenseApproval (for Multi-Signature)
```
id                  UUID
expense             ForeignKey(Expense)
approved_by         ForeignKey(User)
approved_at         DateTimeField
```

### ExpenseFlag
```
id                  UUID
expense             ForeignKey(Expense)
flagged_by          ForeignKey(User)
reason              TextField
status              CharField (choices: OPEN, RESOLVED, DISMISSED)
created_at          DateTimeField
resolution_note     TextField (nullable)
```

### Badge
```
id                  UUID
slug                CharField (unique — e.g., "first_donor", "big_heart", "consistent_giver")
name                CharField
description         CharField
icon_url            CharField
criteria_type       CharField (choices: FIRST_DONOR, TOP_3, CAMPAIGN_COUNT, AMOUNT_THRESHOLD, STREAK)
criteria_value      IntegerField (e.g., 5 for "5 campaigns")
```

### UserBadge
```
id                  UUID
user                ForeignKey(User)
badge               ForeignKey(Badge)
campaign            ForeignKey(Campaign) (nullable — campaign-specific badges)
awarded_at          DateTimeField
```

### ContributionStreak
```
id                  UUID
user                ForeignKey(User)
current_streak      IntegerField
longest_streak      IntegerField
last_contributed_at DateTimeField
```

### GalleryPhoto
```
id                  UUID
campaign            ForeignKey(Campaign) (nullable)
photo               CloudinaryField
caption             CharField
category            CharField (choices: BEFORE, DURING, AFTER, EVENT, GENERAL)
uploaded_by         ForeignKey(User)
uploaded_at         DateTimeField
is_featured         BooleanField (featured on homepage)
video_url           CharField (optional YouTube link)
```

### VillageReserve
```
id                  UUID (single row)
balance             DecimalField
last_updated        DateTimeField
description         TextField (notes on reserve balance)
```

### ReserveLedgerEntry
```
id                  UUID
amount              DecimalField
entry_type          CharField (choices: CREDIT, DEBIT)
reason              CharField
campaign            ForeignKey(Campaign) (nullable)
posted_by           ForeignKey(User)
posted_at           DateTimeField
```

### ContactMessage
```
id                  UUID
name                CharField
phone_number        CharField
email               EmailField (optional)
category            CharField (choices: GENERAL, ISSUE, SUGGEST_CAMPAIGN, TECHNICAL)
message             TextField
submitted_at        DateTimeField
is_resolved         BooleanField
```

### CampaignComment
```
id                  UUID
campaign            ForeignKey(Campaign)
author              ForeignKey(User)
body                TextField
parent              ForeignKey(self) (nullable — for threaded replies)
posted_at           DateTimeField
is_deleted          BooleanField
```

### Notification
```
id                  UUID
recipient           ForeignKey(User)
title               CharField
body                CharField
type                CharField (choices: CONTRIBUTION_APPROVED, NEW_CAMPAIGN, EXPENSE_POSTED, PLEDGE_DUE, BADGE_EARNED, FLAG_RAISED)
is_read             BooleanField
campaign            ForeignKey(Campaign) (nullable)
created_at          DateTimeField
```

### AuditLog
```
id                  UUID
actor               ForeignKey(User)
action              CharField (e.g., "APPROVED_CONTRIBUTION", "POSTED_EXPENSE", "CHANGED_ROLE")
target_model        CharField
target_id           CharField
meta                JSONField (additional context)
ip_address          GenericIPAddressField
timestamp           DateTimeField
```

### Sponsorship
```
id                  UUID
campaign            ForeignKey(Campaign)
sponsor_name        CharField
sponsor_logo        CloudinaryField
sponsor_amount      DecimalField
is_cash             BooleanField (False = in-kind)
in_kind_description TextField (nullable)
in_kind_value       DecimalField (nullable)
approved_by         ForeignKey(User)
created_at          DateTimeField
```

### TreasurerDeclaration
```
id                  UUID
campaign            ForeignKey(Campaign)
treasurer           ForeignKey(User)
declaration_text    TextField
signed_at           DateTimeField
```

---

## API ENDPOINTS

### Authentication
```
POST   /api/auth/register/              Register with phone + name + password
POST   /api/auth/login/                 Login, returns JWT access + refresh tokens
POST   /api/auth/google/                Google OAuth — send Google credential token, get JWT
POST   /api/auth/token/refresh/         Refresh JWT access token
POST   /api/auth/logout/                Blacklist refresh token
GET    /api/auth/me/                    Get current user profile
PATCH  /api/auth/me/                    Update profile (name, photo)
```

### Users (Admin only)
```
GET    /api/users/                      List all users (paginated)
GET    /api/users/{id}/                 Get user detail
PATCH  /api/users/{id}/role/            Change user role (SUPER_ADMIN only)
GET    /api/users/{id}/contributions/   All contributions by a user
GET    /api/users/{id}/badges/          All badges earned by a user
```

### Campaigns
```
GET    /api/campaigns/                  List campaigns (filter: status, category)
POST   /api/campaigns/                  Create campaign (TREASURER/ADMIN only)
GET    /api/campaigns/{id}/             Campaign detail
PATCH  /api/campaigns/{id}/             Edit campaign (creator or ADMIN)
DELETE /api/campaigns/{id}/             Delete campaign (ADMIN only)
GET    /api/campaigns/{id}/progress/    Goal, raised, percentage, days left
GET    /api/campaigns/{id}/updates/     Campaign updates list
POST   /api/campaigns/{id}/updates/     Post update (TREASURER/ADMIN)
GET    /api/campaigns/{id}/milestones/  Milestones list
POST   /api/campaigns/{id}/vote/        Submit community vote
GET    /api/campaigns/{id}/vote/result/ Voting results
```

### Contributions
```
GET    /api/contributions/              List all contributions (public, filterable)
POST   /api/contributions/             Submit contribution (UTR + amount + campaign)
GET    /api/contributions/{id}/        Contribution detail
PATCH  /api/contributions/{id}/approve/ Approve contribution (TREASURER/ADMIN)
PATCH  /api/contributions/{id}/reject/  Reject contribution (TREASURER/ADMIN)
GET    /api/contributions/export/pdf/  Export full ledger as PDF
GET    /api/contributions/export/excel/ Export as Excel
```

### Pledges
```
POST   /api/pledges/                    Create installment pledge
GET    /api/pledges/                    List own pledges
PATCH  /api/pledges/{id}/cancel/        Cancel a pledge
```

### Expenses
```
GET    /api/expenses/                   List all expenses (public)
POST   /api/expenses/                   Post expense (TREASURER/ADMIN)
GET    /api/expenses/{id}/              Expense detail with receipt
PATCH  /api/expenses/{id}/approve/      Multi-sig approval
POST   /api/expenses/{id}/flag/         Flag suspicious expense
GET    /api/expenses/export/pdf/        Export expense report
```

### Leaderboard
```
GET    /api/leaderboard/                All-time leaderboard
GET    /api/leaderboard/?campaign={id}  Campaign-specific leaderboard
GET    /api/leaderboard/families/       Family-grouped leaderboard
```

### Gallery
```
GET    /api/gallery/                    List photos (filter: category, campaign, year)
POST   /api/gallery/                    Upload photo (TREASURER/ADMIN)
DELETE /api/gallery/{id}/              Delete photo (ADMIN)
```

### Statistics (Public)
```
GET    /api/stats/                      Platform-wide stats:
                                        total_raised, total_spent, reserve_balance,
                                        campaigns_completed, active_contributors,
                                        campaigns_active, health_score
GET    /api/stats/monthly/              Month-by-month financial summary
GET    /api/stats/seasonal/             Giving pattern by month (bar chart data)
```

### Transparency
```
GET    /api/transparency/summary/       Full financial summary (collected, spent, balance)
GET    /api/transparency/audit-log/     Recent audit log entries (public subset)
GET    /api/transparency/declarations/  Treasurer declarations
GET    /api/transparency/report/pdf/   Generate full transparency report PDF
```

### Notifications
```
GET    /api/notifications/              Own notifications (unread first)
PATCH  /api/notifications/{id}/read/   Mark as read
PATCH  /api/notifications/read-all/    Mark all as read
```

### Contact
```
POST   /api/contact/                    Submit contact form
GET    /api/contact/                    List messages (ADMIN only)
```

### Admin Panel Specific
```
GET    /api/admin/dashboard/            Dashboard summary cards
GET    /api/admin/pending-contributions/ Contributions awaiting approval
GET    /api/admin/flagged-expenses/     Flagged expenses
GET    /api/admin/active-sessions/      User sessions
POST   /api/admin/reserve/             Post reserve fund entry
```

### Reports
```
GET    /api/reports/campaign/{id}/pdf/  Campaign-level PDF report
GET    /api/reports/annual/pdf/         Annual Panchayat report PDF
GET    /api/reports/contributor/{id}/   Individual contributor year-in-review PDF
```

---

## FRONTEND PAGES & ROUTES

### Public Pages (no login required)
```
/                           Home / Village Dashboard
/about                      About page
/contact                    Contact Us page
/gallery                    Gallery page
/transparency               Transparency page
/campaigns                  All campaigns list
/campaigns/{id}             Campaign detail page (public view)
/leaderboard                All-time leaderboard
/login                      Login page (phone/password + Google)
/register                   Registration page
```

### Authenticated Pages (login required)
```
/dashboard                  Contributor personal dashboard
/contribute/{campaign_id}   Contribution submission form
/thank-you                  Thank you page (after contribution submitted)
/profile                    Own profile + badges + contribution history
/notifications              Notification center
/chatbot                    AI chatbot page (or floating widget on all pages)
```

### Treasurer Pages
```
/treasurer/campaigns/new          Create new campaign
/treasurer/campaigns/{id}/edit    Edit campaign
/treasurer/campaigns/{id}/expenses/new  Post new expense
/treasurer/contributions          Pending approvals queue
/treasurer/reports                Report generation
```

### Admin Pages
```
/admin/dashboard              Admin overview
/admin/users                  User management
/admin/campaigns              All campaigns management
/admin/audit-log              Full audit log
/admin/reserve                Village reserve fund management
/admin/settings               Platform settings
```

---

## PAGES — DETAILED SPECIFICATIONS

---

### HOME PAGE (/)

Hero Section:
- Village name as large heading with village photo background
- Tagline: "Transparent fundraising for [Village Name]"
- CTA buttons: "View Active Campaigns" and "Contribute Now"

Impact Numbers Banner (live from /api/stats/):
- Total raised all-time (₹ formatted)
- Campaigns completed
- Active contributors
- Village Financial Health Score (0-100)

Active Campaigns Section:
- Grid of Campaign Cards (max 3 featured on home)
- Each card: cover image, title, category badge, progress bar, amount raised vs goal,
  days remaining, contributor count, "Contribute" button

Recently Completed Projects:
- 3-4 cards with before/after thumbnails, project name, amount spent

Latest Gallery Photos:
- 6 featured photos from /api/gallery/?featured=true
- "View Full Gallery" link

Village Announcements Feed:
- Last 5 platform announcements (new campaigns, milestones hit, etc.)

Top Contributors Preview:
- Top 5 all-time contributors with name, amount, and badge icons

Footer:
- Village name, platform name
- Links: About, Contact, Transparency, Privacy Policy
- "Built by [Your Name], B.Tech CSE 2026, MM Engineering College"

---

### CAMPAIGN DETAIL PAGE (/campaigns/{id})

Header:
- Campaign cover image (full-width hero)
- Title, category badge, status pill
- Created by + Treasurer name

Progress Section:
- Large circular progress indicator
- ₹ raised vs ₹ goal
- Percentage funded
- Days remaining
- Number of contributors

UPI Payment Section (if campaign is ACTIVE):
- Treasurer's UPI QR code image
- UPI ID text (copyable)
- Instructions: "Pay via PhonePe / GPay / Paytm, then enter UTR below"
- Contribution form: Amount field, UTR number field, Optional note, Submit button

Budget Breakdown:
- Visual breakdown of planned spend categories (bar or pie chart)

Milestones Timeline:
- Visual progress through campaign milestones
- Locked milestones shown as greyed out

Campaign Updates:
- Chronological list of updates posted by treasurer
- Each update: title, body, optional photo/video, date

Contribution Ledger (for this campaign):
- Table: Contributor Name | Amount | Date | Status
- Searchable and sortable
- Paginated (20 per page)
- "Download PDF" button

Expense Log (for this campaign):
- Table: Description | Amount | Date | Receipt (view icon)
- Running balance shown below: Collected - Spent = Remaining

Campaign Comments:
- Threaded comment section
- Users can ask questions, treasurer can reply
- Moderated by admin

Community Vote Section (if campaign is in VOTING status):
- Yes / No buttons
- Live vote tally shown as percentage bar
- Voting closes at deadline

---

### TRANSPARENCY PAGE (/transparency)

Section 1 — Live Financial Summary (full-width cards):
- Total Ever Collected:     ₹ X
- Total Ever Spent:         ₹ X
- Current Reserve Balance:  ₹ X
- Campaigns Active:         N
- Campaigns Completed:      N

Section 2 — Monthly Financial Summary Table:
- Month | Collected | Spent | Balance
- Last 12 months
- Sortable

Section 3 — Complete Contribution History:
- Searchable table: Contributor | Amount | Campaign | UTR | Date | Status
- Filter by campaign, date range
- All-time, no pagination limit (virtual scroll)

Section 4 — Complete Expense History:
- All expenses ever posted
- Click receipt icon → opens receipt image in modal
- Filter by campaign, category, date

Section 5 — Treasurer Declarations:
- Cards for each active/past treasurer
- Name, photo, declaration text, signed date

Section 6 — Public Audit Log:
- Last 50 admin actions
- Actor | Action | Target | Timestamp
- "Download Full Audit Log PDF" button

Section 7 — Download Center:
- Download Full Ledger (PDF)
- Download Expense Report (PDF)
- Download This Month's Summary (PDF)
- Download Annual Report (PDF)
- Download Contributor List (Excel)

---

### GALLERY PAGE (/gallery)

Header:
- "Village Impact Gallery" heading
- Total projects shown count

Filter Bar:
- Filter by Category: All / Religious / Infrastructure / Social / Cultural
- Filter by Year: All / 2025 / 2024 / 2023...
- Filter by Campaign: dropdown

Impact Stats Banner:
- "23 Projects Completed | ₹4.2L Raised | 180 Contributors | Since 2022"

Photo Grid:
- Masonry or 3-column grid layout
- Each card: thumbnail, caption, campaign name, category badge, date
- Hover: shows "Before / During / After" label
- Click: opens lightbox with full photo, caption, project details

Lightbox:
- Full-size photo
- Caption + campaign name + amount spent + date
- Before/During/After navigation if multiple photos for same campaign
- "Share on WhatsApp" button
- Embedded YouTube player if video_url exists

Completed Projects Timeline:
- Horizontal scrollable timeline at bottom
- Each completed project as a milestone dot with year label
- Click to jump to that project's photos

---

### ABOUT PAGE (/about)

Section 1 — Village Hero:
- Village name as large text
- Village location, district, state
- Short paragraph about the village (hardcoded)
- Village photo as background

Section 2 — The Problem We Solved:
- Honest story of the old process
- "Money went into one person's account — no records, no trust"
- Stats: "We've made X transactions transparent since launch"

Section 3 — How It Works (3-step visual):
- Step 1: "Treasurer creates a campaign with goal and deadline"
- Step 2: "Contributors pay via UPI and submit UTR number"
- Step 3: "Treasurer approves + posts every expense with receipts"

Section 4 — Village Committee / Team:
- Photo cards for: Current Treasurer, Super Admin, Founding Members
- Name, role, phone (optional)

Section 5 — Live Platform Stats (from /api/stats/):
- Total raised, campaigns completed, contributors, years active

Section 6 — Tech Credits:
- "This platform was built by [Your Name]"
- B.Tech CSE 2026, MM Engineering College, Mullana, Haryana
- GitHub link, LinkedIn link

---

### CONTACT PAGE (/contact)

Contact Form:
- Full Name (required)
- Phone Number (required)
- Email (optional)
- Category dropdown: General Query / Report Issue / Suggest Campaign / Technical Problem
- Message textarea
- Submit button → POST /api/contact/
- Success: inline confirmation message (no page reload)
- On submission: email sent to admin via SendGrid

Direct Contact Section:
- Treasurer's WhatsApp (wa.me/ link with pre-filled message)
- Village address
- Platform email ID

FAQ Accordion:
- Q: How do I know my money reached the right place?
- Q: Can I contribute if I live outside the village?
- Q: How long does contribution approval take?
- Q: Who can create a campaign?
- Q: What if a campaign doesn't reach its goal?
- Q: How do I become a Treasurer?
- Q: Is my contribution data visible to everyone?
- Q: How do I report a suspicious expense?

---

### LEADERBOARD PAGE (/leaderboard)

Tabs:
- All-Time | This Month | By Campaign | Family Rankings

All-Time Tab:
- Top 3 highlighted with gold/silver/bronze podium visual
- Full ranked table: Rank | Name | Total Contributed | Campaigns | Badges
- User's own rank highlighted (if logged in)

By Campaign Tab:
- Dropdown to select campaign
- Same ranked table filtered to that campaign

Family Rankings Tab:
- Groups contributors by family surname
- Family Name | Combined Total | Members Count | Top Contributor

Badges Showcase:
- All available badges displayed with icon, name, description
- Earned badges highlighted (if logged in)
- "X contributors have earned this badge"

---

### THANK YOU PAGE (/thank-you)

Triggered after: Contribution form submitted successfully

Content:
- Animated checkmark or confetti animation (Framer Motion)
- "Dhanyavaad, [Contributor Name]! 🙏"
- Contribution summary card:
    - Campaign name
    - Amount
    - UTR number
    - Submission timestamp
    - Contribution ID
    - Status: "Pending Treasurer Approval"
- "What happens next?" steps:
    - Your UTR is submitted
    - Treasurer will verify within 24 hours
    - You'll receive a WhatsApp/email confirmation
    - Your name will appear on the public ledger
- Leaderboard teaser:
    - "You are currently #N contributor for this campaign"
    - "Contribute ₹X more to reach Top 5"
- Badge preview (if a badge was just earned)
- Share on WhatsApp button:
    - Pre-filled: "Maine aaj [Campaign Name] mein ₹[Amount] contribute kiya!
      VillageFund pe transparent fundraising dekho: [link]"
- "View Campaign" and "Go to Dashboard" buttons

---

### PROFILE PAGE (/profile)

Personal Stats:
- Total contributed (all-time)
- Number of campaigns supported
- Current contribution streak
- Longest streak
- All-time rank

Badges Section:
- All earned badges with campaign and date
- Locked badges shown greyed with "X more to unlock"

Contribution History:
- Personal table: Campaign | Amount | Date | Status
- Download "My Contribution Summary" PDF

Pledge Tracker:
- Active pledges with next due date
- Installments paid vs total
- Cancel pledge button

---

### CHATBOT (Floating widget, appears on all pages)

Trigger:
- Floating button (bottom-right corner, saffron color, chat icon)
- Opens as slide-up panel (mobile) or side panel (desktop)

Greeting:
- "Namaste! 🙏 I'm the VillageFund Assistant. How can I help you?"
- Quick action chips: "How to contribute", "Active campaigns",
  "Check transparency", "My contribution status", "Contact treasurer"

Intents handled:

1. how_to_contribute:
   → Step-by-step UPI payment guide with UPI ID for active campaign

2. active_campaigns:
   → Fetches GET /api/campaigns/?status=active
   → Displays campaign name, goal, progress inline in chat

3. contribution_status:
   → Asks for phone number → fetches user's latest contributions
   → Shows status of each (Pending / Approved)

4. transparency:
   → Pulls /api/stats/ and displays summary
   → Links to Transparency page

5. leaderboard:
   → Fetches top 3 contributors and displays inline

6. contact:
   → Shows treasurer WhatsApp link and contact form link

7. how_to_register:
   → Step by step registration guide

8. report_issue:
   → "Please visit our Contact page or WhatsApp the treasurer"

9. campaign_detail (if user types campaign name):
   → Fetches campaign info and shows progress

10. hindi_switch:
    → Switches chatbot responses to Hindi

AI-Powered mode (Option B — Anthropic API):
- System prompt includes village name, current stats, active campaigns data
- Uses claude-sonnet-4-20250514 model
- Responds in user's language (Hindi or English auto-detected)
- Cannot reveal sensitive data (unapproved UTR details, user phone numbers)
- Max tokens: 300 per response (keep answers concise)

---

## AUTHENTICATION FLOWS

### Phone + Password Registration:
1. User fills: Full Name, Phone Number, Password, Confirm Password
2. POST /api/auth/register/ → creates user with role=CONTRIBUTOR
3. Redirect to login page with success message

### Phone + Password Login:
1. User fills: Phone Number, Password
2. POST /api/auth/login/ → returns access + refresh JWT
3. Store tokens in localStorage
4. Redirect to /dashboard

### Google Sign-In:
1. User clicks "Sign in with Google" button
2. Google OAuth popup opens
3. On success, Google returns a credential token
4. Frontend sends credential token to POST /api/auth/google/
5. Backend verifies with Google, finds or creates user
6. Returns app JWT tokens
7. New Google users: role=CONTRIBUTOR, email from Google, full_name from Google
8. Redirect to /dashboard

### JWT Refresh:
- Axios interceptor auto-refreshes access token using refresh token
- If refresh also expired → logout user, redirect to /login

---

## NOTIFICATION SYSTEM

### Triggers and recipients:

| Event | Recipients |
|---|---|
| New campaign created | All CONTRIBUTOR+ users |
| Contribution approved | Contributor who submitted |
| Contribution rejected | Contributor who submitted (with reason) |
| New expense posted | All contributors of that campaign |
| Expense flagged | Treasurer + SUPER_ADMIN |
| Campaign goal reached | All contributors of that campaign |
| Milestone unlocked | All contributors of that campaign |
| Badge earned | Badge recipient only |
| Pledge installment due | Pledge owner (3 days before) |
| Campaign ending soon | All contributors who haven't contributed yet |

### Channels:
- In-app notification bell (always)
- Email via SendGrid (if email exists)
- WhatsApp via WhatsApp Cloud API (if opted in)
- SMS via Fast2SMS (fallback for users without WhatsApp/email)

---

## GAMIFICATION SYSTEM

### Badges (auto-awarded after contribution approval):

| Badge Slug | Name | Criteria |
|---|---|---|
| first_donor | Foundation Stone | First to contribute to a campaign |
| big_heart | Big Heart | Top 3 contributor in a campaign |
| generous_soul | Generous Soul | Single contribution above ₹5,000 |
| consistent_giver | Consistent Giver | Contributed to 5+ campaigns |
| streak_3 | Hat-Trick | 3 consecutive campaigns |
| streak_5 | Fab Five | 5 consecutive campaigns |
| streak_10 | Village Champion | 10 consecutive campaigns |
| early_bird | Early Bird | Contributed within 1 hour of campaign launch |
| full_supporter | All-Rounder | Contributed to campaigns in all 4 categories |
| nri_heart | NRI Heart | NRI contributor (is_nri=True) |

### Leaderboard Rankings:
- All-time total contributed (primary)
- Number of campaigns supported (secondary)
- Streak count (tertiary tiebreaker)

### Contribution Streak:
- Incremented every time user contributes to a new campaign
- Resets if user skips a campaign completely (campaign must have been ACTIVE)
- Streak saved in ContributionStreak model

---

## PAYMENT FLOW (UPI-BASED)

This platform does NOT integrate a payment gateway (avoids RBI compliance).
Instead it uses a UTR verification flow:

Step 1: Contributor views campaign page
Step 2: Contributor sees Treasurer's UPI QR code and UPI ID
Step 3: Contributor pays via PhonePe / GPay / Paytm on their phone
Step 4: Contributor comes back to the website
Step 5: Contributor fills: Amount, UTR Number (12 digits), Optional note
Step 6: POST /api/contributions/ → status = PENDING
Step 7: Contributor redirected to /thank-you page
Step 8: Treasurer logs in, sees pending contributions queue
Step 9: Treasurer verifies UTR against their bank/UPI app
Step 10: Treasurer clicks "Approve" → status = APPROVED
Step 11: Campaign raised_amount auto-updates
Step 12: Contributor gets WhatsApp + in-app notification: "Contribution Approved!"
Step 13: Contributor's name appears on public ledger

---

## MULTI-SIGNATURE EXPENSE APPROVAL

For expenses above MULTI_SIG_THRESHOLD (default: ₹2,000 — configurable in settings):

1. Treasurer posts expense → status = PENDING, requires_multi_sig = True
2. Notification sent to all users with TREASURER or SUPER_ADMIN role
3. Each eligible approver sees "Approve" button on the expense
4. Each approval creates an ExpenseApproval record
5. When approval_count reaches required threshold (default: 2 out of designated approvers):
   → expense status = APPROVED automatically
6. Expense now visible on public transparency page with all approver names

---

## PDF REPORTS (ReportLab)

### Campaign Report (/api/reports/campaign/{id}/pdf/):
- Cover: Village name, campaign name, date range
- Section 1: Campaign summary (goal, raised, spent, remaining, status)
- Section 2: Budget breakdown vs actual spend
- Section 3: Full contributor table (name, amount, date, UTR)
- Section 4: Full expense table (description, amount, date, receipt reference)
- Section 5: Milestone completion status
- Footer: "Generated by VillageFund | [timestamp]"

### Annual Panchayat Report (/api/reports/annual/pdf/):
- Cover: Village name, year, logo
- Executive Summary: Total raised, spent, reserve, campaigns, contributors
- Campaign-by-campaign summary table
- Top 10 contributors of the year
- Expense category breakdown (pie chart embedded)
- Reserve fund movement
- Month-by-month financial table
- Committee/Treasurer signatures section (blank lines for physical signing)

### Contributor Year-In-Review (/api/reports/contributor/{id}/):
- "Your [Year] VillageFund Contribution Report"
- Total contributed, campaigns supported, rank, badges earned
- Campaign-by-campaign breakdown
- "Thank you for your contribution to [Village Name]" closing message
- Shareable as WhatsApp image

---

## VILLAGE FINANCIAL HEALTH SCORE

A single 0-100 score calculated from:

| Factor | Weight | Description |
|---|---|---|
| Campaign completion rate | 25% | Completed / Total campaigns |
| Expense transparency | 25% | Expenses with receipts / Total expenses |
| Contributor growth | 20% | New contributors vs previous period |
| On-time approval rate | 15% | Contributions approved within 48hrs |
| Goal achievement rate | 15% | Campaigns that hit goal / Total |

Score categories:
- 80–100: Excellent (shown in green)
- 60–79:  Good (shown in blue)
- 40–59:  Average (shown in yellow)
- 0–39:   Needs Improvement (shown in red)

---

## ENVIRONMENT VARIABLES REQUIRED

```
# Django
SECRET_KEY=
DEBUG=False
ALLOWED_HOSTS=your-railway-domain.railway.app

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (SendGrid)
SENDGRID_API_KEY=
DEFAULT_FROM_EMAIL=noreply@villagefund.in
ADMIN_EMAIL=admin@villagefund.in

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=

# Fast2SMS
FAST2SMS_API_KEY=

# Celery / Redis
REDIS_URL=redis://localhost:6379/0

# Platform Config
VILLAGE_NAME=YourVillageName
MULTI_SIG_THRESHOLD=2000
MULTI_SIG_REQUIRED_APPROVALS=2
FRONTEND_URL=https://your-vercel-app.vercel.app

# Anthropic (for AI chatbot)
ANTHROPIC_API_KEY=
```

---

## DEPLOYMENT CONFIGURATION

### Backend (Railway):
- Procfile: `web: gunicorn villagefund.wsgi --log-file -`
- Runtime: Python 3.11
- Buildpack: Python
- PostgreSQL addon: enabled
- Redis addon: enabled (for Celery)
- Static files: WhiteNoise middleware
- Environment variables: set via Railway dashboard

### Frontend (Vercel):
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- vercel.json: rewrite all routes to index.html (for React Router)
- Environment Variables:
    - VITE_API_URL = Railway backend URL
    - VITE_GOOGLE_CLIENT_ID = Google OAuth client ID

---

## PROJECT FOLDER STRUCTURE

### Backend (Django)
```
villagefund_backend/
├── villagefund/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── celery.py
├── apps/
│   ├── users/
│   │   ├── models.py       (User, ContributionStreak)
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── campaigns/
│   │   ├── models.py       (Campaign, Milestone, BudgetItem, Update, Vote)
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── contributions/
│   │   ├── models.py       (Contribution, Pledge)
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── expenses/
│   │   ├── models.py       (Expense, ExpenseApproval, ExpenseFlag)
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── badges/
│   │   ├── models.py       (Badge, UserBadge)
│   │   ├── services.py     (award_badges logic)
│   │   └── urls.py
│   ├── gallery/
│   │   ├── models.py       (GalleryPhoto)
│   │   ├── views.py
│   │   └── urls.py
│   ├── notifications/
│   │   ├── models.py       (Notification)
│   │   ├── tasks.py        (Celery tasks for WhatsApp, SMS, email)
│   │   └── services.py
│   ├── reports/
│   │   ├── views.py        (PDF generation endpoints)
│   │   └── generators.py   (ReportLab logic)
│   ├── transparency/
│   │   ├── views.py
│   │   └── urls.py
│   └── contact/
│       ├── models.py
│       └── views.py
├── requirements.txt
├── Procfile
├── .env.example
└── manage.py
```

### Frontend (React)
```
villagefund_frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/
│   │   ├── axios.js        (base Axios instance + interceptors)
│   │   ├── auth.js
│   │   ├── campaigns.js
│   │   ├── contributions.js
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Gallery.jsx
│   │   ├── Transparency.jsx
│   │   ├── Campaigns.jsx
│   │   ├── CampaignDetail.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── ThankYou.jsx
│   │   ├── Notifications.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagement.jsx
│   │       ├── AuditLog.jsx
│   │       └── ReserveManagement.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   ├── campaigns/
│   │   │   ├── CampaignCard.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ContributionForm.jsx
│   │   │   ├── ContributionLedger.jsx
│   │   │   ├── ExpenseLog.jsx
│   │   │   └── MilestoneTimeline.jsx
│   │   ├── leaderboard/
│   │   │   ├── LeaderboardTable.jsx
│   │   │   └── PodiumTop3.jsx
│   │   ├── badges/
│   │   │   └── BadgeCard.jsx
│   │   ├── gallery/
│   │   │   ├── PhotoGrid.jsx
│   │   │   └── Lightbox.jsx
│   │   ├── chatbot/
│   │   │   └── ChatbotWidget.jsx
│   │   └── common/
│   │       ├── LoadingSpinner.jsx
│   │       ├── ConfirmModal.jsx
│   │       └── IndianCurrency.jsx  (₹ formatter component)
│   └── utils/
│       ├── formatCurrency.js   (Indian lakh/crore formatting)
│       ├── dateUtils.js
│       └── jwtUtils.js
├── public/
│   └── village-logo.png
├── vercel.json
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## FINAL YEAR PROJECT FRAMING

### Title:
"VillageFund: A Transparent Community Fundraising Platform for Rural India"

### Problem Statement:
Informal community fund collection in Indian villages lacks accountability,
traceability, and trust — leading to reduced contributions and financial disputes.

### Objective:
To build a full-stack web platform that digitizes village-level fundraising with
complete financial transparency, role-based access control, gamified engagement,
and automated reporting.

### Key Technical Contributions:
1. Multi-signature expense approval system for distributed financial control
2. Public immutable audit log for every platform action
3. Milestone-gated fund release mechanism
4. Real-time village financial health scoring algorithm
5. UTR-based UPI payment verification without payment gateway compliance overhead
6. AI-powered bilingual chatbot (Hindi/English) with live campaign data integration

### Impact:
- Deployed and actively used by [Village Name], Rajasthan/Haryana
- [N] contributors onboarded, ₹[X] tracked transparently since launch

---

*This document serves as the complete feature reference and AI editor context for the VillageFund project.
Generated for use with Google Antigravity IDE and other AI-assisted development tools.*
*Version: 1.0 | Project by: [Your Name] | B.Tech CSE 2026 | MM Engineering College*
