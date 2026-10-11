# OpsFlow – Request Management Platform

OpsFlow is a full-stack web application that helps organizations manage employee requests through separate employee and admin dashboards.

## Features

- User registration and login
- Role-based access for employees and administrators
- Create and view employee requests
- Set request priorities
- Admin dashboard to view and manage requests
- Assign requests to employees
- Update request statuses
- Backend validation for request details

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- Axios
- CSS

**Backend**
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Maven

**Database**
- MySQL

## Project Structure

```text
opsflow-platform/
├── opsflow-backend/
└── opsflow-frontend/
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Mahendra-0718/Opsflow.git
cd Opsflow
```

### 2. Start the MySQL database

Make sure MySQL is running and create the database configured in the backend application.

### 3. Start the backend

Open a terminal:

```bash
cd opsflow-backend
mvn spring-boot:run
```

Configure your database connection and other required settings using your local backend configuration.

### 4. Start the frontend

Open another terminal:

```bash
cd opsflow-frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal, usually `http://localhost:5173`.

## Security Notes

- Keep database passwords, API keys, and JWT secrets private.
- Configure appropriate environment variables before deployment.
- Do not commit credentials or tokens to GitHub.

## Author

**Mahendra Alla**

GitHub: [Mahendra-0718](https://github.com/Mahendra-0718)
