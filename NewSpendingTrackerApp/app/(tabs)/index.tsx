import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AddExpenseScreen from '../screens/AddExpensesScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import ExpenseDetailsScreen from '../screens/ExpenseDetailsScreen';
import IncomeScreen from '../screens/IncomeScreen';
import AdviceScreen from '../screens/AdviceScreen'; 
import AIBudgetBot from '../screens/AIBudgetBot';
import AddIncomeScreen from '../screens/AddIncomeScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import OnboardingSurvey from '../screens/OnboardingSurvey';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications'; 
import Toast from 'react-native-toast-message';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
Notifications.addNotificationReceivedListener(notification => {
  console.log('🔔 Notification received (foreground):', notification);
});

// App Bottom Tabs
const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Expenses': iconName = 'list'; break;
            case 'Income': iconName = 'cash'; break;
            case 'Analytics': iconName = 'pie-chart'; break;
            case 'Profile': iconName = 'person'; break;
            case 'Settings': iconName = 'settings'; break;
            default: iconName = 'help-circle';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Income" component={IncomeScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Advice" component={AdviceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="AddIncome" component={AddIncomeScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="AddExpense" component={AddExpenseScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ tabBarButton: () => null }} />
      <Tab.Screen name="ExpenseDetails" component={ExpenseDetailsScreen} options={{ tabBarButton: () => null }} />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        await AsyncStorage.removeItem('onboardingCompleted'); 
        await AsyncStorage.removeItem('userPreferences'); // Reset answers too
        console.log('🚀 Onboarding status reset!'); 
        console.log('⏳ Checking onboarding status...');
        const completed = await AsyncStorage.getItem('onboardingCompleted');
        const userAnswers = await AsyncStorage.getItem('userPreferences');

        console.log('🔍 Retrieved onboarding status:', completed);
        console.log('📊 Retrieved user answers:', userAnswers ? JSON.parse(userAnswers) : 'No answers found');

        const isComplete = completed === 'true';
        setIsOnboardingComplete(isComplete);

        console.log('📌 Final onboarding status:', isComplete ? 'Main' : 'Onboarding');

        if (isComplete) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        }
      } catch (error) {
        console.error('❌ Error retrieving onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
    
  }, []);

  if (isLoading) {
    console.log('⏳ App is still loading AsyncStorage...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isOnboardingComplete ? 'Main' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingSurvey} />
        <Stack.Screen name="Main" component={AppTabs} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
        <Stack.Screen name="AIBot" component={AIBudgetBot} options={{ title: 'AI Budget Bot' }} />
      </Stack.Navigator>
      <Toast />
    </>
  );
  
  
};

export default function App() {
  return (
    <PaperProvider>
      <MainNavigator />
      <Toast />
    </PaperProvider>
  );
}
