const express = require('express');
const router = express.Router();
const InviteController = require('../controllers/invite.controller');
const auth = require('../middleware/auth.middleware');

router.post('/invite', auth, InviteController.inviteUser); // Admin invites
router.post('/accept', InviteController.acceptInvite); // Accept invite (token + password)

module.exports = router;
