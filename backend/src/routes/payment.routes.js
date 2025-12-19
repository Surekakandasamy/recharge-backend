const express = require('express');
const { getPayments, createPayment } = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getPayments);
router.post('/', authMiddleware, createPayment);

module.exports = router;