RideShare is a full-stack ride-sharing platform that allows users to search, create, and manage rides in real time. The application focuses on simplicity, usability, and intelligent automation through an integrated AI assistant.

Features

Authentication System
Users can register and log in securely using JWT-based authentication.

Ride Management
Create rides, search available rides by location and date, and request seats.

User Dashboard
View upcoming rides, track ride requests, and monitor approval status.

AI Assistant (RideAgent)
Chat-based assistant that helps users find and book rides using natural language.

Interactive UI
Responsive interface with expandable ride sections and a chatbot widget.

Tech Stack

Frontend

React (Vite)

React Router

Backend

Node.js

Express.js

Database

PostgreSQL

AI Integration

OpenAI API (function calling for ride search and booking)

Project Structure

RideShare/
├── client/ # React frontend
├── server/ # Express backend
├── database/ # SQL schema and setup
└── README.md

Setup Instructions

Clone the repository
git clone https://github.com/StephenShao90/RideShare.git

cd RideShare

Setup backend
cd server
npm install

Create a .env file inside /server:

PORT=5000
DB_USER=your_user
DB_HOST=localhost
DB_NAME=rideshare
DB_PASSWORD=your_password
DB_PORT=5432
OPENAI_API_KEY=your_api_key

Start backend server:
npm run dev

Setup frontend
cd ../client
npm install
npm run dev

Database Setup

Make sure PostgreSQL is running, then run:

psql -U postgres -d rideshare -f database/schema.sql

API Overview

Auth
POST /api/auth/register
POST /api/auth/login

Rides
GET /api/rides/search
POST /api/rides

User
GET /api/users/me
PUT /api/users/me

Dashboard
GET /api/dashboard

Future Improvements

Real-time ride updates (WebSockets)

Payment integration

Notifications system

Ratings and reviews

AI auto-booking + voice assistant

Author

Stephen Shao

License

This project is for educational and development purposes.