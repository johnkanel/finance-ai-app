import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getExpenses } from '../services/expenseService';
import { getIncomes } from '../services/incomeService';
import Toast from 'react-native-toast-message';

const AdviceScreen: React.FC = () => {
  const [advice, setAdvice] = useState<string[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const userId = 'user-id-placeholder'; // Replace with actual user ID
        const expenses = await getExpenses(userId);
        const incomes = await getIncomes(userId);

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
        const balance = totalIncome - totalExpenses;

        triggerSmartAlerts(totalIncome, totalExpenses, expenses);
        generateAdvice(totalIncome, expenses, incomes);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchFinancialData();
  }, []);

  const fetchMLForecast = async (expenses: any[]) => {
    const sorted = expenses
      .filter(e => e.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (sorted.length < 3) return null;

    const baseDate = new Date(sorted[0].date).getTime();
    const days = sorted.map(e => Math.floor((new Date(e.date).getTime() - baseDate) / (1000 * 3600 * 24)));
    const amounts = sorted.map(e => e.amount);

    try {
      const response = await fetch('http://192.168.1.241:5000/api/ml/predict-expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, amounts }),
      });

      const json = await response.json();
      console.log('📡 API raw response:', json);
      return json.forecast;
    } catch (err) {
      console.error('❌ ML forecast error:', err);
      return null;
    }
  };

  const triggerSmartAlerts = (income: number, expensesTotal: number, expenses: any[]) => {
    if (expensesTotal > income * 0.9) {
      Toast.show({
        type: 'error',
        text1: '⚠️ Υπερβολικά Έξοδα!',
        text2: 'Ξόδεψες πάνω από το 90% των εσόδων σου αυτόν τον μήνα.',
      });
    }

    const deliverySpending = expenses
      .filter(e => e.category?.toLowerCase() === 'delivery')
      .reduce((sum, e) => sum + e.amount, 0);

    if (deliverySpending > 100) {
      Toast.show({
        type: 'info',
        text1: '🍔 Υψηλό Delivery',
        text2: `Ξόδεψες πάνω από €100 σε delivery αυτόν τον μήνα.`,
      });
    }
  };

  const generateAdvice = async (income: number, expenses: any[], incomes: any[]) => {
    let tips: string[] = [];

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const balance = totalIncome - totalExpenses;

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === now.getMonth());
    const lastMonthExpenses = expenses.filter(e => new Date(e.date).getMonth() === lastMonth.getMonth());

    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (lastMonthTotal > 0) {
      const diff = thisMonthTotal - lastMonthTotal;
      const percent = ((diff) / lastMonthTotal) * 100;
      if (percent > 0) {
        tips.push(`📈 Τα έξοδά σου αυξήθηκαν κατά ${percent.toFixed(1)}% σε σχέση με τον προηγούμενο μήνα.`);
      } else if (percent < 0) {
        tips.push(`📉 Μπράβο! Μείωσες τα έξοδά σου κατά ${Math.abs(percent).toFixed(1)}% από τον προηγούμενο μήνα.`);
      }
    }

    const categoryTotals: { [key: string]: number } = {};
    thisMonthExpenses.forEach(e => {
      if (e.category) {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      }
    });

    const maxCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (maxCategory) {
      tips.push(`💡 Περισσότερα ξοδεύτηκαν σε κατηγορία: ${maxCategory[0]} (€${maxCategory[1].toFixed(2)}).`);
    }

    if (totalExpenses > totalIncome) {
      tips.push('⚠️ Προσπαθήστε να μειώσετε τα έξοδά σας για να αποφύγετε ελλείμματα.');
    }

    if (balance > 500) {
      tips.push('💡 Εξετάστε το ενδεχόμενο επένδυσης ενός μέρους των αποταμιεύσεών σας.');
    }

    if (totalExpenses > income * 0.8) {
      tips.push('🚨 Τα έξοδά σας ξεπερνούν το 80% των εσόδων σας. Δοκιμάστε να μειώσετε περιττές δαπάνες.');
    }

    const forecast = await fetchMLForecast(expenses);
    console.log('📈 Received forecast from ML API:', forecast);
   if (typeof forecast === 'number' && !isNaN(forecast)) {
  tips.push(`🤖 ML Πρόβλεψη: Εκτιμώμενα έξοδα επόμενου μήνα ~ €${forecast.toFixed(2)}`);
} else {
  console.warn('⚠️ No forecast received or forecast is not a number:', forecast);
}


    if (tips.length === 0) {
      tips.push('🎉 Συγχαρητήρια! Η οικονομική σας κατάσταση φαίνεται ισορροπημένη. Συνεχίστε έτσι!');
    }

    setAdvice(tips);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Συμβουλές Οικονομικής Διαχείρισης</Text>
      <FlatList
        data={advice}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.adviceItem}>
            <Text style={styles.adviceText}>{item}</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.analyticsButton}
        onPress={() => navigation.navigate('Analytics')}
      >
        <Text style={styles.buttonText}>🔍 Προβολή Αναλύσεων</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  adviceItem: { backgroundColor: '#e6f9e6', padding: 10, marginVertical: 5, borderRadius: 8 },
  adviceText: { fontSize: 16 },
  analyticsButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});

export default AdviceScreen;
