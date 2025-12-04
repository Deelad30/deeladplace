const express = require('express');
const router = express.Router();
const InviteController = require('../controllers/invite.controller');
const auth = require('../middleware/auth.middleware');

router.post('/invite', auth, InviteController.inviteUser); // Admin invites
router.post('/accept', InviteController.acceptInvite); // Accept invite (token + password)
router.get('/invites', auth, InviteController.getUserInvites);    // List all invites for tenant
router.delete('/cancel/:id', auth, InviteController.cancelInvite); 
router.delete('/delete/:id', auth, InviteController.deleteInvite);

module.exports = router;
