const express = require('express');
const router = express.Router();
const miniAppController = require('../controllers/miniAppController');

// User registration and profile routes
router.post('/register', miniAppController.registerUser);
router.get('/user/:telegramId', miniAppController.getUserProfile);

// Airdrop route
router.post('/airdrop', miniAppController.triggerAirdrop);

// Withdrawal route
router.post('/withdraw', miniAppController.processWithdrawal);

// Tasks routes
router.get('/tasks', miniAppController.getTasks);
router.post('/tasks/complete', miniAppController.completeTask);

// Boost route
router.post('/boost', miniAppController.applyBoost);

// Referral routes
router.get('/referral/:telegramId', miniAppController.getReferralDetails);
router.post('/referral', miniAppController.processReferral);

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'DOVAZOL API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
