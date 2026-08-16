# QuietPaws

## 1. Project Overview

• QuietPaw is an web app that helps in calming the nervous system of an user that is overwhelmed and is constantly overthinking.
• It uses an simple timer (sound-free) to track time the user is meditating.
• The streak and the reward system helps the user in building an consistent habit that improves there mental health.

## 2. Features

• Adjustable timer with 3/5/10 minutes presets.
• Reward system after each session the user collects the reward alternating between cats and room furniture pieces.
• A single illustrated house view that fills in visually as items are unlocked.
• Login/sign up so each persons progress is saved

## 3. Tech Stack

• **Frontend:** HTML, CSS, JS
• **Backend:** Node.js, Express
• **Database:** SQLite
• **UI/UX Design & Illustration:** Figma

## 4. Architecture

```
Browser
(HTML/CSS/JS)
        |
        |  fetch()
        v
Express API (Node.js)
 /api/auth
 /api/user
 /api/sessions
        |
        |
        v
   SQLite database
   collectibles | user_collectibles
```

The frontend never talks to the database directly — every read or write goes through the Express API, which is the only layer with database access. This keeps reward logic (alternation, sequencing, streak rules) centralized on the server so it can't be bypassed or manipulated from the client.

## 5. Project Structure

```
quietpaws/
│
├── assets/
│   ├── cats/
│   │   ├── cat4.jpeg
│   │   ├── cat5.jpeg
│   │   └── cat6.jpeg
│   │
│   └── home/
│       ├── main-home/
│       ├── Home-1.png
│       ├── Home-2.png
│       ├── Home-3.png
│       ├── Home-4.png
│       ├── Home-5.png
│       └── Home-6.png
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── node_modules/
│   ├── routes/
│   ├── .env
│   ├── .env.example
│   ├── app.js
│   ├── db.js
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
│
├── css/
│   └── style.css
│
├── js/
│   └── app.js
│
├── .gitignore
├── readme.md
└── index.html
```

## 6. Installation & Setup

**Prerequisites:** Node.js 22+ and npm.

```
git clone https://github.com/7pixiee/QuietPaws.git
cd QuietPaws
cd backend
npm install
```

Start the server:

```
node server.js
```

The app runs at `http://localhost:5000` by default.

## 7. Process

1. Sign up or log in from the entry screen.
2. Choose a timer duration (2, 5, or 10 minutes) and start it. No sound plays during the countdown.
3. When the timer finishes, the Reveal screen shows what was earned — a cat or a furnishing piece.
4. Visit the House view to see the collection so far. Tap any cat to open its profile.
5. Return daily to keep the streak going — missing a day does not remove anything already earned.

## 8. Screenshots / Demo

## 9. API Documentation

Method | Endpoint | Auth Required | Purpose & Description
POST | /auth/signup | Public (No) | Register new user account with bcrypt password hash
POST | /auth/login | Public (No) | Authenticate user & receive JWT Bearer token
GET | /user/profile | Bearer JWT | Fetch user profile, current/best streak & total sessions
GET | /user/rewards | Bearer JWT | Fetch full rewards catalog (12 cats + 12 pieces)
POST | /sessions/complete| Bearer JWT | Record completed session + streak + reward

## 10. Contributors

• **Name** : • contribution • contribution
• **Name** : contribution • contribution
• **Name** : contribution • contribution
• **Name** : contribution • contribution
