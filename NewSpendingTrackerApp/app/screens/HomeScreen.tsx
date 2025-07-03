import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import { Ionicons } from '@expo/vector-icons';
import TransactionCard from '../components/TransactionCard';
import { getExpenses } from '../services/expenseService';
import { getIncomes } from '../services/incomeService';
import { requestNotificationPermissions, scheduleBudgetAlert } from '../services/notificationsService';

const MONTHLY_BUDGET = 1000;

const HomeScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [userPreferences, setUserPreferences] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const userId = 'user-id-placeholder';
          const expensesData = await getExpenses(userId);
          const incomesData = await getIncomes(userId);

          const formattedTransactions = [
            ...expensesData.map(e => ({ ...e, type: 'expense' })),
            ...incomesData.map(i => ({ ...i, type: 'income' }))
          ].sort((a, b) => new Date(b.date) - new Date(a.date));

          setTransactions(formattedTransactions);
          const incomeTotal = incomesData.reduce((sum, i) => sum + i.amount, 0);
          const expenseTotal = expensesData.reduce((sum, e) => sum + e.amount, 0);
          setTotalIncome(incomeTotal);
          setTotalExpense(expenseTotal);
          setBalance(incomeTotal - expenseTotal);

          const now = new Date();
          const currentMonthExpenses = expensesData.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
          const monthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
          setMonthlyExpense(monthTotal);

          const storedPreferences = await AsyncStorage.getItem('userPreferences');
          if (storedPreferences) {
            const parsed = JSON.parse(storedPreferences);
            setUserPreferences(parsed);
            if (parsed[4]?.includes('ειδοποιείς') && expenseTotal > incomeTotal) {
              const ok = await requestNotificationPermissions();
              if (ok) await scheduleBudgetAlert("Έχεις ξεπεράσει το budget σου!");
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Καλησπέρα 👋</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
          </View>
          <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.cardLabel}>Υπόλοιπο</Text>
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} €</Text>
          <Text style={styles.incomeText}>Έσοδα: {totalIncome.toFixed(2)} €</Text>
          <Text style={styles.expenseText}>Έξοδα: {totalExpense.toFixed(2)} €</Text>
        </View>

        {/* Budget Progress */}
        <View style={styles.budgetSection}>
          <Text style={styles.sectionTitle}>Μηνιαίο Budget</Text>
          <Text>{monthlyExpense.toFixed(2)} € από {MONTHLY_BUDGET} €</Text>
          <Progress.Bar
            progress={Math.min(monthlyExpense / MONTHLY_BUDGET, 1)}
            width={null}
            color={monthlyExpense > MONTHLY_BUDGET ? 'red' : 'green'}
            height={12}
            borderRadius={8}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Tips */}
        {userPreferences && (
          <View style={styles.tipBox}>
            {userPreferences[1] && <Text style={styles.tip}>💡 {userPreferences[1]}</Text>}
            {userPreferences[3] && <Text style={styles.tip}>📈 {userPreferences[3]}</Text>}
            {userPreferences[4] && <Text style={styles.tip}>🚨 {userPreferences[4]}</Text>}
          </View>
        )}

        {/* Transactions */}
        <Text style={styles.sectionTitle}>Πρόσφατες Συναλλαγές</Text>
        {transactions.slice(0, 5).map(tx => (
          <TransactionCard
            key={tx._id}
            description={tx.description}
            amount={tx.amount}
            type={tx.type}
            category={tx.category}
          />
        ))}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: 'green' }]}
            onPress={() => navigation.navigate('AddIncome')}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.btnText}>Έσοδο</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: 'red' }]}
            onPress={() => navigation.navigate('AddExpense')}
          >
            <Ionicons name="remove" size={20} color="white" />
            <Text style={styles.btnText}>Έξοδο</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickNav}>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.link}>📋 Όλες οι Συναλλαγές</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
            <Text style={styles.link}>📊 Αναλύσεις</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Advice')}>
            <Text style={styles.link}>💡 Συμβουλές</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AIBot')}>
            <Text style={styles.link}>🤖 Budget Bot</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f6fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  balanceCard: {
    backgroundColor: '#e0f7fa',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00796b',
  },
  incomeText: {
    fontSize: 14,
    color: 'green',
  },
  expenseText: {
    fontSize: 14,
    color: 'red',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },
  budgetSection: {
    marginBottom: 16,
  },
  tipBox: {
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  tip: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginVertical: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  btnText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  quickNav: {
    gap: 10,
  },
  link: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    textAlign: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
});

export default HomeScreen;