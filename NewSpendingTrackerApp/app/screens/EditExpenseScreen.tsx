import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateExpense as updateExpenseService } from '../services/expenseService'; // Import the service

interface EditExpenseScreenProps {
  route: any;
  navigation: any;
}

const EditExpenseScreen: React.FC<EditExpenseScreenProps> = ({ route, navigation }) => {
  const { expense,updateExpense } = route.params;
  console.log("Expense received in EditExpenseScreen:", expense);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [date, setDate] = useState(new Date(expense.date)); // Ensure date is a Date object
  const [selectedCategory, setSelectedCategory] = useState(expense.category);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = ['Food', 'Rent', 'Utilities', 'Entertainment', 'Other'];

  const handleSave = async () => {
    const updatedExpense = {
      id: expense._id, // Adjust to _id if required by your backend
      description,
      amount: parseFloat(amount),
      date,
      category: selectedCategory,
    };

    if (!expense._id) {
      console.error("Expense ID is undefined.");
      return;
  }
    try {
      // Call the service to update the expense in the backend
      const updatedData = await updateExpenseService(expense._id, updatedExpense);
      
      // Optionally, if you want to update the state or perform any other actions after the update:
      // updateExpense(updatedData);
      if (updateExpense) {
        updateExpense(updatedData); // Sync updated data with ExpensesScreen
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Expense</Text>
      
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.categoryTitle}>Select Category:</Text>
      {categories.map((category) => (
        <Button
          key={category}
          title={category}
          onPress={() => setSelectedCategory(category)}
          color={selectedCategory === category ? 'tomato' : 'gray'}
        />
      ))}

      <View style={styles.dateContainer}>
        <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
        <Text style={styles.dateText}>Selected Date: {date.toLocaleDateString()}</Text>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
  categoryTitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  dateContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#555',
    marginVertical: 10,
  },
});

export default EditExpenseScreen;
