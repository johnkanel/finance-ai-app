import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addExpense as addExpenseAPI } from '../services/expenseService';
import { expenseCategories } from '../constants/expenseCategories'; // ✅ Νέα import
import { ScrollView } from 'react-native';

interface AddExpenseScreenProps {
  navigation: any;
}

const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAddExpense = async () => {
    if (description && amount && selectedCategory) {
      const newExpense = { 
        user: "user-id-placeholder",
        type: "expense",
        description,
        amount: parseFloat(amount),
        date,
        category: selectedCategory 
      };

      try {
        console.log("📅 Επιλεγμένη ημερομηνία:", date.toISOString());
        await addExpenseAPI(newExpense);
        Alert.alert('Success', 'Expense added successfully');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'Failed to add expense');
      }
    } else {
      alert('Please fill out all fields.');
    }
  };

const handleDateChange = (event: any, selectedDate?: Date) => {
  if (event.type === 'set' && selectedDate) {
    setDate(selectedDate);
  }
  setShowDatePicker(false);
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Προσθήκη Έξοδου</Text>
      <TextInput
        placeholder="Περιγραφή"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Ποσό"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Επιλογή Ημερομηνίας" onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

<ScrollView style={styles.categoriesContainer}>
    {expenseCategories.map(({ label, value }) => (
      <Button 
        key={value} 
        title={label} 
        onPress={() => setSelectedCategory(value)} 
        color={selectedCategory === value ? 'tomato' : 'gray'}
      />
    ))}
  </ScrollView>
      <Button title="Προσθήκη Έξοδου" onPress={handleAddExpense} />
      
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
    marginBottom: 10,
    marginTop:10,
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
  categoriesContainer: {
    marginBottom: 20, // Add some space below categories
  },
  addButtonContainer: {
    marginTop: 'auto', // Push "Add" button to the bottom
  },
  
});

export default AddExpenseScreen;
