const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  investorType: {
    type: String,
    enum: ['Beginner', 'Amateur'],
    required: true
  },
  portfolio: [{
    stockName: String,
    quantity: Number,
    averageBuyPrice: Number,
    currentPrice: Number,
    profitLoss: Number,
    profitLossPercentage: Number
  }],
  financialGoals: {
    investmentAmount: Number,
    targetReturn: Number,
    timePeriod: Number // in months
  },
  selectedStocks: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 