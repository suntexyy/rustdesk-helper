# 🖥️ RustDesk x Academy Support Portal

> A real-time support platform that allows academy mentors to remotely assist students through **RustDesk** — without requiring students to create an account.

The **RustDesk x Academy Support Portal** is a lightweight support system designed for academies and educational environments where students may need quick technical assistance from mentors.

Students can join a group, provide their RustDesk connection information, and request help with a single click. Mentors can monitor students in real time, receive help requests, start support sessions, and mark them as completed.

---

## ✨ Features

### 👨‍🎓 Student

- Join an academy group using a unique group code
- No account or authentication required
- Edit personal information at any time
- Save:
  - Full Name
  - RustDesk ID
  - RustDesk Password

- See real-time connection status
- Request help from a mentor
- Receive real-time status updates when a mentor starts or finishes a session

### 🧑‍🏫 Mentor

- Create and manage a group
- Each mentor can create **one group**
- Receive student help requests in real time
- See currently connected students
- View:
  - Student name
  - RustDesk ID
  - RustDesk Password
  - Current status

- Start a support session
- Mark a support session as completed
- Monitor student online/offline status

### ⚡ Real-Time Communication

The application uses **Socket.IO / WebSockets** to keep students and mentors synchronized.

Examples:

```text
Student requests help
        ↓
help_requested
        ↓
Mentor receives notification
        ↓
Mentor starts session
        ↓
help_started
        ↓
Student UI changes to "Ongoing"
        ↓
Mentor finishes session
        ↓
help_completed
        ↓
Student can request help again
```

---

# 🏗️ Architecture

The project is divided into three main parts:

```text
┌──────────────────────┐
│       Student        │
│      Next.js App     │
└──────────┬───────────┘
           │
           │ HTTPS / WSS
           ▼
┌──────────────────────┐
│      Backend API     │
│   Node.js / Express  │
│      Socket.IO       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Database       │
│       MongoDB        │
└──────────────────────┘
           ▲
           │
           │ HTTPS / WSS
           │
┌──────────┴───────────┐
│       Mentor         │
│      Admin Panel     │
└──────────────────────┘
```

### Frontend

Built with:

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Socket.IO Client**
- Feature-based architecture

### Backend

The backend is responsible for:

- API requests
- Authentication
- Group management
- Student management
- Mentor management
- Session state
- WebSocket communication
- Real-time synchronization

### Database

MongoDB is used for persistent server-side data.

### Local Storage

Student profile/session information is stored locally in the browser.

This allows students to refresh the page without losing their information.

---

# 🔄 How It Works

## 1. Role Selection

When the application starts, the user chooses between:

```text
┌──────────────┐     ┌──────────────┐
│   Student    │     │    Mentor    │
└──────┬───────┘     └──────┬───────┘
       │                    │
       ▼                    ▼
   Join Group           Create Group
       │                    │
       ▼                    ▼
     Profile             Profile
       │                    │
       ▼                    ▼
      Group             Dashboard
```

---

# 👨‍🎓 Student Flow

## Step 1 — Join a Group

The student opens the website and enters a group code.

Example:

```text
JS-101
```

The frontend sends the code to the backend to verify that the group exists.

If the group is valid, the student can continue.

---

## Step 2 — Create a Profile

The student enters:

```text
Full Name
RustDesk ID
RustDesk Password
```

Example:

```text
Full Name: John Doe
RustDesk ID: 123456789
RustDesk Password: my-password
```

The information is saved locally in the browser.

Example storage structure:

```ts
{
  fullName: "John Doe",
  rustDeskId: "123456789",
  rustDeskPassword: "my-password",
  groupCode: "JS-101",
  sessionId: "..."
}
```

---

## Step 3 — Enter the Group

After completing the profile, the student enters the group dashboard.

The student can see their current status:

```text
● Online
```

or:

```text
● Ongoing
```

or:

```text
● Offline
```

---

## Step 4 — Request Help

When the student needs assistance, they press:

```text
Ask for Help
```

The frontend emits:

```text
help_requested
```

through Socket.IO.

The mentor immediately receives the request.

---

## Step 5 — Mentor Starts the Session

The mentor sees the student under the help-request section.

The mentor can view:

```text
John Doe

RustDesk ID
123456789

RustDesk Password
********

[ Connect ]
```

When the mentor clicks **Connect**, the student's status changes to:

```text
Ongoing
```

The student receives:

```text
Your mentor is connecting to your computer...
```

The **Ask for Help** button becomes disabled so the student cannot create duplicate requests.

---

## Step 6 — Session Completion

When the mentor finishes helping the student, they click:

```text
Complete
```

The backend broadcasts:

```text
help_completed
```

The student's status returns to:

```text
Online
```

and the student can request help again.

---

# 🧑‍🏫 Mentor Flow

## Step 1 — Select Mentor

From the initial role selection screen, choose:

```text
Mentor
```

---

## Step 2 — Create a Profile

The mentor provides their profile information.

Mentor information is also persisted locally so refreshing the browser does not immediately lose the current mentor session.

---

## Step 3 — Create a Group

A mentor can create **only one group**.

For example:

