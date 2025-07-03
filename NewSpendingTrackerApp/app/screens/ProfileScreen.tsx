import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Button, TextInput } from 'react-native';

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('johndoe@example.com');
  const [profilePicture, setProfilePicture] = useState('https://via.placeholder.com/150');

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const saveProfile = () => {
    setIsEditing(false);
    // You can add logic to save the profile data to a backend or local storage
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Image source={{ uri: profilePicture }} style={styles.profileImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Name:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        ) : (
          <Text style={styles.info}>{name}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        ) : (
          <Text style={styles.info}>{email}</Text>
        )}
      </View>
      {isEditing ? (
        <Button title="Save Profile" onPress={saveProfile} />
      ) : (
        <Button title="Edit Profile" onPress={toggleEditMode} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  info: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    width: 200,
    borderRadius: 5,
  },
});

export default ProfileScreen;
