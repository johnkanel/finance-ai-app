import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity, SectionList } from 'react-native';
import { getExpenses } from '../services/expenseService';
import { getIncomes } from '../services/incomeService';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Transaction {
  _id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: string;
}

interface GroupedTransactions {
  title: string; // Month and Year
  data: Transaction[]; // Transactions for that month
}

const TransactionsScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<GroupedTransactions[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      const userId = 'user-id-placeholder';
      try {
        const expensesData = await getExpenses(userId);
        const incomesData = await getIncomes(userId);

        const formattedTransactions: Transaction[] = [
          ...expensesData.map((exp) => ({ ...exp, type: 'expense' })),
          ...incomesData.map((inc) => ({ ...inc, type: 'income' })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTransactions(formattedTransactions);
        setFilteredTransactions(groupTransactionsByMonth(formattedTransactions));
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [selectedCategory, selectedDate, selectedMonth]);

  // Helper function to group transactions by month
  const groupTransactionsByMonth = (transactions: Transaction[]): GroupedTransactions[] => {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(transaction);
    });

    return Object.keys(grouped).map((monthYear) => ({
      title: monthYear,
      data: grouped[monthYear] || [], // Ensure data is always an array
    }));
  };

  // Filter transactions by selected category, date, and month
  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by specific date
    if (selectedDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === selectedDate.getFullYear() &&
          itemDate.getMonth() === selectedDate.getMonth() &&
          itemDate.getDate() === selectedDate.getDate()
        );
      });
    }
    if (selectedMonth) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        const itemMonth = itemDate.toLocaleString('default', { month: 'long' });
        const itemYear = itemDate.getFullYear();
        const selectedYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();
        return itemMonth === selectedMonth && itemYear === selectedYear;
      });
    }
    

    // Update grouped transactions after filter
    setFilteredTransactions(groupTransactionsByMonth(filtered));
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedDate(null);
    setSelectedMonth(null);
    setFilteredTransactions(groupTransactionsByMonth(transactions));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>

      {/* Category Picker */}
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="All Categories" value="all" />
        <Picker.Item label="Food" value="food" />
        <Picker.Item label="Rent" value="rent" />
        <Picker.Item label="Salary" value="salary" />
        <Picker.Item label="Shopping" value="shopping" />
      </Picker>

      {/* Date Picker Button */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>{selectedDate ? selectedDate.toDateString() : 'Select Date'}</Text>
      </TouchableOpacity>

      

      {/* Date Time Picker for Specific Date */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <Button title="Reset Filters" onPress={resetFilters} color="tomato" />

      {/* SectionList to display grouped transactions */}
      <SectionList
        sections={filteredTransactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={[styles.transactionItem, item.type === 'income' ? styles.incomeItem : styles.expenseItem]}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.amount}>{item.type === 'income' ? `+ $${item.amount.toFixed(2)}` : `- $${item.amount.toFixed(2)}`}</Text>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
  },
  transactionItem: {
    flexDirection: 'column',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  incomeItem: {
    borderLeftColor: 'green',
    borderLeftWidth: 4,
  },
  expenseItem: {
    borderLeftColor: 'red',
    borderLeftWidth: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  sectionHeader: {
    backgroundColor: '#eee',
    padding: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TransactionsScreen;
