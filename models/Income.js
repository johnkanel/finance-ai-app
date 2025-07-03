const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    user: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Income', incomeSchema);
