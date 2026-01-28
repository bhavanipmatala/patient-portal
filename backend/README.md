# Backend Setup

This directory contains the Node.js, Express, and TypeScript backend for the DemoPatientPortal application.

## Prerequisites

- Node.js and npm (or yarn) installed on your machine.
- The database has been set up as per the instructions in `/database/README.md`.

## Instructions

1.  **Navigate to the Backend Directory**:
    Open a command prompt or terminal and navigate to the `backend` directory:
    ```bash
    cd C:\Users\Prasanna\DemoPatientPortal\backend
    ```

2.  **Install Dependencies**:
    Run the following command to install the necessary packages:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the `backend` directory by copying the `.env.example` file. Update the `.env` file with your SQL Server database credentials:

    ```env
    # Database Configuration
    DB_SERVER=ROEFDN812Q
    DB_DATABASE=POS_Investigation
    DB_USER=your_sql_server_username
    DB_PASSWORD=your_sql_server_password
    DB_ENCRYPT=false
    DB_TRUST_SERVER_CERTIFICATE=true

    # JWT Configuration
    JWT_SECRET=a_very_secret_key_that_you_should_change
    JWT_EXPIRES_IN=24h

    # Server Configuration
    PORT=5000
    NODE_ENV=development

    # CORS Configuration
    FRONTEND_URL=http://localhost:3000
    ```

4.  **Build the TypeScript Code**:
    Run the following command to compile the TypeScript code to JavaScript:
    ```bash
    npm run build
    ```

5.  **Start the Server**:
    Run the following command to start the backend server:
    ```bash
    npm start
    ```

    The server will start on `http://localhost:5000`.

## Development

For development, you can run the server with hot-reloading using the following command:

```bash
npm run dev
```

This will automatically restart the server whenever you make changes to the source code.

## Next Steps

Once the backend server is running, proceed to the frontend setup instructions in the `/frontend/README.md` file.
