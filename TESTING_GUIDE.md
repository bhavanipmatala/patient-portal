# DemoPatientPortal Testing Guide

This guide provides a comprehensive set of test cases and scripts for the **DemoPatientPortal** application, covering five key areas of software quality assurance as requested.

## 1. Database Testing (Microsoft SQL Server)

These tests are designed to be executed directly in **SQL Server Management Studio (SSMS)** against your `POS_Investigation` database. They verify the integrity and correctness of the data and the relationships between tables.

| Test Case | Description | Expected Result |
| :--- | :--- | :--- |
| **TC1: Patient Authentication Data** | Verifies that a patient record can be successfully retrieved using the login email. | `TC1 SUCCESS: Patient found by email.` |
| **TC2: Message Integrity** | Confirms that messages are correctly linked to their respective conversations and the correct patient. | Returns the top 3 messages with correct subject and patient name. |
| **TC3: Notification Unread Count** | Checks the count of unread notifications for the demo patient (`john.smith@email.com`). | Returns a non-zero count if sample data includes unread notifications, or 0 otherwise. |

**SQL Script Location:** `testing/database/db_tests.sql`

## 2. Unit Testing (ViTest + Axios)

These tests verify the core business logic of the backend API endpoints in isolation. They use `vitest` for the testing framework and `axios` (mocked) to simulate API calls.

| Test Case | Endpoint | Description |
| :--- | :--- | :--- |
| **TC1: Patient Login Success** | `POST /auth/login` | Verifies that the API returns a valid JWT token and patient data upon successful login. |
| **TC2: Fetch Conversations** | `GET /messages/conversations` | Verifies that the API returns a list of conversations for an authenticated user. |
| **TC3: Send Message** | `POST /messages/:id/send` | Verifies that the API accepts a new message and returns the created message object. |

**Test Script Location:** `testing/unit/api.test.ts`

## 3. UI Testing (Web) - Python Selenium

These tests simulate a user interacting with the web application through a browser (e.g., Chrome). They require **Python** and the **Selenium** library to be installed, along with the appropriate browser driver (e.g., `chromedriver`).

| Test Case | Action | Verification |
| :--- | :--- | :--- |
| **TC1: Successful Login** | Enters credentials and clicks login. | Redirects to the Dashboard and displays the patient's name ("John Smith"). |
| **TC2: Navigation to Messages** | Logs in and clicks the "Messaging" link. | Successfully lands on the Messages page. |
| **TC3: Send Message via UI** | Logs in, selects a conversation, types a message, and sends it. | The newly sent message appears in the conversation history. |

**Test Script Location:** `testing/ui_selenium/web_tests.py`

## 4. Performance Testing (Apache JMeter)

The provided JMX file contains three thread groups to simulate load on the backend API. These tests should be executed using the **Apache JMeter** application.

| Test Case | Endpoint | Load Profile | Goal |
| :--- | :--- | :--- | :--- |
| **TC1: Concurrent Login Load** | `POST /api/auth/login` | 50 Users, 10-second ramp-up | Measure the response time and throughput of the login endpoint under load. |
| **TC2: Message Retrieval Latency** | `GET /api/messages/conversations` | 20 Users, 5-second ramp-up | Measure the latency for retrieving a patient's conversation list. |
| **TC3: Rapid Messaging Stress** | `POST /api/messages/1/send` | 100 Users, 1-second ramp-up | Stress test the messaging endpoint to find the breaking point of the server. |

**JMeter Script Location:** `testing/performance/load_test.jmx`

## 5. UI Testing (BDD) - Java Selenium + Cucumber

This approach uses **Behavior-Driven Development (BDD)** to define tests in plain language (Gherkin syntax) and execute them using Java, Selenium, and Cucumber.

| Test Case | Scenario | Description |
| :--- | :--- | :--- |
| **TC1: Successful Login** | `Successful login to the patient portal` | Verifies the entire login flow from the login page to the dashboard. |
| **TC2: Viewing Messages** | `Viewing messages from a healthcare provider` | Verifies the ability to navigate to the Messages page and see the conversation list. |
| **TC3: Sending a Message** | `Sending a message to a healthcare provider` | Verifies the core functionality of typing and sending a message within an active conversation. |

**Feature File Location:** `testing/bdd_cucumber/patient_portal.feature`
**Step Definitions Location:** `testing/bdd_cucumber/StepDefinitions.java`

---

### Setup Instructions for Testing

1.  **Download**: Extract the attached `DemoPatientPortal.zip` to update your project files.
2.  **Database**: Run the SQL script in `testing/database/db_tests.sql` in SSMS.
3.  **Unit Testing**: Navigate to `DemoPatientPortal/backend` and run `npm install vitest` (if not installed), then run the tests using `npx vitest`.
4.  **UI Testing (Python)**: Install Python and Selenium (`pip install selenium`). Ensure you have a browser driver (e.g., `chromedriver`) in your system PATH. Run the tests using `python testing/ui_selenium/web_tests.py`.
5.  **Performance (JMeter)**: Open `testing/performance/load_test.jmx` in Apache JMeter and execute the test plan.
6.  **BDD (Java/Cucumber)**: Set up a Java project with Cucumber and Selenium dependencies. Place the files in the appropriate source folders and run the Cucumber runner class.

The updated project zip contains all these files in the `testing` directory.
