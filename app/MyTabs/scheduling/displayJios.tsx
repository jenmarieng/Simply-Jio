import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { createEvent, joinEvent, getUserEvents } from '../../../components/eventService';
import { useNavigation } from '@react-navigation/native';
import { firebaseAuth } from '../../../FirebaseConfig';

const CreateEventScreen = () => {
  const [eventName, setEventName] = useState('');
  const [eventId, setEventId] = useState('');
  const navigation = useNavigation() as any;
  const [events, setEvents] = useState([] as any[]);
  const user = firebaseAuth.currentUser;

  const handleJoinEvent = async () => {
    try {
      await joinEvent(eventId);
      navigation.navigate('AvailabilityScreen', { eventId });
      setEventId('');
    } catch (error) {
      alert('Failed to join event: ' + error);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventName) {
      alert('Please enter an event name');
      return;
    }
    try {
      console.log('Creating event...');
      const id = await createEvent(eventName);
      if (id) {
        setEventId(id);
        alert('Event Created!');
        navigation.navigate('AvailabilityScreen', { eventId: id });
        setEventName('');
      }
    } catch (error) {
      alert('Failed to create event: ' + error);
    }
  };

  useEffect(() => {
    if (!user) {
      console.log('User not logged in');
      return;
    };
    const unsubscribe = getUserEvents(user.uid, (userEvents) => {
      setEvents(userEvents);
    });

    return unsubscribe;
  }, [user]);

  const goToEvent = ({ item }: { item: any }) => (
    <View>
      <TouchableOpacity
        onPress={() => navigation.navigate('AvailabilityScreen', { eventId: item.id })}>
        <Text>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
      />
      <Pressable style={[styles.eventButton, { marginBottom: 10 }]} onPress={handleCreateEvent}>
        <Text style={{ color: 'white' }}>Create a New Jio</Text>
      </Pressable>
      <TextInput
        style={styles.input}
        placeholder="Event ID"
        value={eventId}
        onChangeText={setEventId}
      />
      <Pressable style={styles.eventButton} onPress={handleJoinEvent}>
        <Text style={{ color: 'white' }}>Join a Jio</Text>
      </Pressable>
      <Text style={styles.heading}>Your Jios</Text>
      {events.length === 0 ? (
        <Text>No jios yet... jio someone now!</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={goToEvent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'grey',
    borderWidth: 1,
    width: '90%',
    paddingHorizontal: 10,
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  eventButton: {
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'grey',
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 4,
    width: '90%',
  },
  eventIdContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  eventIdText: {
    fontSize: 16,
  },
  heading: {
    fontSize: 20,
    padding: 15,
    alignSelf: 'center',
  },
});

export default CreateEventScreen;