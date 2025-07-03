import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getIncomes } from '../services/incomeService'; // API για τα έσοδα
import { useFocusEffect } from '@react-navigation/native';

interface Income {
  _id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
}

const IncomeScreen: React.FC = ({ navigation }) => {
  const [incomes, setIncomes] = useState<Income[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const fetchIncomes = async () => {
        const userId = 'user-id-placeholder'; // Αντικατέστησε με το πραγματικό user ID
        try {
          const incomesData = await getIncomes(userId);
          console.log('Fetched incomes:', incomesData);
          setIncomes(incomesData);
        } catch (error) {
          console.error('Error fetching incomes:', error);
        }
      };
      fetchIncomes();
    }, [])
  );

  const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Income Overview</Text>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total Income: ${totalIncome.toFixed(2)}</Text>
      </View>

      <FlatList
        data={incomes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.incomeItem}>
            <Text>{item.description}</Text>
            <Text>${item.amount.toFixed(2)}</Text>
          </View>
        )}
      />

      <Button title="Add Income" onPress={() => navigation.navigate('AddIncome')} />
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
  summaryContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '600',
  },
  incomeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 5,
  },
});

export default IncomeScreen;
