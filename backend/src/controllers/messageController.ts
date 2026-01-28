import { Response } from 'express';
import { getPool } from '../config/database';
import { AuthRequest } from '../types';

// Get all conversations for a patient
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input('patientId', req.patient.PatientId)
      .query(`
        SELECT 
          c.ConversationId,
          c.PatientId,
          c.ProviderId,
          c.Subject,
          c.CreatedAt,
          c.UpdatedAt,
          c.IsArchived,
          hp.FirstName + ' ' + hp.LastName AS ProviderName,
          hp.Specialty AS ProviderSpecialty,
          hp.Department AS ProviderDepartment,
          (SELECT TOP 1 Content FROM PQE_Messages WHERE ConversationId = c.ConversationId ORDER BY CreatedAt DESC) AS LastMessage,
          (SELECT TOP 1 CreatedAt FROM PQE_Messages WHERE ConversationId = c.ConversationId ORDER BY CreatedAt DESC) AS LastMessageDate,
          (SELECT COUNT(*) FROM PQE_Messages WHERE ConversationId = c.ConversationId AND IsRead = 0 AND SenderType = 'Provider') AS UnreadCount
        FROM PQE_Conversations c
        INNER JOIN PQE_HealthcareProviders hp ON c.ProviderId = hp.ProviderId
        WHERE c.PatientId = @patientId AND c.IsArchived = 0
        ORDER BY LastMessageDate DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations',
    });
  }
};

// Get messages in a conversation
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { conversationId } = req.params;

    const pool = await getPool();
    
    // Verify patient has access to this conversation
    const conversationCheck = await pool
      .request()
      .input('conversationId', conversationId)
      .input('patientId', req.patient.PatientId)
      .query(`
        SELECT ConversationId FROM PQE_Conversations 
        WHERE ConversationId = @conversationId AND PatientId = @patientId
      `);

    if (conversationCheck.recordset.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Access denied to this conversation',
      });
      return;
    }

    const result = await pool
      .request()
      .input('conversationId', conversationId)
      .query(`
        SELECT 
          m.MessageId,
          m.ConversationId,
          m.SenderId,
          m.SenderType,
          m.Content,
          m.IsRead,
          m.IsDeleted,
          m.CreatedAt,
          m.ReadAt,
          CASE 
            WHEN m.SenderType = 'Patient' THEN p.FirstName + ' ' + p.LastName
            WHEN m.SenderType = 'Provider' THEN hp.FirstName + ' ' + hp.LastName
          END AS SenderName
        FROM PQE_Messages m
        LEFT JOIN PQE_Patients p ON m.SenderType = 'Patient' AND m.SenderId = p.PatientId
        LEFT JOIN PQE_HealthcareProviders hp ON m.SenderType = 'Provider' AND m.SenderId = hp.ProviderId
        WHERE m.ConversationId = @conversationId AND m.IsDeleted = 0
        ORDER BY m.CreatedAt ASC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
};

// Send a new message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Message content is required',
      });
      return;
    }

    const pool = await getPool();
    
    // Verify patient has access to this conversation
    const conversationCheck = await pool
      .request()
      .input('conversationId', conversationId)
      .input('patientId', req.patient.PatientId)
      .query(`
        SELECT ConversationId, ProviderId FROM PQE_Conversations 
        WHERE ConversationId = @conversationId AND PatientId = @patientId
      `);

    if (conversationCheck.recordset.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Access denied to this conversation',
      });
      return;
    }

    // Insert the message
    const result = await pool
      .request()
      .input('conversationId', conversationId)
      .input('senderId', req.patient.PatientId)
      .input('content', content.trim())
      .query(`
        INSERT INTO PQE_Messages (ConversationId, SenderId, SenderType, Content)
        OUTPUT INSERTED.*
        VALUES (@conversationId, @senderId, 'Patient', @content)
      `);

    // Update conversation's UpdatedAt
    await pool
      .request()
      .input('conversationId', conversationId)
      .query(`
        UPDATE PQE_Conversations SET UpdatedAt = GETDATE() WHERE ConversationId = @conversationId
      `);

    const newMessage = result.recordset[0];
    newMessage.SenderName = `${req.patient.FirstName} ${req.patient.LastName}`;

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
    });
  }
};

