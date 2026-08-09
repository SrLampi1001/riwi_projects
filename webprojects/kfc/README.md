# KFC Web Project

A static web project simulating a KFC (Kentucky Fried Chicken) restaurant menu and ordering system.

## Project Structure

```
KFC/
├── index.html              # Main page displaying burger menu
├── log_in.html             # Login page
├── styles/
│   ├── styles.css          # Custom CSS styles
│   └── bootstrap.min.css   # Bootstrap 5 framework
├── script/
│   ├── scripts.js           # Theme switching functionality
│   ├── log_in.js            # Login form validation
│   └── sign_in_verification.js  # Session verification
└── media/
    ├── Logo.png             # KFC logo
    ├── favicon.ico          # Site favicon
    └── hamburguesa-*.webp   # Product images (8 burgers)
```

## Features

- **Product Catalog**: 8 burger products with images, names, prices, and descriptions
- **Theme Switching**: Three themes - Light, Dark, and Rainbow (persisted via localStorage)
- **Language Selection**: Spanish and English options (UI strings)
- **Login System**: Simple authentication with hardcoded credentials
  - Email: `Email@gmail.com`
  - Password: `PASWORDSSSSS`
- **Session Management**: Uses sessionStorage to track logged-in users
- **Responsive Design**: Bootstrap-powered layout for mobile and desktop

## Usage

### Running the Project

Simply open `index.html` in any modern web browser. No build step or server required.

### Login Credentials

| Field    | Value             |
|----------|-------------------|
| Email    | Email@gmail.com   |
| Password | PASWORDSSSSS      |

### Theme Options

- **Claro (Light)**: Default light background
- **Oscuro (Dark)**: Dark theme with gray cards
- **Rainbow**: Gradient background effect

Themes are saved to localStorage and persist across sessions.

## Technical Details

- **Framework**: Bootstrap 5 (CDN-free, local copy included)
- **JavaScript**: Vanilla JS for interactivity
- **Storage**: localStorage for theme, sessionStorage for auth
- **No dependencies**: Pure static HTML/CSS/JS project

## Pages

### index.html
Main landing page with:
- KFC logo header
- Language and theme selectors
- 8 product cards in a 2-row grid layout
- Each card shows price, name, description, and buy button

### log_in.html
Login form with:
- Email input field
- Password input field
- "I'm not a robot" checkbox (non-functional, UI only)
- Submit button with validation

## Browser Compatibility

Works in all modern browsers (Chrome, Firefox, Edge, Safari).
