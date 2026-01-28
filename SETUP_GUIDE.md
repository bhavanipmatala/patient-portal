# DemoPatientPortal - Complete Setup Guide

This document provides comprehensive instructions for setting up the DemoPatientPortal application on your local Windows machine at `C:\Users\Prasanna`.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Step 1: Database Setup](#step-1-database-setup)
5. [Step 2: Backend Setup](#step-2-backend-setup)
6. [Step 3: Frontend Setup](#step-3-frontend-setup)
7. [Running the Application](#running-the-application)
8. [Demo Credentials](#demo-credentials)
9. [Application Features](#application-features)
10. [Troubleshooting](#troubleshooting)

---

## Overview

DemoPatientPortal is a healthcare messaging application that allows patients to communicate securely with their healthcare providers. The application is built with modern web technologies and features a design inspired by Mayo Clinic's patient portal.

**Technology Stack:**

| Component | Technology |
|-----------|------------|
| Frontend | React 18, TypeScript, React Router |
| Backend | Node.js, Express, TypeScript |
| Database | Microsoft SQL Server |
| Authentication | JWT (JSON Web Tokens) |
| Styling | Custom CSS with Mayo Clinic-inspired theme |

---

## Prerequisites

Before you begin, ensure you have the following installed on your Windows machine:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Microsoft SQL Server**
   - SQL Server should be running on server: `ROEFDN812Q`
   - Database: `POS_Investigation`

4. **SQL Server Management Studio (SSMS)** or any SQL client
   - For executing SQL scripts

5. **A code editor** (optional, but recommended)
   - Visual Studio Code: https://code.visualstudio.com/

---

## Project Structure

After copying the project files to `C:\Users\Prasanna\DemoPatientPortal`, your folder structure should look like this:

```
C:\Users\Prasanna\DemoPatientPortal\
├── backend\
│   ├── src\
│   │   ├── config\
│   │   │   └── database.ts
│   │   ├── controllers\
│   │   │   ├── authController.ts
│   │   │   ├── messageController.ts
│   │   │   └── notificationController.ts
│   │   ├── middleware\
│   │   │   └── auth.ts
│   │   ├── routes\
│   │   │   ├── authRoutes.ts
│   │   │   ├── messageRoutes.ts
│   │   │   └── notificationRoutes.ts
│   │   ├── types\
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend\
│   ├── public\
│   │   └── index.html
│   ├── src\
│   │   ├── components\
│   │   │   └── Header.tsx
│   │   ├── context\
│   │   │   └── AuthContext.tsx
│   │   ├── pages\
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── Notifications.tsx
│   │   │   └── Register.tsx
│   │   ├── services\
│   │   │   └── api.ts
│   │   ├── styles\
│   │   │   └── global.css
│   │   ├── types\
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── database\
│   └── create_tables.sql
├── README.md
└── SETUP_GUIDE.md
```

---

## Step 1: Database Setup

### 1.1 Open SQL Server Management Studio (SSMS)

Connect to your SQL Server instance:
- **Server name:** `ROEFDN812Q`
- **Authentication:** Use your SQL Server credentials

### 1.2 Execute the Database Script

1. Open the file `C:\Users\Prasanna\DemoPatientPortal\database\create_tables.sql` in SSMS.

2. Make sure the database `POS_Investigation` exists. If not, create it:
   ```sql
   CREATE DATABASE POS_Investigation;
   GO
   ```

3. Execute the entire `create_tables.sql` script. This will:
   - Create all necessary tables (Patients, HealthcareProviders, Conversations, Messages, Notifications, MessageAttachments)
   - Insert sample data for testing

4. Verify the tables were created by running:
   ```sql
   USE POS_Investigation;
   SELECT * FROM Patients;
   SELECT * FROM HealthcareProviders;
   SELECT * FROM Conversations;
   SELECT * FROM Messages;
   ```

---

## Step 2: Backend Setup

### 2.1 Open Command Prompt

Open a new Command Prompt window (press `Win + R`, type `cmd`, press Enter).

### 2.2 Navigate to Backend Directory

```cmd
cd C:\Users\Prasanna\DemoPatientPortal\backend
```

### 2.3 Install Dependencies

```cmd
npm install
```

This will install all required packages including Express, TypeScript, mssql, bcryptjs, jsonwebtoken, and cors.

### 2.4 Configure Environment Variables

1. Copy the example environment file:
   ```cmd
   copy .env.example .env
   ```

2. Open the `.env` file in a text editor and update it with your database credentials:
   ```env
   # Database Configuration
   DB_SERVER=ROEFDN812Q
   DB_DATABASE=POS_Investigation
   DB_USER=your_sql_username
   DB_PASSWORD=your_sql_password
   DB_ENCRYPT=false
   DB_TRUST_SERVER_CERTIFICATE=true

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=24h

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # CORS Configuration
   FRONTEND_URL=http://localhost:3000
   ```

   **Important:** Replace `your_sql_username` and `your_sql_password` with your actual SQL Server credentials.

### 2.5 Build the TypeScript Code

```cmd
npm run build
```

### 2.6 Start the Backend Server

```cmd
npm start
```

You should see output similar to:
```
========================================
  DemoPatientPortal Backend Server
========================================
  Server running on: http://localhost:5000
  Health check: http://localhost:5000/api/health
  Environment: development
========================================
```

**Keep this Command Prompt window open.** The backend server must be running for the application to work.

---

## Step 3: Frontend Setup

### 3.1 Open a New Command Prompt

Open a **new** Command Prompt window (the backend must continue running in the first one).

### 3.2 Navigate to Frontend Directory

```cmd
cd C:\Users\Prasanna\DemoPatientPortal\frontend
```

### 3.3 Install Dependencies

```cmd
npm install
```

This will install React, React Router, Axios, and other frontend dependencies.

### 3.4 Start the Frontend Development Server

```cmd
npm start
```

The application will automatically open in your default web browser at `http://localhost:3000`.

If it doesn't open automatically, manually navigate to `http://localhost:3000` in your browser.

---

## Running the Application

To run the complete application, you need **two Command Prompt windows**:

| Window | Directory | Command | URL |
|--------|-----------|---------|-----|
| 1 | `C:\Users\Prasanna\DemoPatientPortal\backend` | `npm start` | http://localhost:5000 |
| 2 | `C:\Users\Prasanna\DemoPatientPortal\frontend` | `npm start` | http://localhost:3000 |

---

## Demo Credentials

The database script creates sample patients. You can log in with any of these credentials:

| Email | Password |
|-------|----------|
| john.smith@email.com | password123 |
| mary.johnson@email.com | password123 |
| david.brown@email.com | password123 |
| lisa.wilson@email.com | password123 |
| james.taylor@email.com | password123 |

---

## Application Features

### Login Page
- Secure authentication with email and password
- Demo credentials displayed for easy testing
- Link to registration page

### Dashboard
- Welcome message with patient's name
- Quick statistics (unread messages, notifications)
- Recent messages preview
- Recent notifications
- Quick action buttons

### Messages Page
- **View Inbox:** See all conversations with healthcare providers
- **Send Messages:** Compose and send messages to your care team
- **New Conversation:** Start a new conversation with any available provider
- **Mark as Read:** Messages are automatically marked as read when opened
- **Delete Messages:** Remove your own messages
- **Archive Conversations:** Archive old conversations

### Notifications Page
- View all notifications
- Filter by unread notifications
- Mark individual or all notifications as read
- Delete notifications

---

## Troubleshooting

### Backend Issues

**Problem:** "Cannot connect to database"
- **Solution:** Verify your SQL Server is running and the credentials in `.env` are correct. Check that the `POS_Investigation` database exists.

**Problem:** "Port 5000 is already in use"
- **Solution:** Change the `PORT` value in the `.env` file to another port (e.g., 5001).

### Frontend Issues

**Problem:** "npm start fails with errors"
- **Solution:** Delete the `node_modules` folder and `package-lock.json`, then run `npm install` again.

**Problem:** "Cannot connect to backend API"
- **Solution:** Ensure the backend server is running on port 5000. Check the browser console for CORS errors.

### Database Issues

**Problem:** "Login failed for user"
- **Solution:** Verify your SQL Server credentials. Make sure the user has access to the `POS_Investigation` database.

**Problem:** "Tables not found"
- **Solution:** Re-run the `create_tables.sql` script in SSMS.

---

## Support

If you encounter any issues not covered in this guide, please check:
1. The browser's Developer Console (F12) for frontend errors
2. The Command Prompt running the backend for server errors
3. SQL Server logs for database connection issues

---

**Author:** Manus AI  
**Version:** 1.0.0  
**Last Updated:** January 2026