```text
Group Name: JavaScript Beginners
Group Code: JS-101
```

The backend generates or validates a unique group code.

The mentor can then share:

```text
JS-101
```

with students.

---

## Step 4 — Mentor Dashboard

The mentor dashboard provides a real-time overview of the group.

Example:

```text
JavaScript Beginners
Code: JS-101

Students
────────────────────────────────────

🟢 John Doe
   RustDesk: 123456789
   Status: Online

🟠 Jane Smith
   RustDesk: 987654321
   Status: Needs Help

🔵 Alex Brown
   RustDesk: 555444333
   Status: Ongoing
```

---

# ⚡ WebSocket Events

Real-time synchronization is handled through Socket.IO.

## `join_group`

Triggered when a student joins a group.

```text
Student
   ↓
join_group
   ↓
Socket.IO Room
   ↓
Group
```

The student becomes part of the group's real-time room.

---

## `student_updated`

Triggered when a student changes their profile information.

For example:

```text
RustDesk ID
RustDesk Password
Full Name
```

The mentor's dashboard updates without requiring a page refresh.

---

## `help_requested`

Triggered when a student clicks:

```text
Ask for Help
```

Flow:

```text
Student
   ↓
help_requested
   ↓
Group Room
   ↓
Mentor Dashboard
```

---

## `help_started`

Triggered when the mentor starts helping the student.

The student's interface changes from:

```text
Online
```

to:

```text
Ongoing
```

---

## `help_completed`

Triggered when the mentor finishes the support session.

The student returns to:

```text
Online
```

and can request help again.

---

## `student_disconnected`

Triggered when the student's WebSocket connection disappears.

The mentor can then see the student as:

```text
Offline
```

or remove them from the active student list depending on the application's implementation.

---

# 🔐 Authentication & Security

Mentor/admin functionality is protected using authentication.

The general architecture is:

```text
Mentor
   ↓
Login
   ↓
Backend
   ↓
JWT
   ↓
Protected API / WebSocket
```

Students do **not** need traditional account authentication.

Instead, their temporary identity is maintained through:

- `localStorage`
- Session ID
- Socket.IO connection

### Important

RustDesk credentials are sensitive information.

The application should always use:

```text
HTTPS
```

for HTTP requests and:

```text
WSS
```

for WebSocket connections in production.

Never expose sensitive credentials over unencrypted HTTP/WebSocket connections.

---

# 🗄️ Local Storage

The student experience intentionally uses browser `localStorage`.

This allows information to survive page refreshes.

For example:

```text
Browser
   │
   └── localStorage
          ├── student profile
          ├── group code
          └── session information
```

### Clearing Data

Students should be able to completely remove their local information using:

```text
Leave Group
```

or:

```text
Clear Data
```

This is especially important when using shared computers.

---

# 🔗 RustDesk Integration

The platform is designed to work alongside the RustDesk desktop application.

The mentor receives the student's:

```text
RustDesk ID
RustDesk Password
```

The preferred experience is:

```text
Connect
   ↓
Open RustDesk
   ↓
Connect to Student
```

Depending on the available RustDesk URI/deep-link capabilities, the application may either:

1. Open RustDesk automatically with the student's ID, or
2. Open/copy the necessary connection information so the mentor can enter it manually.

The exact behavior depends on the RustDesk client and supported URI mechanisms.

---

# 📁 Project Structure

The frontend follows a **feature-based architecture**.

A simplified structure looks like:

```text
src/
│
├── app/
│   ├── page.tsx
│   ├── student/
│   ├── mentor/
│   └── ...
│
├── features/
│   ├── auth/
│   ├── student/
│   ├── mentor/
│   ├── groups/
│   ├── dashboard/
│   └── ...
│
├── components/
│   ├── ui/
│   └── ...
│
├── lib/
│   ├── api/
│   ├── socket/
│   └── ...
│
├── hooks/
│
├── types/
│
└── ...
```

The goal of the feature-based structure is to keep business logic separated instead of putting the entire application inside large components.

---

# 🚀 Getting Started

## Prerequisites

Before running the project, make sure you have:

- Node.js
- npm / pnpm / yarn
- MongoDB
- RustDesk installed if you want to test remote support
- The backend running
- The frontend running

---

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Then:

```bash
cd <project-directory>
```

---

## 2. Install Dependencies

```bash
npm install
```

or:

```bash
pnpm install
```

---

## 3. Configure Environment Variables

Create:

```text
.env.local
```

and add the required environment variables.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

> Use the actual variables required by the project. Do not commit `.env.local` or any secret credentials to GitHub.

---

# ▶️ Running the Project

Start the development server:

```bash
npm run dev
```

The frontend should then be available at:

```text
http://localhost:3000
```

Start the backend separately according to its project configuration.

For example:

```bash
npm run dev
```

The exact command may differ depending on the backend setup.

---

# 🧪 Testing the Application

A simple way to test the entire system is to use two browser windows.

### Window 1 — Mentor

1. Open the application
2. Select **Mentor**
3. Create a mentor profile
4. Create a group
5. Copy the generated group code
6. Open the mentor dashboard

### Window 2 — Student

