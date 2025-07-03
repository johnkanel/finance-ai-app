const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: { type: String, required: true },
    type: { type: String, required: true }, // 'expense' or 'income'
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);
