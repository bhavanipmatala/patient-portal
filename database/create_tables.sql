-- DemoPatientPortal Database Setup Script
-- Server: ROEFDN812Q
-- Database: POS_Investigation

USE POS_Investigation;
GO

-- Drop existing tables if they exist (in reverse order of dependencies)
IF OBJECT_ID('dbo.PQE_MessageAttachments', 'U') IS NOT NULL DROP TABLE dbo.PQE_MessageAttachments;
IF OBJECT_ID('dbo.PQE_Messages', 'U') IS NOT NULL DROP TABLE dbo.PQE_Messages;
IF OBJECT_ID('dbo.PQE_Conversations', 'U') IS NOT NULL DROP TABLE dbo.PQE_Conversations;
IF OBJECT_ID('dbo.PQE_Notifications', 'U') IS NOT NULL DROP TABLE dbo.PQE_Notifications;
IF OBJECT_ID('dbo.PQE_HealthcareProviders', 'U') IS NOT NULL DROP TABLE dbo.PQE_HealthcareProviders;
IF OBJECT_ID('dbo.PQE_Patients', 'U') IS NOT NULL DROP TABLE dbo.PQE_Patients;
GO

-- Create PQE_Patients Table
CREATE TABLE dbo.PQE_Patients (
    PatientId INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    DateOfBirth DATE,
    PhoneNumber NVARCHAR(20),
    Address NVARCHAR(500),
    ProfileImage NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- Create PQE_HealthcareProviders Table
CREATE TABLE dbo.PQE_HealthcareProviders (
    ProviderId INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Specialty NVARCHAR(100),
    Department NVARCHAR(100),
    PhoneNumber NVARCHAR(20),
    ProfileImage NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- Create PQE_Conversations Table
CREATE TABLE dbo.PQE_Conversations (
    ConversationId INT IDENTITY(1,1) PRIMARY KEY,
    PatientId INT NOT NULL,
    ProviderId INT NOT NULL,
    Subject NVARCHAR(255),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    IsArchived BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES dbo.PQE_Patients(PatientId),
    FOREIGN KEY (ProviderId) REFERENCES dbo.PQE_HealthcareProviders(ProviderId)
);
GO

-- Create PQE_Messages Table
CREATE TABLE dbo.PQE_Messages (
    MessageId INT IDENTITY(1,1) PRIMARY KEY,
    ConversationId INT NOT NULL,
    SenderId INT NOT NULL,
    SenderType NVARCHAR(20) NOT NULL, -- 'Patient' or 'Provider'
    Content NVARCHAR(MAX) NOT NULL,
    IsRead BIT DEFAULT 0,
    IsDeleted BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    ReadAt DATETIME2,
    FOREIGN KEY (ConversationId) REFERENCES dbo.PQE_Conversations(ConversationId)
);
GO

-- Create PQE_Notifications Table
CREATE TABLE dbo.PQE_Notifications (
    NotificationId INT IDENTITY(1,1) PRIMARY KEY,
    PatientId INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- 'NewMessage', 'Appointment', 'Reminder', etc.
    IsRead BIT DEFAULT 0,
    RelatedMessageId INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (PatientId) REFERENCES dbo.PQE_Patients(PatientId),
    FOREIGN KEY (RelatedMessageId) REFERENCES dbo.PQE_Messages(MessageId)
);
GO

-- Create PQE_MessageAttachments Table
CREATE TABLE dbo.PQE_MessageAttachments (
    AttachmentId INT IDENTITY(1,1) PRIMARY KEY,
    MessageId INT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(500) NOT NULL,
    FileSize INT,
    MimeType NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (MessageId) REFERENCES dbo.PQE_Messages(MessageId)
);
GO

-- Create Indexes for better performance
CREATE INDEX IX_PQE_Messages_ConversationId ON dbo.PQE_Messages(ConversationId);
CREATE INDEX IX_PQE_Messages_IsRead ON dbo.PQE_Messages(IsRead);
CREATE INDEX IX_PQE_Conversations_PatientId ON dbo.PQE_Conversations(PatientId);
CREATE INDEX IX_PQE_Notifications_PatientId ON dbo.PQE_Notifications(PatientId);
CREATE INDEX IX_PQE_Notifications_IsRead ON dbo.PQE_Notifications(IsRead);
GO

-- Insert Sample Healthcare Providers
INSERT INTO dbo.PQE_HealthcareProviders (FirstName, LastName, Email, Specialty, Department, PhoneNumber)
VALUES 
    ('Sarah', 'Johnson', 'dr.sarah.johnson@mayoclinic.com', 'Internal Medicine', 'Primary Care', '(507) 284-2511'),
    ('Michael', 'Chen', 'dr.michael.chen@mayoclinic.com', 'Cardiology', 'Heart Center', '(507) 284-2512'),
    ('Emily', 'Williams', 'dr.emily.williams@mayoclinic.com', 'Dermatology', 'Skin Health', '(507) 284-2513'),
    ('Robert', 'Martinez', 'dr.robert.martinez@mayoclinic.com', 'Orthopedics', 'Bone & Joint', '(507) 284-2514'),
    ('Jennifer', 'Davis', 'nurse.jennifer.davis@mayoclinic.com', 'Nursing', 'Patient Care', '(507) 284-2515');
GO

-- Insert Sample Patients (Password is 'password123' hashed with bcrypt)
-- Note: In production, use proper bcrypt hashing. This is a placeholder hash.
INSERT INTO dbo.PQE_Patients (FirstName, LastName, Email, PasswordHash, DateOfBirth, PhoneNumber, Address)
VALUES 
    ('John', 'Smith', 'john.smith@email.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', '1985-03-15', '(555) 123-4567', '123 Main St, Rochester, MN 55901'),
    ('Mary', 'Johnson', 'mary.johnson@email.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', '1990-07-22', '(555) 234-5678', '456 Oak Ave, Rochester, MN 55902'),
    ('David', 'Brown', 'david.brown@email.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', '1978-11-08', '(555) 345-6789', '789 Pine Rd, Rochester, MN 55903'),
    ('Lisa', 'Wilson', 'lisa.wilson@email.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', '1995-01-30', '(555) 456-7890', '321 Elm St, Rochester, MN 55904'),
    ('James', 'Taylor', 'james.taylor@email.com', '$2b$10$rOzJqQZQZQZQZQZQZQZQZOeKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', '1982-09-12', '(555) 567-8901', '654 Maple Dr, Rochester, MN 55905');
GO

-- Insert Sample Conversations
INSERT INTO dbo.PQE_Conversations (PatientId, ProviderId, Subject)
VALUES 
    (1, 1, 'Annual Physical Results'),
    (1, 2, 'Heart Health Follow-up'),
    (2, 1, 'Medication Refill Request'),
    (2, 3, 'Skin Rash Consultation'),
    (3, 4, 'Knee Pain Assessment'),
    (4, 1, 'Lab Results Discussion'),
    (5, 2, 'Blood Pressure Monitoring');
GO

-- Insert Sample Messages
INSERT INTO dbo.PQE_Messages (ConversationId, SenderId, SenderType, Content, IsRead, CreatedAt)
VALUES 
    -- Conversation 1: Annual Physical Results
    (1, 1, 'Provider', 'Hello John, I wanted to follow up on your recent annual physical. Your results look great overall! Your cholesterol levels have improved since last year.', 1, DATEADD(DAY, -5, GETDATE())),
    (1, 1, 'Patient', 'Thank you Dr. Johnson! I''ve been trying to eat healthier and exercise more. Are there any other recommendations?', 1, DATEADD(DAY, -4, GETDATE())),
    (1, 1, 'Provider', 'That''s wonderful to hear! Keep up the good work. I''d recommend continuing with 30 minutes of moderate exercise daily and maintaining a diet rich in vegetables and lean proteins.', 0, DATEADD(DAY, -3, GETDATE())),
    
    -- Conversation 2: Heart Health Follow-up
    (2, 2, 'Provider', 'Hi John, this is Dr. Chen from Cardiology. I reviewed your recent ECG results and everything looks normal. Your heart rhythm is healthy.', 1, DATEADD(DAY, -7, GETDATE())),
    (2, 1, 'Patient', 'That''s a relief! Should I continue taking my current medications?', 1, DATEADD(DAY, -6, GETDATE())),
    (2, 2, 'Provider', 'Yes, please continue with your current regimen. Let''s schedule a follow-up in 6 months. You can book through the patient portal.', 0, DATEADD(DAY, -5, GETDATE())),
    
    -- Conversation 3: Medication Refill
    (3, 2, 'Patient', 'Dr. Johnson, I need a refill on my blood pressure medication. I have about a week''s supply left.', 1, DATEADD(DAY, -2, GETDATE())),
    (3, 1, 'Provider', 'Hi Mary, I''ve sent the prescription refill to your pharmacy. It should be ready for pickup tomorrow. Please remember to take it at the same time each day.', 0, DATEADD(DAY, -1, GETDATE())),
    
    -- Conversation 4: Skin Consultation
    (4, 2, 'Patient', 'Dr. Williams, I''ve noticed a new rash on my arm that appeared a few days ago. Should I be concerned?', 1, DATEADD(DAY, -3, GETDATE())),
    (4, 3, 'Provider', 'Hello Mary, can you describe the rash? Is it itchy, raised, or spreading? Also, have you started any new medications or used new products recently?', 1, DATEADD(DAY, -2, GETDATE())),
    (4, 2, 'Patient', 'It''s slightly raised and a bit itchy. I did start using a new laundry detergent last week.', 1, DATEADD(DAY, -1, GETDATE())),
    (4, 3, 'Provider', 'This sounds like it could be contact dermatitis from the new detergent. Try switching back to your old detergent and apply over-the-counter hydrocortisone cream. If it doesn''t improve in a week, please schedule an appointment.', 0, DATEADD(HOUR, -12, GETDATE())),
    
    -- Conversation 5: Knee Pain
    (5, 3, 'Patient', 'Dr. Martinez, my knee has been bothering me after my morning runs. The pain is on the outer side of my knee.', 1, DATEADD(DAY, -4, GETDATE())),
    (5, 4, 'Provider', 'Hi David, this sounds like it could be IT band syndrome, which is common in runners. I recommend reducing your running intensity, applying ice after exercise, and doing IT band stretches. Would you like me to send you some stretching exercises?', 0, DATEADD(DAY, -3, GETDATE())),
    
    -- Conversation 6: Lab Results
    (6, 4, 'Patient', 'Hi Dr. Johnson, I had my blood work done last week. Are the results available?', 1, DATEADD(DAY, -1, GETDATE())),
    (6, 1, 'Provider', 'Hello Lisa, yes, your lab results are in. Everything looks normal! Your vitamin D levels have improved since you started the supplements. Keep taking them through the winter months.', 0, DATEADD(HOUR, -6, GETDATE())),
    
    -- Conversation 7: Blood Pressure
    (7, 5, 'Patient', 'Dr. Chen, I''ve been monitoring my blood pressure at home as you suggested. The readings have been averaging around 125/82.', 1, DATEADD(DAY, -2, GETDATE())),
    (7, 2, 'Provider', 'Excellent work, James! Those readings are within a healthy range. Continue monitoring and logging your readings. Let''s review them at your next appointment in two weeks.', 0, DATEADD(DAY, -1, GETDATE()));
GO

-- Insert Sample Notifications
INSERT INTO dbo.PQE_Notifications (PatientId, Title, Message, Type, IsRead, RelatedMessageId, CreatedAt)
VALUES 
    (1, 'New Message from Dr. Johnson', 'You have a new message regarding your Annual Physical Results', 'NewMessage', 0, 3, DATEADD(DAY, -3, GETDATE())),
    (1, 'New Message from Dr. Chen', 'You have a new message regarding your Heart Health Follow-up', 'NewMessage', 0, 6, DATEADD(DAY, -5, GETDATE())),
    (2, 'New Message from Dr. Johnson', 'You have a new message regarding your Medication Refill Request', 'NewMessage', 0, 8, DATEADD(DAY, -1, GETDATE())),
    (2, 'New Message from Dr. Williams', 'You have a new message regarding your Skin Rash Consultation', 'NewMessage', 0, 12, DATEADD(HOUR, -12, GETDATE())),
    (3, 'New Message from Dr. Martinez', 'You have a new message regarding your Knee Pain Assessment', 'NewMessage', 0, 14, DATEADD(DAY, -3, GETDATE())),
    (4, 'New Message from Dr. Johnson', 'You have a new message regarding your Lab Results Discussion', 'NewMessage', 0, 16, DATEADD(HOUR, -6, GETDATE())),
    (5, 'New Message from Dr. Chen', 'You have a new message regarding your Blood Pressure Monitoring', 'NewMessage', 0, 18, DATEADD(DAY, -1, GETDATE())),
    (1, 'Appointment Reminder', 'You have an upcoming appointment on February 15, 2026 at 10:00 AM', 'Appointment', 0, NULL, DATEADD(DAY, -1, GETDATE())),
    (2, 'Prescription Ready', 'Your prescription is ready for pickup at CVS Pharmacy', 'Reminder', 1, NULL, DATEADD(DAY, -1, GETDATE()));
GO

PRINT 'Database tables created and sample data inserted successfully!';
GO
