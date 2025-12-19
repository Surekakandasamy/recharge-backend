const Transaction = require('../models/Transaction');
const { successResponse, errorResponse } = require('../utils/response');
const mongoose = require('mongoose');

const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (req.user && req.user._id) {
      filter.userId = new mongoose.Types.ObjectId(req.user._id);
    } else {
      return errorResponse(res, 'User authentication required', 401);
    }
    
    const transactions = await Transaction.find(filter)
      .populate('planId', 'name price')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    successResponse(res, transactions);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    errorResponse(res, error.message || 'Failed to fetch transactions');
  }
};

const createTransaction = async (req, res) => {
  try {
    const { userId, type, amount } = req.body;
    
    if (!userId || !type || !amount) {
      return errorResponse(res, 'Missing required fields: userId, type, amount', 400);
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return errorResponse(res, 'Invalid userId format', 400);
    }
    
    const transactionData = {
      ...req.body,
      referenceId: `TXN${Date.now()}`
    };
    
    const transaction = await Transaction.create(transactionData);
    successResponse(res, transaction, 'Transaction created successfully', 201);
  } catch (error) {
    console.error('Error in createTransaction:', error);
    if (error.code === 11000) {
      return errorResponse(res, 'Duplicate reference ID', 400);
    }
    errorResponse(res, error.message || 'Failed to create transaction');
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid transaction ID format', 400);
    }
    
    if (!req.user || !req.user._id) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    
    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id
    }).populate('planId');

    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    successResponse(res, transaction);
  } catch (error) {
    console.error('Error in getTransactionById:', error);
    errorResponse(res, error.message || 'Failed to fetch transaction');
  }
};

const deleteAllTransactions = async (req, res) => {
  try {
    const result = await Transaction.deleteMany({});
    successResponse(res, { deletedCount: result.deletedCount }, 'All transactions deleted successfully');
  } catch (error) {
    console.error('Error in deleteAllTransactions:', error);
    errorResponse(res, error.message || 'Failed to delete transactions');
  }
};

module.exports = { getTransactions, createTransaction, getTransactionById, deleteAllTransactions };
