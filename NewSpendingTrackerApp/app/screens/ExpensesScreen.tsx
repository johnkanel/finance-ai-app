import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getExpenses, deleteExpense as deleteExpenseAPI , getCategories  } from '../services/expenseService';  // Import the API services
import { useFocusEffect } from '@react-navigation/native';

interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
}

const ExpensesScreen: React.FC = ({ navigation }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);  // Store expenses fetched from the backend
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [sortOption, setSortOption] = useState<'date' | 'amount' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filtersVisible, setFiltersVisible] = useState(false); // Toggle for filters visibility
  const [filterHeight] = useState(new Animated.Value(0));

  useFocusEffect(
    React.useCallback(() => {
      const fetchExpenses = async () => {
        const userId = "user-id-placeholder"; // Replace with actual user ID
        try {
          const expensesData = await getExpenses(userId);
          console.log('Fetched expenses:', expensesData); // Verify the fetched data
          setExpenses(expensesData);
          setFilteredExpenses(expensesData);
        } catch (error) {
          console.error('Error fetching expenses:', error);
        }
      };
      fetchExpenses();
    }, [])
  );
  
  

  useEffect(() => {
    applyFiltersAndSort(selectedCategory, startDate, endDate, sortOption, sortDirection);
  }, [expenses]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    applyFiltersAndSort(category, startDate, endDate, sortOption, sortDirection);
  };

  const handleDateChange = (event: any, selectedDate?: Date, type: 'start' | 'end') => {
    if (type === 'start') {
      setStartDate(selectedDate || startDate);
    } else {
      setEndDate(selectedDate || endDate);
    }
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    applyFiltersAndSort(selectedCategory, selectedDate || startDate, type === 'start' ? endDate : selectedDate, sortOption, sortDirection);
  };

  const handleSortChange = (option: 'date' | 'amount' | 'category') => {
    setSortOption(option);
    applyFiltersAndSort(selectedCategory, startDate, endDate, option, sortDirection);
  };
  const handleExpenseUpdate = (updatedExpense: Expense) => {
    setExpenses((prevExpenses) =>
      prevExpenses.map((expense) =>
        expense._id === updatedExpense._id ? updatedExpense : expense
      )
    );
  };

  const onEditExpense = (expenseItem: Expense) => {
    navigation.navigate("EditExpenseScreen", {
      expense: expenseItem, // Pass the correct expense
      updateExpense: handleExpenseUpdate, // Function to sync updated data
    });
  };

  const handleSortDirectionChange = (direction: 'asc' | 'desc') => {
    setSortDirection(direction);
    applyFiltersAndSort(selectedCategory, startDate, endDate, sortOption, direction);
  };

  const applyFiltersAndSort = (
    category: string,
    startDate: Date | null,
    endDate: Date | null,
    sortOption: 'date' | 'amount' | 'category',
    sortDirection: 'asc' | 'desc'
  ) => {
    let filtered = expenses;

    if (category !== 'All') {
      filtered = filtered.filter(expense => expense.category === category);
    }

    if (startDate) {
      filtered = filtered.filter(expense => new Date(expense.date) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(expense => new Date(expense.date) <= endDate);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortOption === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortOption === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortOption === 'category') {
        comparison = a.category.localeCompare(b.category);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredExpenses(filtered);
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseDetails}>
        <Text style={styles.expenseText}>{item.description}</Text>
        <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
        <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.categoryText}>Category: {item.category}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('EditExpense', { expense: item })}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Delete Expense",
              "Are you sure you want to delete this expense?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteExpenseAPI(item._id); // Call backend to delete
                      setExpenses(expenses.filter(exp => exp._id !== item._id));  // Remove from UI
                      setFilteredExpenses(filteredExpenses.filter(exp => exp._id !== item._id));  // Update filtered list
                    } catch (error) {
                      console.error('Error deleting expense:', error);
                    }
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses</Text>
      {/* Your filter and sorting options */}
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item._id}
        renderItem={renderExpense}
        style={styles.expensesList}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddExpense')}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </TouchableOpacity>

        {/* Button to navigate to Analytics Screen */}
        <TouchableOpacity
        style={styles.analyticsButton}
        onPress={() => navigation.navigate('Analytics', { expenses: expenses })}
      >
        <Text style={styles.buttonText}>View Analytics</Text>
      </TouchableOpacity>
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
  expenseItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  amountText: {
    fontSize: 14,
    color: '#28a745',
  },
  dateText: {
    fontSize: 14,
    color: '#6c757d',
  },
  categoryText: {
    fontSize: 14,
    color: '#007bff',
  },
  buttonsContainer: {
    justifyContent: 'space-around',
  },
  viewButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 8,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    borderRadius: 5,
    padding: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    padding: 15,
    marginTop: 16,
    alignItems: 'center',
  },
  analyticsButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 15,
    marginTop: 16,
    alignItems: 'center',
  },
});

export default ExpensesScreen;
