# Database Setup

This directory contains the SQL script to create the necessary tables and insert sample data into your Microsoft SQL Server database.

## Prerequisites

- Microsoft SQL Server is installed and running.
- You have access to a database named `POS_Investigation` on the server `ROEFDN812Q`.
- You have a tool to execute SQL scripts, such as SQL Server Management Studio (SSMS) or `sqlcmd`.

## Instructions

1.  **Open the SQL Script**:
    Open the `create_tables.sql` file in your preferred SQL editor.

2.  **Execute the Script**:
    Execute the entire script against the `POS_Investigation` database on your `ROEFDN812Q` server.

    This will:
    - Create the required tables: `Patients`, `HealthcareProviders`, `Conversations`, `Messages`, `Notifications`, and `MessageAttachments`.
    - Insert sample data for patients, providers, conversations, and messages to populate the application for demonstration purposes.

3.  **Verify Creation**:
    After the script has run successfully, you can verify that the tables have been created and populated by running `SELECT` queries on them in SSMS or your chosen tool.

## Next Steps

Once the database is set up, proceed to the backend setup instructions in the `/backend/README.md` file.
