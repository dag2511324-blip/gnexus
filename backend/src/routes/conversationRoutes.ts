import { Router } from 'express';
import * as conversationController from '../controllers/conversationController';
import { authenticate } from '../middleware/auth';
import { chatLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Conversation routes
router.get('/', conversationController.getConversations);
router.post('/', conversationController.createConversation);
router.get('/:id', conversationController.getConversation);
router.patch('/:id', conversationController.updateConversation);
router.delete('/:id', conversationController.deleteConversation);

// Message routes
router.post('/:id/messages', chatLimiter, conversationController.sendMessage);
router.post('/:id/messages/stream', chatLimiter, conversationController.streamMessage);

export default router;
