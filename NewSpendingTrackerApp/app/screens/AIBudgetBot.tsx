// components/AIBudgetBot.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList, StyleSheet
} from 'react-native';

// Replace with your actual backend server URL and port
const BACKEND_URL = 'http://192.168.1.241:5000/api/dialogflow/send-message';


const AIBudgetBot = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const sendMessageToBackend = async (text: string): Promise<string> => {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (data.fulfillmentText && data.fulfillmentText.trim() !== '') {
        return data.fulfillmentText;
      } else {
        // Return a friendly fallback message instead of throwing an error
        return 'Δεν κατάλαβα, μπορείς να το πεις αλλιώς;';
      }
    } catch (error: any) {
      console.error('Σφάλμα backend:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    const userMessage = userInput.trim();
    if (!userMessage) return;

    setUserInput('');
    setChatHistory((prev) => [...prev, { type: 'user', message: userMessage }]);

    try {
      const botReply = await sendMessageToBackend(userMessage);
      setChatHistory((prev) => [...prev, { type: 'bot', message: botReply }]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { type: 'bot', message: 'Σφάλμα σύνδεσης με τον διακομιστή.' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Budget Bot</Text>
      <FlatList
        data={chatHistory}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.type === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Πες μου κάτι..."
        value={userInput}
        onChangeText={setUserInput}
      />
      <Button title="Αποστολή" onPress={sendMessage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  message: { padding: 10, marginBottom: 8, borderRadius: 8 },
  userMessage: { backgroundColor: '#007bff', alignSelf: 'flex-end' },
  botMessage: { backgroundColor: '#e6f9e6', alignSelf: 'flex-start' },
  messageText: { color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});

export default AIBudgetBot;