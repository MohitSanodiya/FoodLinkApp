const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(verifyToken);
router.use(requireAdmin);

// Admin Routes
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/verify', adminController.verifyUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/listings', adminController.getListings);
router.get('/recent-activity', adminController.getRecentActivity);

module.exports = router;
