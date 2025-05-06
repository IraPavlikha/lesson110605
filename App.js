import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Button,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';

// 1. ВІДКРИТТЯ БАЗИ
const db = SQLite.openDatabase('users.db');

// 2. СТВОРЕННЯ ТАБЛИЦІ
const createTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phone TEXT,
        email TEXT NOT NULL,
        avatar TEXT
      );`
    );
  });
};

export default function App() {
  const [users, setUsers] = useState([]);
  const [screen, setScreen] = useState('list'); // list | form
  const [editingUser, setEditingUser] = useState(null);

  // ФОРМА
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    createTable();
    loadUsers();
    ImagePicker.requestMediaLibraryPermissionsAsync();
  }, []);

  const loadUsers = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM users;', [], (_, { rows }) => {
        setUsers(rows._array);
      });
    });
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setAvatar(null);
    setEditingUser(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const saveUser = () => {
    if (!firstName || !lastName || !email) {
      Alert.alert('Помилка', 'Заповніть обов’язкові поля!');
      return;
    }

    db.transaction(tx => {
      if (editingUser) {
        tx.executeSql(
          'UPDATE users SET firstName=?, lastName=?, phone=?, email=?, avatar=? WHERE id=?',
          [firstName, lastName, phone, email, avatar, editingUser.id],
          () => {
            loadUsers();
            resetForm();
            setScreen('list');
          }
        );
      } else {
        tx.executeSql(
          'INSERT INTO users (firstName, lastName, phone, email, avatar) VALUES (?, ?, ?, ?, ?)',
          [firstName, lastName, phone, email, avatar],
          () => {
            loadUsers();
            resetForm();
            setScreen('list');
          }
        );
      }
    });
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Підтвердження',
      'Ви точно хочете видалити користувача?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql('DELETE FROM users WHERE id = ?', [id], () => loadUsers());
            });
          },
        },
      ]
    );
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setEmail(user.email);
    setAvatar(user.avatar);
    setScreen('form');
  };

  if (screen === 'form') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>{editingUser ? 'Редагувати' : 'Новий користувач'}</Text>

        <TouchableOpacity onPress={pickImage}>
          <Image
            source={avatar ? { uri: avatar } : require('./assets/avatar-placeholder.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <TextInput
          placeholder="Ім’я"
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          placeholder="Прізвище"
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          placeholder="Телефон"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Button title="Зберегти" onPress={saveUser} />
        <View style={{ height: 8 }} />
        <Button title="Скасувати" onPress={() => { resetForm(); setScreen('list'); }} />
      </View>
    );
  }

  // Список користувачів
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Список користувачів</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={item.avatar ? { uri: item.avatar } : require('./assets/avatar-placeholder.png')}
              style={styles.avatarSmall}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <TouchableOpacity onPress={() => startEdit(item)} style={styles.buttonGreen}>
              <Text style={styles.buttonText}>Ред.</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.buttonRed}>
              <Text style={styles.buttonText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity onPress={() => setScreen('form')} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Додати користувача</Text>
      </TouchableOpacity>
    </View>
  );
}

// --- СТИЛІ ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  email: { fontSize: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarSmall: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  addButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: 'white', fontSize: 16 },
  buttonGreen: {
    backgroundColor: '#4CAF50',
    padding: 6,
    marginLeft: 4,
    borderRadius: 4,
  },
  buttonRed: {
    backgroundColor: '#F44336',
    padding: 6,
    marginLeft: 4,
    borderRadius: 4,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