// Mark messages as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { conversationId } = req.params;

    const pool = await getPool();
    
    // Verify patient has access to this conversation
    const conversationCheck = await pool
      .request()
      .input('conversationId', conversationId)
      .input('patientId', req.patient.PatientId)
      .query(`
        SELECT ConversationId FROM PQE_Conversations 
        WHERE ConversationId = @conversationId AND PatientId = @patientId
      `);

    if (conversationCheck.recordset.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Access denied to this conversation',
      });
      return;
    }

    // Mark all provider messages in this conversation as read
    await pool
      .request()
      .input('conversationId', conversationId)
      .query(`
        UPDATE PQE_Messages 
        SET IsRead = 1, ReadAt = GETDATE() 
        WHERE ConversationId = @conversationId 
          AND SenderType = 'Provider' 
          AND IsRead = 0
      `);

    // Also mark related notifications as read
    await pool
      .request()
      .input('patientId', req.patient.PatientId)
      .input('conversationId', conversationId)
      .query(`
        UPDATE PQE_Notifications 
        SET IsRead = 1 
        WHERE PatientId = @patientId 
          AND RelatedMessageId IN (
            SELECT MessageId FROM PQE_Messages WHERE ConversationId = @conversationId
          )
      `);

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read',
    });
  }
};

// Delete a message (soft delete)
export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { messageId } = req.params;

    const pool = await getPool();
    
    // Verify patient owns this message
    const messageCheck = await pool
      .request()
      .input('messageId', messageId)
      .input('patientId', req.patient.PatientId)
      .query(`
        SELECT m.MessageId 
        FROM PQE_Messages m
        INNER JOIN PQE_Conversations c ON m.ConversationId = c.ConversationId
        WHERE m.MessageId = @messageId 
          AND c.PatientId = @patientId 
          AND m.SenderType = 'Patient'
      `);

    if (messageCheck.recordset.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Cannot delete this message',
      });
      return;
    }

    // Soft delete the message
    await pool
      .request()
      .input('messageId', messageId)
      .query(`
        UPDATE PQE_Messages SET IsDeleted = 1 WHERE MessageId = @messageId
      `);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message',
    });
  }
};

// Archive a conversation
export const archiveConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { conversationId } = req.params;

    const pool = await getPool();
    
    // Verify patient owns this conversation
    const conversationCheck = await pool
      .request()
      .input('conversationId', conversationId)
      .input('patientId', req.patient.PatientId)
      .query(`
        SELECT ConversationId FROM PQE_Conversations 
        WHERE ConversationId = @conversationId AND PatientId = @patientId
      `);

    if (conversationCheck.recordset.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Access denied to this conversation',
      });
      return;
    }

    await pool
      .request()
      .input('conversationId', conversationId)
      .query(`
        UPDATE PQE_Conversations SET IsArchived = 1 WHERE ConversationId = @conversationId
      `);

    res.json({
      success: true,
      message: 'Conversation archived successfully',
    });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to archive conversation',
    });
  }
};

// Create a new conversation
export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { providerId, subject, initialMessage } = req.body;

    if (!providerId || !subject || !initialMessage) {
      res.status(400).json({
        success: false,
        error: 'Provider ID, subject, and initial message are required',
      });
      return;
    }

    const pool = await getPool();
    
    // Verify provider exists
    const providerCheck = await pool
      .request()
      .input('providerId', providerId)
      .query(`
        SELECT ProviderId, FirstName, LastName, Specialty, Department 
        FROM PQE_HealthcareProviders 
        WHERE ProviderId = @providerId AND IsActive = 1
      `);

    if (providerCheck.recordset.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Healthcare provider not found',
      });
      return;
    }

    // Create conversation
    const conversationResult = await pool
      .request()
      .input('patientId', req.patient.PatientId)
      .input('providerId', providerId)
      .input('subject', subject)
      .query(`
        INSERT INTO PQE_Conversations (PatientId, ProviderId, Subject)
        OUTPUT INSERTED.*
        VALUES (@patientId, @providerId, @subject)
      `);

    const newConversation = conversationResult.recordset[0];

    // Add initial message
    await pool
      .request()
      .input('conversationId', newConversation.ConversationId)
      .input('senderId', req.patient.PatientId)
      .input('content', initialMessage)
      .query(`
        INSERT INTO PQE_Messages (ConversationId, SenderId, SenderType, Content)
        VALUES (@conversationId, @senderId, 'Patient', @content)
      `);

    const provider = providerCheck.recordset[0];
    newConversation.ProviderName = `${provider.FirstName} ${provider.LastName}`;
    newConversation.ProviderSpecialty = provider.Specialty;
    newConversation.ProviderDepartment = provider.Department;

    res.status(201).json({
      success: true,
      data: newConversation,
      message: 'Conversation created successfully',
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation',
    });
  }
};

// Get healthcare providers list
export const getProviders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT ProviderId, FirstName, LastName, Email, Specialty, Department, PhoneNumber, ProfileImage
      FROM PQE_HealthcareProviders
      WHERE IsActive = 1
      ORDER BY LastName, FirstName
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch providers',
    });
  }
};
