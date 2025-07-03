import axios from 'axios';

// Define the base URL for your API (πρέπει να το ρυθμίσεις στο backend)
const API_URL = 'http://192.168.1.241:5000/api/incomes';

// Fetch all incomes for a specific user
export const getIncomes = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data; // Returns an array of incomes
  } catch (error) {
    console.error('Error fetching incomes:', error);
    throw error;
  }
};

// Add a new income
export const addIncome = async (income) => {
  try {
    const response = await axios.post(`${API_URL}/add`, income);
    return response.data; // Returns the created income
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }
};

// Delete an income by ID
export const deleteIncome = async (id) => {
  try {
    await axios.delete(`${API_URL}/delete/${id}`);
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};

// Edit/update an income by ID
export const updateIncome = async (id, updatedIncome) => {
  try {
    const response = await axios.put(`${API_URL}/update/${id}`, updatedIncome);
    return response.data;
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};
