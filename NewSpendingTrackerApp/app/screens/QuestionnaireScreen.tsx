import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const questions = [
  {
    id: 1,
    question: 'Ποιος είναι ο βασικός σου στόχος;',
    options: ['Να εξοικονομήσω χρήματα', 'Να οργανώσω τα οικονομικά μου', 'Να παρακολουθώ τα έξοδά μου', 'Να επενδύσω σωστά'],
  },
  {
    id: 2,
    question: 'Τι τύπος καταναλωτή είσαι;',
    options: ['Κάνω αυθόρμητες αγορές', 'Προγραμματίζω τα έξοδά μου', 'Έχω σταθερά πάγια έξοδα'],
  },
];

const QuestionnaireScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleSelectOption = async (option) => {
    const updatedAnswers = { ...answers, [questions[currentStep].id]: option };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await AsyncStorage.setItem('userAnswers', JSON.stringify(updatedAnswers));

      // Reset the navigation stack and navigate to the bottom tabs navigator (AppTabs or your main screen)
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabs' }], // Ensure this is the correct name for your tab navigator screen
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{questions[currentStep].question}</Text>
      {questions[currentStep].options.map((option, index) => (
        <TouchableOpacity key={index} style={styles.option} onPress={() => handleSelectOption(option)}>
          <Ionicons name="checkmark-circle-outline" size={24} color="black" />
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  question: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginVertical: 8, width: '100%' },
  optionText: { fontSize: 16, marginLeft: 10 },
});

export default QuestionnaireScreen;
