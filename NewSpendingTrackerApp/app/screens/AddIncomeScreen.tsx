import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addExpense as addIncomeAPI } from '../services/expenseService'; // Αν έχεις ξεχωριστό incomeService, άλλαξε το
import { incomeCategories } from '../constants/incomeCategories'; // ✅ Νέα import

interface AddIncomeScreenProps {
  navigation: any;
}

const AddIncomeScreen: React.FC<AddIncomeScreenProps> = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAddIncome = async () => {
    if (description && amount && selectedCategory) {
      const newIncome = { 
        user: "user-id-placeholder",
        type: "income",
        description,
        amount: parseFloat(amount),
        date,
        category: selectedCategory 
      };

      try {
        await addIncomeAPI(newIncome);
        Alert.alert('Success', 'Income added successfully');
        navigation.goBack();
      } catch (error) {
        Alert.alert('Error', 'Failed to add income');
      }
    } else {
      alert('Please fill out all fields.');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Προσθήκη Εισοδήματος</Text>
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

      <Text style={styles.categoryTitle}>Κατηγορία:</Text>
      {incomeCategories.map(({ label, value }) => (
        <Button 
          key={value} 
          title={label} 
          onPress={() => setSelectedCategory(value)} 
          color={selectedCategory === value ? 'tomato' : 'gray'}
        />
      ))}

      <Button title="Προσθήκη Εισοδήματος" onPress={handleAddIncome} />
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
});

export default AddIncomeScreen;
