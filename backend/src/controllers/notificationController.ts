import { Response } from 'express';
import { getPool } from '../config/database';
import { AuthRequest } from '../types';

// Get all notifications for a patient
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
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
          NotificationId,
          PatientId,
          Title,
          Message,
          Type,
          IsRead,
          RelatedMessageId,
          CreatedAt
        FROM PQE_Notifications
        WHERE PatientId = @patientId
        ORDER BY CreatedAt DESC
      `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
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
        SELECT COUNT(*) AS UnreadCount
        FROM PQE_Notifications
        WHERE PatientId = @patientId AND IsRead = 0
      `);

    res.json({
      success: true,
      data: {
        unreadCount: result.recordset[0].UnreadCount,
      },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { notificationId } = req.params;

    const pool = await getPool();
    
    // Verify patient owns this notification
    const notificationCheck = await pool
      .request()
      .input('notificationId', notificationId)
      .input('patientId', req.patient.PatientId)
      .query(`
        SELECT NotificationId FROM PQE_Notifications 
        WHERE NotificationId = @notificationId AND PatientId = @patientId
      `);

    if (notificationCheck.recordset.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Notification not found',
      });
      return;
    }

    await pool
      .request()
      .input('notificationId', notificationId)
      .query(`
        UPDATE PQE_Notifications SET IsRead = 1 WHERE NotificationId = @notificationId
      `);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const pool = await getPool();
    await pool
      .request()
      .input('patientId', req.patient.PatientId)
      .query(`
        UPDATE PQE_Notifications SET IsRead = 1 WHERE PatientId = @patientId AND IsRead = 0
      `);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
};

// Delete a notification
export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.patient) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { notificationId } = req.params;

    const pool = await getPool();
    
    // Verify patient owns this notification
    const notificationCheck = await pool
      .request()
      .input('notificationId', notificationId)
      .input('patientId', req.patient.PatientId)
      .query(`
        SELECT NotificationId FROM PQE_Notifications 
        WHERE NotificationId = @notificationId AND PatientId = @patientId
      `);

    if (notificationCheck.recordset.length === 0) {
      res.status(403).json({
        success: false,
        error: 'Notification not found',
      });
      return;
    }

    await pool
      .request()
      .input('notificationId', notificationId)
      .query(`
        DELETE FROM PQE_Notifications WHERE NotificationId = @notificationId
      `);

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
};
