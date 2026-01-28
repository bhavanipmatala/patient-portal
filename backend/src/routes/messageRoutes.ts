import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  archiveConversation,
  createConversation,
  getProviders,
} from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.put('/conversations/:conversationId/archive', archiveConversation);
router.put('/conversations/:conversationId/read', markAsRead);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.delete('/messages/:messageId', deleteMessage);

// Provider routes
router.get('/providers', getProviders);

export default router;
