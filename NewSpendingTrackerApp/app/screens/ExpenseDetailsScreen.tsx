import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface ExpenseDetailsScreenProps {
  route: any;
  navigation: any;
}

const ExpenseDetailsScreen: React.FC<ExpenseDetailsScreenProps> = ({ route, navigation }) => {
  const { expense } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Details</Text>
      <Text>Description: {expense.description}</Text>
      <Text>Amount: ${expense.amount}</Text>
      <Button
        title="Edit Expense"
        onPress={() =>
          navigation.navigate('EditExpense', { expense }) // Navigate with the expense
        }
      />
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
});

export default ExpenseDetailsScreen;
