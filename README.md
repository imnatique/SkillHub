# 🌟 SkillHub – The Online Skill Barter Platform

SkillHub is a full-stack web application that allows users to exchange skills directly with others through a collaborative and secure online platform. Users can sign up, list the skills they offer and want to learn, discover matching partners, and chat in real-time.

This project is built to demonstrate real-world software development using the MERN stack, Tailwind CSS, and Docker.

---

## 🚀 Features

- 👤 User Authentication (including Google Sign-In)
- 🛠️ List Offered and Required Skills
- 🔍 Discover Matching Users
- 💬 Real-Time Chat
- 📝 User Reviews & Ratings
- 🌐 Responsive Design using Tailwind CSS
- 🐳 Dockerized Fullstack Setup (Backend + Frontend)
- 🔐 JWT Authentication

---

## 🧰 Tech Stack

| Layer         | Technology                         |
|-------------- |------------------------------------|
| **Frontend**  | React.js, Vite, Tailwind CSS       |
| **Backend**   | Node.js, Express.js                |
| **Database**  | MongoDB (Mongoose)                 |
| **Auth**      | Google OAuth 2.0, JWT              |
| **Deployment**| Docker, Docker Compose             |
| **Others**    | Socket.IO, Axios, React Router     |

---

## Prerequisites

1. For Google OAuth, know how to obtain the Google OAuth credentials and configure the redirect and allowed origins routes in the Google Cloud Console.
2. Know how to obtain the connection link of the MongoDB Atlas database.
3. For Nodemailer, you should know how to obtain the app password.
4. Familiarity with working on Node.js and React projects is required.


## Clone the Repo

```bash
cd SkillHub
```

## Frontend Setup

```bash
cd frontend,
npm install
```

Create .env file in the frontend and write the following:

```env
VITE_SERVER_URL = http://localhost:8000
VITE_SERVER_URL = <your deployment link>
```

Run frontend

```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## Backend Setup

```bash
cd ../Backend,
npm install
```

Create .env file in the backend and write the following:

```env
PORT = 8000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
MONGODB_URI = mongodb+srv://<your-username>:<your-password>@cluster0.<your-project>.mongodb.net

CLOUDINARY_CLOUD_NAME = <your-cloudinary-cloud-name>
CLOUDINARY_API_KEY = <your-cloudinary-api-key>
CLOUDINARY_API_SECRET = <your-cloudinary-api-key>

GOOGLE_CLIENT_ID = <your-google-client-id> 
GOOGLE_CLIENT_SECRET = <your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:8000/auth/google/callback

JWT_SECRET = <your-jwt-secret>

EMAIL_ID = <your-email-id>
APP_PASSWORD = <your-app-password>
```

Run backend

```bash
npm run dev
```

The backend will be running on `http://localhost:8000`

## Install and Setup through Docker

Create a docker-compose.yml file in SkillHub folder. Write the following in it.

```yml
version: "3.9"

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    restart: always

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "5173:5173"
    env_file:
      - ./frontend/.env
    depends_on:
      - backend
    restart: always
```

Run the docker compose file by using the following command which will run both frontend and backend.

```bash
sudo docker-compose up --build
```

To remove the docker images use the following command

```bash
sudo docker-compose down --rmi all
```

Now you can run the website on `http://localhost:5173`
========

