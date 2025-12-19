const Payment = require('../models/Payment');
const { successResponse, errorResponse } = require('../utils/response');

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('transactionId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    successResponse(res, payments);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

const createPayment = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return errorResponse(res, 'User authentication required', 401);
    }
    
    const payment = await Payment.create({
      ...req.body,
      userId: req.user._id
    });
    successResponse(res, payment, 'Payment created successfully', 201);
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = { getPayments, createPayment };
