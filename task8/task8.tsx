import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { createTable, deleteUser, fetchUsers, insertUser, updateUser } from './database';

export default function App() {
  const [screen, setScreen] = useState('list');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const allUsers = await fetchUsers();
    setUsers(allUsers);
  };

  useEffect(() => {
    createTable();
    loadUsers();
  }, []);

  const addUser = async () => {
    if (name.trim()) {
      await insertUser(name, phone);
      setName('');
      setPhone('');
      loadUsers();
    }
  };

  const saveUser = async () => {
    if (editingId && name.trim()) {
      await updateUser(name, phone, editingId);
      setEditingId(null);
      setName('');
      setPhone('');
      setScreen('list');
      loadUsers();
    }
  };

  const deleteUserHandler = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  const renderListScreen = () => (
    <View style={styles.container}>
      <Text style={styles.header}>User List</Text>
      <Button title="Add New User" onPress={() => {
        setName('');
        setPhone('');
        setEditingId(null);
        setScreen('edit');
      }} />

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => {
              setName(item.name);
              setPhone(item.phone);
              setEditingId(item.id);
              setScreen('details');
            }}
          >
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteUserHandler(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderDetailsScreen = () => (
    <View style={styles.container}>
      <Text style={styles.header}>User Details</Text>
      <Text>Name: {name}</Text>
      <Text>Phone: {phone}</Text>

      <View style={styles.buttonGroup}>
        <Button title="Edit" onPress={() => setScreen('edit')} />
        <Button title="Back" onPress={() => setScreen('list')} />
      </View>
    </View>
  );

  const renderEditScreen = () => (
    <View style={styles.container}>
      <Text style={styles.header}>
        {editingId ? 'Edit User' : 'Add New User'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <View style={styles.buttonGroup}>
        {editingId ? (
          <Button title="Save" onPress={saveUser} />
        ) : (
          <Button title="Add" onPress={addUser} />
        )}
        <Button title="Cancel" onPress={() => {
          setEditingId(null);
          setScreen(editingId ? 'details' : 'list');
        }} />
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {screen === 'list' && renderListScreen()}
      {screen === 'details' && renderDetailsScreen()}
      {screen === 'edit' && renderEditScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingTop: 50,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteButton: {
    color: '#FF4D4D',
    fontWeight: 'bold',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
});
