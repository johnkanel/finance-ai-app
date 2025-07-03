// components/TransactionCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ή 'react-native-vector-icons/Ionicons' αν δεν έχεις Expo

interface TransactionCardProps {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ description, amount, type, category }) => {
  return (
    <View style={[styles.card, type === 'income' ? styles.income : styles.expense]}>
      <View style={styles.left}>
        <Ionicons
          name={type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'}
          size={24}
          color={type === 'income' ? 'green' : 'red'}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.description}>{description}</Text>
          {category && <Text style={styles.category}>{category}</Text>}
        </View>
      </View>
      <Text style={styles.amount}>
        {type === 'income' ? '+' : '-'}${amount.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 12,
    color: '#888',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  income: {
    borderLeftWidth: 5,
    borderLeftColor: 'green',
  },
  expense: {
    borderLeftWidth: 5,
    borderLeftColor: 'red',
  },
});

export default TransactionCard;
