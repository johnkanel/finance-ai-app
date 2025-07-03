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
  {
    id: 3,
    question: 'Θέλεις να λαμβάνεις οικονομικές συμβουλές;',
    options: ['Ναι, με βάση τα δεδομένα μου', 'Μόνο γενικές συμβουλές', 'Όχι, θέλω απλά να βλέπω τις συναλλαγές μου'],
  },
  {
    id: 4,
    question: 'Θέλεις να έχεις budget alerts;',
    options: ['Ναι, να με ειδοποιείς αν ξεπερνάω το όριο', 'Ναι, αλλά μόνο μηνιαία', 'Όχι, δε χρειάζομαι ειδοποιήσεις'],
  },
];

const OnboardingSurvey = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleSelectOption = async (option) => {
    const updatedAnswers = { ...answers, [questions[currentStep].id]: option };
    setAnswers(updatedAnswers);
  
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save answers to AsyncStorage and mark onboarding as completed
      await AsyncStorage.setItem('userPreferences', JSON.stringify(updatedAnswers));
      await AsyncStorage.setItem('onboardingCompleted', 'true');
  
      // Log the completion and move to Main screen
      console.log('✅ Onboarding completed! Saving to AsyncStorage and navigating to Main screen.');
  
      // Check if the data was saved correctly
      const completed = await AsyncStorage.getItem('onboardingCompleted');
      console.log('Saved onboarding status:', completed); // Check the value
  
      // Log before navigation
      console.log('🔄 Navigating to the Main screen now...');
      
      // Navigate to the main screen or your primary navigator screen
      // Replace 'AppTabs' with the correct screen name where your bottom tab navigator is
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
 // <-- Replace this with the actual route name for your main app screen
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Ερώτηση {currentStep + 1} / {questions.length}</Text>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  progress: {
    fontSize: 18,
    marginBottom: 10,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
    justifyContent: 'flex-start',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 18,
  },
});

export default OnboardingSurvey;