1. Open the application
2. Select **Student**
3. Enter the group code
4. Create a student profile
5. Enter RustDesk information
6. Join the group

Now test:

```text
Student → Ask for Help
             ↓
Mentor → receives request
             ↓
Mentor → Connect
             ↓
Student → Ongoing
             ↓
Mentor → Complete
             ↓
Student → Online
```

No page refresh should be necessary during this process.

---

# 🧭 Complete System Flow

```text
                    ┌───────────────┐
                    │    Website    │
                    └───────┬───────┘
                            │
                    ┌───────▼───────┐
                    │ Role Selection│
                    └───┬───────┬───┘
                        │       │
              ┌─────────┘       └─────────┐
              ▼                           ▼
        ┌───────────┐               ┌───────────┐
        │  Student  │               │   Mentor  │
        └─────┬─────┘               └─────┬─────┘
              │                           │
              ▼                           ▼
        Enter Group Code            Create Profile
              │                           │
              ▼                           ▼
        Create Profile                Create Group
              │                           │
              ▼                           ▼
        Join Group                    Dashboard
              │                           │
              └──────────┬────────────────┘
                         │
                    WebSocket
                         │
                         ▼
                  Real-Time Group
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
       Ask for Help              Mentor sees
             │                   request
             │                       │
             └──────────► Connect ◄──┘
                         │
                         ▼
                       Ongoing
                         │
                         ▼
                      Complete
                         │
                         ▼
                        Idle
```

---

# 🛠️ Tech Stack

| Technology   | Purpose                     |
| ------------ | --------------------------- |
| Next.js      | Frontend application        |
| React        | UI                          |
| TypeScript   | Type safety                 |
| Tailwind CSS | Styling                     |
| Node.js      | Backend runtime             |
| Express      | REST API                    |
| Socket.IO    | Real-time communication     |
| MongoDB      | Database                    |
| JWT          | Mentor/Admin authentication |
| localStorage | Student local persistence   |
| RustDesk     | Remote desktop support      |

---

# 🎯 Project Goals

The project was designed around three main principles:

### 1. Simplicity

Students shouldn't have to create an account or navigate through complicated screens just to receive technical help.

### 2. Real-Time Communication

Mentors should immediately know when a student needs help, while students should immediately know when a mentor starts or finishes a session.

### 3. Efficient Support

A mentor should be able to go from:

```text
Student needs help
```

to:

```text
RustDesk connection
```

as quickly as possible.

---

# 🔒 Security Considerations

This project intentionally keeps the student onboarding process lightweight, but there are several security considerations.

### Never commit secrets

Do not commit:

```text
.env
.env.local
JWT secrets
Database credentials
API keys
```

to GitHub.

### Use HTTPS/WSS in production

Production communication should use:

```text
HTTPS
WSS
```

rather than:

```text
HTTP
WS
```

### Be careful with RustDesk passwords

RustDesk passwords should be treated as sensitive credentials.

The application should only expose them to authorized mentors and should avoid unnecessary persistence or logging.

### Shared computers

Because student information can be stored in `localStorage`, students should use:

```text
Leave Group
```

or:

```text
Clear Data
```

when they finish using a shared computer.

---

# 📌 Current Limitations

Depending on the current implementation, some functionality may require additional production hardening.

Possible future improvements include:

- More advanced mentor authentication
- Session history
- Support session analytics
- Notifications
- Multiple mentors per group
- Multiple groups per mentor
- Automatic RustDesk deep linking
- Better credential protection
- Redis-based Socket.IO scaling
- Rate limiting
- Audit logs
- Automatic session expiration
- Role-based permissions
- Production monitoring

---

# 🚀 Future Improvements

The project can eventually evolve from a simple academy support tool into a complete remote-support platform.

Potential architecture:

```text
                    ┌─────────────────┐
                    │   Next.js Web   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    API Gateway  │
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             ▼               ▼               ▼
        ┌─────────┐     ┌─────────┐     ┌─────────┐
        │   Auth  │     │ Groups  │     │ Support │
        │ Service │     │ Service │     │ Service │
        └─────────┘     └─────────┘     └─────────┘
                             │
                       ┌─────▼─────┐
                       │  MongoDB  │
                       └───────────┘
```

---

# 🤝 Contributing

Contributions are welcome.

If you want to improve the project:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/my-feature
```

3. Make your changes
4. Commit them

```bash
git commit -m "feat: add my feature"
```

5. Push the branch

```bash
git push origin feature/my-feature
```

6. Open a Pull Request

---

# 📄 License

Add your preferred license here.

For example:

```text
MIT License
```

---

# 💡 Why RustDesk x Academy?

Remote technical support in an educational environment should not require students to understand complicated networking, authentication, or remote-desktop configuration.

This project creates a bridge between the academy's support workflow and RustDesk:

```text
Student
   ↓
"I need help"
   ↓
Mentor
   ↓
"Connect"
   ↓
RustDesk
   ↓
Problem solved
```

The goal is simple:

> **Make getting technical help as easy as pressing one button.**

---

## 👨‍💻 Author

Built as an academy support platform using modern web technologies and real-time communication.

If you find the project useful, consider ⭐ starring the repository.
