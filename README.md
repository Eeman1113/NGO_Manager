# NGO Volunteer Management System

A comprehensive web application for managing NGO volunteers, events, tasks, and more with a PostgreSQL database backend.

## Features

- User authentication (Login/Register)
- Dynamic user profiles based on login
- Dashboard with key statistics and visualizations
- Volunteer management
- Event organization
- Task assignment
- Idea submission and voting
- Certificate management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

1. Install PostgreSQL if you don't have it already
2. Create a new database:
   ```sql
   CREATE DATABASE ngo_management;
   ```
3. The application will automatically create the necessary tables when it starts

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Update the database configuration in server.js if needed:
   ```javascript
   const pool = new Pool({
     user: 'postgres',         // Replace with your PostgreSQL username
     host: 'localhost',        // Replace with your PostgreSQL host
     database: 'ngo_management', // Replace with your database name
     password: 'YOUR_PASSWORD_HERE',  // Replace with your PostgreSQL password
     port: 5432,
   });
   ```

## Running the Application

1. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Default Users

The system automatically creates an admin user on first run:

- **Admin User**:
  - Email: admin@example.com
  - Password: admin123

## API Endpoints

The application provides the following API endpoints:

- **Authentication**:
  - POST /api/auth/register - Register a new user
  - POST /api/auth/login - Login and get token

- **Users**:
  - GET /api/users/me - Get current user info
  - GET /api/users/:id/profile - Get user profile

- **Dashboard**:
  - GET /api/dashboard - Get dashboard statistics

- **Certificates**:
  - GET /api/certificates/:id/download - Download certificate

## Security Considerations

For production environments:
- Update the JWT_SECRET in server.js to a strong, unique key
- Enable HTTPS
- Implement more robust password hashing
- Set up proper CORS restrictions
- Add rate limiting

## License

[MIT License](LICENSE)
