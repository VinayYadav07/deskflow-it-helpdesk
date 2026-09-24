# DeskFlow – IT Helpdesk & Asset Manager

DeskFlow is a web app for small offices to manage IT support tickets and track company devices in one place.

## The Problem

In small offices, IT problems are often reported through WhatsApp, phone calls, or directly to the IT person.

Because of this:

- IT requests can get lost
- Employees do not know the ticket status
- Device information can become difficult to track
- Warranty details may not be updated

Having worked as an IT Executive, I saw these problems in daily work.

DeskFlow provides a simple ticket system and asset manager to keep IT requests and device information organized.

## Features

### Employees

- Sign up and log in
- Create IT support tickets
- Select category and priority
- Add a description and related device
- Track ticket status in real time
- Add comments to tickets
- View devices assigned to them

### IT Admin

- View all tickets
- Search and filter tickets
- Change ticket status
- Change ticket priority
- Track ticket updates
- Add, edit, delete, and assign assets
- Manage laptops, desktops, monitors, printers, phones, and software licences
- Track device warranties
- See devices whose warranty expires within 30 days
- View ticket and asset statistics on the dashboard
- See average ticket resolution time

### General

- Employee and admin roles
- Firestore security rules
- Real-time Firebase updates
- Responsive design for mobile and desktop

## Tech Stack

- React
- Vite
- React Router
- Context API
- Firebase Authentication
- Cloud Firestore
- Plain CSS
- Vercel

## Screenshots

Add screenshots of:

- Login
- Signup
- Employee Dashboard
- Admin Dashboard
- Tickets
- Ticket Detail
- Assets

## Run Locally

### 1. Clone the project

```bash
git clone <your-github-repository-url>
cd deskflow
npm install
```

### 2. Set up Firebase

1. Create a Firebase project.
2. Enable **Authentication → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Add the Firestore security rules from the project.
5. Create a Firebase Web App.
6. Copy the Firebase configuration.

### 3. Add environment variables

Create a `.env` file in the project root.

Add these variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Do not push the `.env` file to GitHub.

### 4. Start the app

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Make a User Admin

Every new account is created as an **employee**.

To make a user an admin:

1. Sign up in the app.
2. Open Firebase Console.
3. Go to **Firestore Database**.
4. Open the `users` collection.
5. Open the user's document.
6. Change:

```text
role: employee
```

to:

```text
role: admin
```

7. Refresh the app.

The user will then get admin features.

## Deploy on Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add all `VITE_FIREBASE_...` environment variables.
4. Deploy the project.
5. Add your Vercel domain to Firebase Authentication → Authorized domains.

## Test Accounts

Create your own test accounts after setting up Firebase.

Example:

| Role     | Email               | Password      |
| -------- | ------------------- | ------------- |
| Admin    | Your admin email    | Your password |
| Employee | Your employee email | Your password |

Do not store real passwords in the GitHub README.

## Folder Structure

```text
src/
├── components/
│   ├── Navbar
│   ├── Layout
│   ├── ProtectedRoute
│   └── Badge
│
├── context/
│   └── AuthContext
│
├── hooks/
│   ├── useTickets
│   └── useAssets
│
├── pages/
│   ├── Login
│   ├── Signup
│   ├── Dashboard
│   ├── Tickets
│   ├── NewTicket
│   ├── TicketDetail
│   ├── Assets
│   └── NotFound
│
├── constants.js
├── utils.js
├── firebase.js
├── App.jsx
└── index.css
```

## Firestore Data Structure

```text
users/{uid}
    name
    email
    role
    createdAt

tickets/{ticketId}
    title
    description
    category
    priority
    status
    asset
    createdBy
    createdAt
    updatedAt
    resolvedAt

tickets/{ticketId}/comments/{commentId}
    text
    system
    by
    createdAt

assets/{assetId}
    name
    type
    serialNo
    status
    assignedTo
    purchaseDate
    warrantyExpiry
    createdAt
    updatedAt
```

## Future Improvements

- Email notifications when a ticket is updated
- File and screenshot attachments
- Assign tickets to specific IT team members
- Export tickets and assets to CSV
- More detailed admin reports

## Author

**Vinay Kumar Yadav**

Frontend Developer

GitHub: `VinayYadav07`
