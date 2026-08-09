# Assessment Test 3 - Task Management System

A web-based task management application called **CRUDZASO** that allows users to organize and track tasks with user authentication and role-based access.

## Overview

CRUDZASO is a task management system designed to help users organize their academic or professional responsibilities. It provides separate interfaces for administrators and regular users, enabling efficient task creation, assignment, and tracking.

## Problem It Solves

- **Centralized Task Organization**: Keeps all tasks in one place with status tracking (Pending, In Progress, Completed)
- **Priority Management**: Allows tasks to be categorized by priority levels (Low, Medium, High)
- **Role-Based Access**: Separate admin and user views with appropriate permissions
- **Due Date Tracking**: Helps users meet deadlines with expiration date management

## Features

### User Features
- User registration and login
- View personal tasks
- Track task status and priorities
- Update task details

### Admin Features
- Admin dashboard with overview statistics
- Create new tasks
- Manage all tasks in the system
- User management capabilities

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.2
- **Icons**: Bootstrap Icons
- **Backend**: JSON Server (REST API mock)
- **Architecture**: Modular JavaScript with separate models and utilities

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (comes with Node.js)

### Setup

1. Clone or download the project to your local machine

2. Install JSON Server globally (if not already installed):
   ```bash
   npm install -g json-server
   ```

3. Start the JSON Server backend:
   ```bash
   json-server --watch db.json --port 3000
   ```

4. Open any of the following files in your browser:
   - `index.html` - User dashboard
   - `log_in.html` - Login page
   - `sign_up.html` - Registration page
   - `admin/dashboard.html` - Admin dashboard
   - `admin/create-task.html` - Task creation (admin)

   > **Note**: For the best experience, use a local server (like Live Server in VS Code) instead of opening HTML files directly, as some browsers may block JavaScript modules from file:// protocol.

## Testing

### Test Users (from db.json)

| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | email@gmail.com     | 123456   |
| User  | student@gmail.com   | 123456   |

### Testing Checklist

- [ ] User registration and login flow
- [ ] Admin login with admin credentials
- [ ] Task creation by admin
- [ ] Task status updates (Pending, In Progress, Completed)
- [ ] Task filtering by status
- [ ] Logout functionality
- [ ] Session persistence

## Project Structure

```
assessment_test_3/
├── admin/
│   ├── create-task.html
│   ├── dashboard.html
│   ├── js/
│   │   ├── create-task.js
│   │   └── dashboard.js
│   └── styles/
│       └── styles.css
├── assets/
│   └── icons/
│       └── corbata_icon.png
├── js/
│   ├── login.script.js
│   ├── logout.script.js
│   ├── script.js
│   ├── signup.script.js
│   ├── index.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Task.js
│   │   └── User.js
│   └── utils/
│       ├── log_in.js
│       └── sign_up.js
├── styles/
│   └── styles.css
├── db.json
├── index.html
├── log_in.html
├── sign_up.html
└── README.md
```

## Known Issues

- User settings HTML is missing
- User functionality logic is done but not fully implemented

## Author

Santiago Sánchez Ruiz

## External Dependencies

- [Bootstrap 5.3.2](https://getbootstrap.com/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [JSON Server](https://github.com/typicode/json-server)
