const User = require('../models/User');
const Wallet = require('../models/Wallet');
const createToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    console.log('Registration attempt:', { name, email, phone });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return errorResponse(res, 'User already exists', 400);
    }

    const user = await User.create({ name, email, password, phone });
    console.log('User created in Atlas:', user._id, email);
    
    await Wallet.create({ userId: user._id });
    console.log('Wallet created for user:', user._id);

    const token = createToken(user._id);
    
    successResponse(res, { 
      user: { id: user._id, name, email, phone }, 
      token 
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    errorResponse(res, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = createToken(user._id);
    
    successResponse(res, { 
      user: { id: user._id, name: user.name, email: user.email }, 
      token 
    }, 'Login successful');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

module.exports = { register, login };