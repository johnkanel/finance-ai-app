import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { getExpenses } from '../services/expenseService';
import { getIncomes } from '../services/incomeService';
import { useFocusEffect } from '@react-navigation/native';
import {  expenseCategories } from '../constants/expenseCategories';
import{incomeCategories} from '../constants/incomeCategories';

interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
}

interface Income {
  _id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
}

const AnalyticsScreen: React.FC = ({ route }) => {
  const [expenses, setExpenses] = useState<Expense[]>(route.params?.expenses || []);
  const [incomes, setIncomes] = useState<Income[]>(route.params?.incomes || []);
  const [expenseCategoryBreakdown, setExpenseCategoryBreakdown] = useState<{ [key: string]: number }>({});
  const [incomeCategoryBreakdown, setIncomeCategoryBreakdown] = useState<{ [key: string]: number }>({});
  const [expenseCategoryBudget, setExpenseCategoryBudget] = useState<{ [key: string]: number }>({});
  const [incomeCategoryBudget, setIncomeCategoryBudget] = useState<{ [key: string]: number }>({});

  const incomeCategoryKeys = incomeCategories.map(c => c.value);
  const expenseCategoryKeys = expenseCategories.map(c => c.value);

  useFocusEffect(
    React.useCallback(() => {
      if (!route.params?.expenses) {
        const fetchExpenses = async () => {
          const userId = 'user-id-placeholder';
          try {
            const expensesData = await getExpenses(userId);
            setExpenses(expensesData);
          } catch (error) {
            console.error('Error fetching expenses:', error);
          }
        };
        fetchExpenses();
      }
    }, [route.params?.expenses])
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!route.params?.incomes) {
        const fetchIncomes = async () => {
          const userId = 'user-id-placeholder';
          try {
            const incomesData = await getIncomes(userId);
            setIncomes(incomesData);
          } catch (error) {
            console.error('Error fetching incomes:', error);
          }
        };
        fetchIncomes();
      }
    }, [route.params?.incomes])
  );

  useEffect(() => {
    setExpenseCategoryBudget({
      food: 400,
      snacks: 100,
      groceries: 300,
      fuel: 200,
      transport: 100,
      taxi: 100,
      rent: 1000,
      electricity: 150,
      water: 50,
      internet: 60,
      clothing: 150,
      care: 100,
      health: 200,
      entertainment: 150,
      subscriptions: 50,
      travel: 300,
      gifts: 100,
      other: 100,
    });

    setIncomeCategoryBudget({
      salary: 2000,
      freelance: 1000,
      sales: 500,
      investments: 500,
      support: 300,
      bonus: 200,
    });
  }, []);

  useEffect(() => {
    const breakdown: { [key: string]: number } = {};
    expenses.forEach((expense) => {
      const category = expense.category;
      breakdown[category] = (breakdown[category] || 0) + expense.amount;
    });
    setExpenseCategoryBreakdown(breakdown);
  }, [expenses]);

  useEffect(() => {
    const breakdown: { [key: string]: number } = {};
    incomes.forEach((income) => {
      const category = income.category;
      breakdown[category] = (breakdown[category] || 0) + income.amount;
    });
    setIncomeCategoryBreakdown(breakdown);
  }, [incomes]);

  const totalExpenseBudget = Object.values(expenseCategoryBudget).reduce((acc, budget) => acc + budget, 0);
  const totalIncomeBudget = Object.values(incomeCategoryBudget).reduce((acc, budget) => acc + budget, 0);
  const totalExpense = Object.values(expenseCategoryBreakdown).reduce((acc, expense) => acc + expense, 0);
  const totalIncome = Object.values(incomeCategoryBreakdown).reduce((acc, income) => acc + income, 0);
  const totalRemainingBudget = totalIncome - totalExpense;
  const totalRemainingProgress = totalIncome > 0 ? totalRemainingBudget / totalIncome : 0;

  const renderCategoryItem = (category: string, type: 'expense' | 'income') => {
    const categoryBreakdown = type === 'expense' ? expenseCategoryBreakdown : incomeCategoryBreakdown;
    const categoryBudget = type === 'expense' ? expenseCategoryBudget : incomeCategoryBudget;
    const categoryLabel = (type === 'expense' ? expenseCategories : incomeCategories).find(c => c.value === category)?.label || category;

    const categoryAmount = categoryBreakdown[category] || 0;
    const categoryBudgetValue = categoryBudget[category] || 0;
    const progress = categoryBudgetValue > 0 ? categoryAmount / categoryBudgetValue : 0;

    let progressColor = '#3b82f6';
    if (progress >= 1) {
      progressColor = '#ef4444';
    } else if (progress >= 0.8) {
      progressColor = '#f59e0b';
    }

    const budgetDifference = categoryBudgetValue - categoryAmount;
    const budgetStatus = progress >= 1 ? 'Over budget' : progress >= 0.8 ? 'Close to limit' : 'Under budget';

    return (
      <View style={styles.breakdownItem}>
        <Text style={styles.categoryText}>{categoryLabel}: ${categoryAmount.toFixed(2)}</Text>
        <Text style={styles.budgetLimitText}>Budget: ${categoryBudgetValue.toFixed(2)}</Text>
        <Text style={styles.statusText}>
          {budgetStatus === 'Over budget'
            ? `Over budget by $${Math.abs(budgetDifference).toFixed(2)}`
            : budgetStatus === 'Under budget'
            ? `Under budget by $${Math.abs(budgetDifference).toFixed(2)}`
            : `Close to budget`}
        </Text>
        <ProgressBar progress={progress} color={progressColor} style={styles.progressBar} />
      </View>
    );
  };

  return (
    <FlatList
      data={['Income', 'Expense']}
      renderItem={({ item }) => (
        <View style={styles.container}>
          {item === 'Income' ? (
            <>
              <Text style={styles.title}>Analytics: Income & Expenses</Text>
              <View style={styles.totalSummary}>
                <Text style={styles.totalText}>Total Income: ${totalIncome.toFixed(2)}</Text>
                <Text style={styles.totalText}>Total Expenses: ${totalExpense.toFixed(2)}</Text>
                <Text style={styles.totalProgressText}>Remaining Budget: ${totalRemainingBudget.toFixed(2)}</Text>
                <ProgressBar
                  progress={totalRemainingProgress}
                  color={totalRemainingBudget >= 0 ? '#3b82f6' : '#ef4444'}
                  style={styles.progressBar}
                />
              </View>
              <Text style={styles.subTitle}>ΕΣΟΔΑ:</Text>
              <FlatList
                data={incomeCategoryKeys}
                renderItem={({ item }) => renderCategoryItem(item, 'income')}
                keyExtractor={(item) => item}
              />
            </>
          ) : (
            <>
              <Text style={styles.subTitle}>ΕΞΟΔΑ:</Text>
              <FlatList
                data={expenseCategoryKeys}
                renderItem={({ item }) => renderCategoryItem(item, 'expense')}
                keyExtractor={(item) => item}
              />
            </>
          )}
        </View>
      )}
      keyExtractor={(item) => item}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 22,
    marginBottom: 15,
    color: '#555',
  },
  totalSummary: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 25,
  },
  totalText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  totalProgressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  breakdownItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  categoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  budgetLimitText: {
    fontSize: 16,
    marginTop: 5,
    color: '#888',
  },
  statusText: {
    fontSize: 16,
    marginTop: 5,
    color: '#888',
  },
  progressBar: {
    height: 12,
    marginTop: 8,
    borderRadius: 5,
  },
});

export default AnalyticsScreen;
