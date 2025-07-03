import axios from 'axios';

// Define the base URL for your API
const API_URL = 'http://192.168.1.241:5000/api/expenses';

// Fetch all expenses from the backend for a specific user
export const getExpenses = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data; // Returns an array of expenses
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

// Add a new expense
export const addExpense = async (expense) => {
  try {
    const response = await axios.post(`${API_URL}/add`, expense);
    return response.data; // Returns the created expense
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error; // Throws the error for further handling in the component
  }
};

// Delete an expense by ID
export const deleteExpense = async (id) => {
  try {
    await axios.delete(`${API_URL}/delete/${id}`); // Use /delete endpoint
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Edit/update an expense by ID
export const updateExpense = async (id, updatedExpense) => {
  try {
    console.log('Sending update request for expense:', id, updatedExpense); // Add this log
    const response = await axios.put(`${API_URL}/update/${id}`, updatedExpense);
    return response.data;
  } catch (error) {
    console.error('Error updating expense:', error.response?.data || error.message);
    throw error;
  }
};
