const express = require('express');
const router = express.Router();
const Income = require('../models/Income'); // Θα φτιάξουμε το μοντέλο

// Προσθήκη νέου εισοδήματος
router.post('/add', async (req, res) => {
    const { user, amount, category, description } = req.body;
    console.log("Received income data:", req.body); 

    try {
        if (!user || !amount || !category) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newIncome = new Income({ user, amount, category, description });
        await newIncome.save();
        
        console.log("Income added:", newIncome); 
        res.status(201).json(newIncome);
    } catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ message: 'Failed to add income', error: error.message });
    }
});

// Λήψη όλων των εισοδημάτων για έναν χρήστη
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const incomes = await Income.find({ user: userId });
        res.status(200).json(incomes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch incomes', error });
    }
});

// Ενημέρωση εισοδήματος
router.put('/update/:incomeId', async (req, res) => {
    const { incomeId } = req.params;
    const { amount, category, description } = req.body;

    try {
        if (!amount || !category || !description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const updatedIncome = await Income.findByIdAndUpdate(
            incomeId,
            { amount, category, description },
            { new: true }
        );

        if (!updatedIncome) {
            return res.status(404).json({ message: 'Income not found' });
        }

        res.status(200).json(updatedIncome);
    } catch (error) {
        console.error('Error updating income:', error.message);
        res.status(500).json({ message: 'Failed to update income', error: error.message });
    }
});

// Διαγραφή εισοδήματος
router.delete('/delete/:incomeId', async (req, res) => {
    const { incomeId } = req.params;
    try {
        await Income.findByIdAndDelete(incomeId);
        res.status(200).json({ message: 'Income deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete income', error });
    }
});

// Στατιστικά εισοδημάτων χρήστη
router.get('/stats/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const incomes = await Income.find({ user: userId });
        const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
        res.status(200).json({ totalIncome });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get income statistics', error });
    }
});

module.exports = router;
