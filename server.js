const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS to allow requests from React Native app


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Update route to point to expense.js
const expenseRoutes = require('./routes/expense'); // Changed from 'transactions' to 'expense'
app.use('/api/expenses', expenseRoutes); // Updated route prefix to '/api/expenses'

const incomeRoutes = require('./routes/income'); // Import το νέο route
app.use('/api/incomes', incomeRoutes); // Προσθήκη του income route

const dialogflowRoutes = require('./routes/dialogflow');
app.use('/api/dialogflow', dialogflowRoutes);

const mlRoutes = require('./routes/mlRoutes');
app.use('/api/ml', mlRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

// Basic route for testing server
app.get('/', (req, res) => {
    res.send('Personal Finance API is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
