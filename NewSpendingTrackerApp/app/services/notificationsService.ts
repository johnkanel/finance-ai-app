import * as Notifications from 'expo-notifications';

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleBudgetAlert = async (message: string) => {
    console.log('📢 Scheduling notification with message:', message); // 👈 Δες αν εμφανίζεται
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📣 Budget Alert',
        body: message,
      },
      trigger: null,
    });
};
