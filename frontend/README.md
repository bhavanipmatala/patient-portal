# Frontend Setup

This directory contains the React and TypeScript frontend for the DemoPatientPortal application.

## Prerequisites

- Node.js and npm (or yarn) installed on your machine.
- The backend server is running as per the instructions in `/backend/README.md`.

## Instructions

1.  **Navigate to the Frontend Directory**:
    Open a new command prompt or terminal and navigate to the `frontend` directory:
    ```bash
    cd C:\Users\Prasanna\DemoPatientPortal\frontend
    ```

2.  **Install Dependencies**:
    Run the following command to install the necessary packages:
    ```bash
    npm install
    ```

3.  **Start the Development Server**:
    Run the following command to start the frontend development server:
    ```bash
    npm start
    ```

    This will open the application in your default web browser at `http://localhost:3000`.

## Application Usage

-   **Login**: Use the demo credentials provided on the login page (`john.smith@email.com` / `password123`) or register a new account.
-   **Dashboard**: After logging in, you will be taken to the dashboard, which provides an overview of your messages, notifications, and quick actions.
-   **Messaging**: Navigate to the "Messages" page to view your conversations, send new messages, and manage your inbox.

## Completion

Once the frontend development server is running, you will have the complete DemoPatientPortal application running locally. The frontend will communicate with the backend API, which in turn connects to the SQL Server database.
