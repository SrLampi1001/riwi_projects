# simpleStorage

A simple full-stack application that demonstrates the use of JavaScript and local storage concepts to manage user data in a table.

## Features

- Add new users with name and last name
- View all users in a table
- Delete users from the table
- Success and error feedback modals
- Form validation

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: json-server (REST API)
- **Database**: JSON file-based storage

## Project Structure

```
simple_storage/
├── backend/
│   ├── addUser.js       # Helper function for adding users
│   └── db.json          # JSON database file
├── frontend/
│   ├── index.html       # Main HTML page
│   ├── script.js        # Frontend JavaScript logic
│   └── styles.css       # CSS styles
├── package.json         # Node.js dependencies
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the json-server backend:
   ```bash
   npx json-server backend/db.json --port 3000
   ```

3. Open `frontend/index.html` in your browser (or serve it with a local server)

## API Endpoints

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | /users           | Get all users        |
| POST   | /users           | Create a new user    |
| DELETE | /users/:id       | Delete a user by ID  |

## Usage

1. Fill in the name and last name fields
2. Click "Guardar" (Save) to add the user
3. The user will appear in the table below
4. Click "Eliminar" (Delete) to remove a user
