RideShare

RideShare is a full-stack ride-sharing platform that allows users to search, create, and manage rides in real time. The application emphasizes simplicity, usability, and intelligent automation through an integrated AI assistant.

Features

RideShare provides a complete ride management experience, beginning with a secure authentication system that allows users to register and log in using JWT-based authentication.

Users can create rides, search for available rides by location and date, and request seats from drivers. The platform also includes a centralized dashboard where users can view upcoming rides, monitor ride requests, and track approval statuses.

An integrated AI assistant, RideAgent, enables users to interact with the system conversationally to find and book rides. The interface is responsive and interactive, with expandable ride sections and an embedded chatbot widget.

Tech Stack

The frontend is built using React with Vite and React Router for client-side navigation. The backend is implemented using Node.js and Express, with PostgreSQL used for relational data storage.

AI functionality is powered by the OpenAI API, using function calling to support ride search and booking workflows.

Project Structure
RideShare/
├── client/        React frontend
├── server/        Express backend
├── database/      SQL schema and setup
└── README.md
Setup Instructions

Clone the repository and navigate into the project directory:

git clone https://github.com/StephenShao90/RideShare.git
cd RideShare

Set up the backend by installing dependencies:

cd server
npm install

Create a .env file inside the server directory:

PORT=5000
DB_USER=your_user
DB_HOST=localhost
DB_NAME=rideshare
DB_PASSWORD=your_password
DB_PORT=5432
OPENAI_API_KEY=your_api_key

Start the backend server:

npm run dev

Set up the frontend:

cd ../client
npm install
npm run dev
Database Setup

Ensure PostgreSQL is running, then execute the schema file:

psql -U postgres -d rideshare -f database/schema.sql
API Overview

Authentication routes support user registration and login:

POST /api/auth/register
POST /api/auth/login

Ride-related endpoints allow users to search for rides and create new ones:

GET  /api/rides/search
POST /api/rides

User endpoints provide access to profile data and updates:

GET  /api/users/me
PUT  /api/users/me

The dashboard endpoint aggregates user-specific ride data:

GET /api/dashboard
Future Improvements

Planned improvements include real-time ride updates using WebSockets, payment integration, a notification system, ratings and reviews, and expanded AI functionality such as automatic booking and voice interaction.

Author

Stephen Shao

License

This project is intended for educational and development purposes.