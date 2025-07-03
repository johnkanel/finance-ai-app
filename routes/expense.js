const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense'); // Assuming your model is defined in models/Expense.js

// Add a new expense
router.post('/add', async (req, res) => {
    const { user, type, amount, category, description,date  } = req.body;
    console.log("Received data:", req.body); // Log the incoming data
    
    try {
        // Check if any required field is missing
        if (!user || !type || !amount || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        // Create a new expense document
        const newExpense = new Expense({ user, type, amount, category, description,date: date ? new Date(date) : new Date() });
        await newExpense.save();
        
        console.log("Expense added:", newExpense); // Log the newly created expense
        res.status(201).json(newExpense); // Respond with the created expense
    } catch (error) {
        console.error('Error adding expense:', error); // Log the error
        res.status(500).json({ message: 'Failed to add expense', error: error.message });
    }
});


// Get all expenses for a specific user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const expenses = await Expense.find({ user: userId });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch expenses', error });
    }
});

// Update an expense
router.put('/update/:expenseId', async (req, res) => {
    const { expenseId } = req.params;
    const { amount, category, description,date } = req.body;

    try {
        if (!amount || !category || !description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            { amount, category, description, date: date ? new Date(date) : new Date() },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error.message);
        res.status(500).json({ message: 'Failed to update expense', error: error.message });
    }
});


// Delete an expense
router.delete('/delete/:expenseId', async (req, res) => {
    const { expenseId } = req.params;
    try {
        await Expense.findByIdAndDelete(expenseId);
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete expense', error });
    }
});

// Get expense statistics for a user
router.get('/stats/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const expenses = await Expense.find({ user: userId });
        const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.status(200).json({ totalExpense });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get expense statistics', error });
    }
});

module.exports = router;
