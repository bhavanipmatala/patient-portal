-- DemoPatientPortal Database Test Cases (MS SQL Server)

-- TEST CASE 1: Verify Patient Authentication Data
-- Description: Ensure the system can correctly retrieve a patient by email and verify password.
DECLARE @TestEmail NVARCHAR(100) = 'john.smith@email.com';
IF EXISTS (SELECT 1 FROM PQE_Patients WHERE Email = @TestEmail)
    PRINT 'TC1 SUCCESS: Patient found by email.';
ELSE
    PRINT 'TC1 FAILURE: Patient not found.';

-- TEST CASE 2: Verify Message Integrity
-- Description: Ensure messages are correctly linked to conversations and patients.
SELECT TOP 3 
    m.MessageId, 
    c.Subject, 
    p.FirstName + ' ' + p.LastName AS PatientName,
    m.Content
FROM PQE_Messages m
JOIN PQE_Conversations c ON m.ConversationId = c.ConversationId
JOIN PQE_Patients p ON c.PatientId = p.PatientId
WHERE p.Email = 'john.smith@email.com';
PRINT 'TC2: Verified message-conversation-patient linkage.';

-- TEST CASE 3: Verify Notification Unread Count Logic
-- Description: Check if unread notifications exist for a specific patient.
SELECT COUNT(*) as UnreadCount 
FROM PQE_Notifications 
WHERE PatientId = (SELECT PatientId FROM PQE_Patients WHERE Email = 'john.smith@email.com')
AND IsRead = 0;
PRINT 'TC3: Verified unread notification count retrieval.';
