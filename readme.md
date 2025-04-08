# Showcase Questionnaire

A comprehensive MERN stack starter application for building dynamic questionnaire systems with robust authentication and modern SPA architecture. Leveraging Vite for rapid development and optimized production builds, this codebase provides a complete solution integrating both frontend and backend functionalities.

NOTE: The React app was built under a tight 2-day time constraint, so the focus was on delivering core functionality and getting the full stack flow working end-to-end. Due to the limited time, some frontend blocks weren’t abstracted into separate components yet, and backend integration is partially stubbed. If given a bit more time, I’d break out repeated logic, clean up state handling, and finalize the backend hooks properly. It’s intentionally kept in this state to demonstrate functionality while leaving room to discuss potential improvements and showcase my decision-making process during the technical interview.

## Overview

- **MERN Stack Integration:** Utilizes MongoDB, Express, React, and Node.js to deliver a full-stack application.
- **Secure Authentication:** Implements JWT-based authentication with tokens stored in HTTP-only cookies, along with routes for login, register, logout, and profile management.
- **Efficient API Design:** Features RESTful endpoints secured by custom middleware for JSON Web Token verification and error handling.
- **In-Memory Caching:** Prevents duplicate processing with React Redux Toolkit state mechanism
- **Enhanced Security :** Integrates JOI for model validation and Redis sliding rate limiter for traffic control.
- **Frontend Experience:** Provides a React-based interface styled with React Bootstrap, complemented by real-time notifications using React Toastify.
- **Containerization & Deployment:** Fully Dockerized with support for Docker Compose, ensuring seamless deployment in various environments.

## Usage

- Create a MongoDB database and obtain your `MongoDB URI` - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
- Set up `Redis` - [Redis Guide](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)

- Press random quiz to start

### Env Variables

Rename the `.env.example` file to `config.env` and add the following

```
NODE_ENV=development
PORT=5000
MONGO_URI=YOUR MONGO URI
JWT_SECRET=abc123
REDIS_HOST=localhost
REDIS_PORT=6379

```

### Install Dependencies (frontend & backend)

```
npm install
cd frontend
npm install
```

### Run

```

# Run frontend (:3000) & backend (:5000)
npm run dev

# Run backend only
npm run server

# Run db seed to fill database with example data
# (steps,quizes, admin: {email: "admin@gmail.com",  password:"admin1"} and simple user)
npm run seed
```

## Build & Deploy

```
# Create frontend prod build
cd frontend
npm run build
```
