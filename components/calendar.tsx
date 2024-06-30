import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, Modal, Text, TextInput, Pressable, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { firebaseAuth, db } from '../FirebaseConfig';
import { loadEvents, saveEvent, updateEvent, deleteEvent } from './eventService';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import { collection, onSnapshot, query } from '@firebase/firestore';

interface EventDetails {
  JioName: string;
  location: string;
  startTime: string;
  endTime: string;
  multiDay: string[];
  id: string;
  color: string;
}

interface Events {
  [date: string]: EventDetails[];
}

const colorOptions = ['pink', 'salmon', 'peru', 'hotpink', 'orange', 'gold', 'turquoise', 'limegreen'];

const App = () => {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [eventText, setEventText] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [multiDay, setMultiDay] = useState<string[]>([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  //const [multiDayMode, setMultiDayMode] = useState(false);
  const [events, setEvents] = useState<Events>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState('');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [monthlyEventCount, setMonthlyEventCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  const user = firebaseAuth.currentUser;

  useEffect(() => {
    if (!user) {
      return;
    }
    setLoading(true);
    const eventsCollection = query(collection(db, 'users', user.uid, 'JioEvents'));

    const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
      const loadedEvents: { [key: string]: EventDetails[] } = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.date;
        if (!loadedEvents[date]) {
          loadedEvents[date] = [];
        };
        loadedEvents[date].push({
          JioName: data.JioName,
          location: data.location,
          startTime: data.startTime,
          endTime: data.endTime,
          multiDay: data.multiDay,
          id: doc.id,
          color: data.color
        });
      });
      setEvents(loadedEvents || {});
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const countMonthlyEvents = () => {
      const eventCount = Object.keys(events)
        .filter(date => date.startsWith(currentMonth))
        .reduce((count, date) => count + events[date].length, 0);
      setMonthlyEventCount(eventCount);
    };
    setLoading(false);
    countMonthlyEvents();
  }, [currentMonth, events]);

  const handleDayPress = (day: any) => {
    /*
    if (multiDayMode) {
      handleMultiDaySelection(day);
    } else {*/
    setSelected(day.dateString);
  };

  const handleMonthChange = (month: any) => {
    console.log('handleMonthChange', month);
  };

  /*
  const handleMultiDaySelection = (day: any) => {
    setMultiDay(prevDays => {
      if (prevDays.includes(day.dateString)) {
        return prevDays.filter(d => d !== day.dateString);
      } else {
        return [...prevDays, day.dateString];
      }
    });
  };*/

  const handleSaveEvent = async () => {
    if (!eventText.trim()) {
      Alert.alert('Error', 'Event text cannot be empty.');
      return;
    }

    const eventDetails: EventDetails = {
      JioName: eventText,
      location,
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      multiDay: multiDay.length > 0 ? multiDay : [selected],
      id: isEditing ? editingEventId : `${eventText}-${Date.now()}`,
      color: selectedColor,
    };

    if (isEditing) {
      await updateEvent(editingEventId, eventDetails);
    } else {
      await saveEvent(eventDetails);
    }

    const loadedEvents = await loadEvents();
    console.log('Events: ', loadedEvents);
    setEvents(loadedEvents || {});

    setModalVisible(false);
    setEventText('');
    setLocation('');
    setStartTime(new Date());
    setEndTime(new Date());
    setMultiDay([]);
    //setMultiDayMode(false);
    setIsEditing(false);
    setEditingEventId('');
    setSelectedColor(colorOptions[0]);
  };

  const handleEditEvent = (event: EventDetails, eventId: string) => {
    setEventText(event.JioName);
    setLocation(event.location);
    setStartTime(new Date(`2024-01-01T${event.startTime}:00`));
    setEndTime(new Date(`2024-01-01T${event.endTime}:00`));
    setMultiDay(event.multiDay);
    setIsEditing(true);
    setEditingEventId(eventId);
    setSelectedColor(event.color);
    setModalVisible(true);
  };

  const handleCloseEvent = () => {
    setModalVisible(false);
    setEventText('');
    setLocation('');
    setStartTime(new Date());
    setEndTime(new Date());
    setMultiDay([]);
    setIsEditing(false);
    setEditingEventId('');
    setSelectedColor(colorOptions[0]);
  }

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);

    const loadedEvents = await loadEvents();
    setEvents(loadedEvents || {});
  };

  const renderEventItem = ({ item }: { item: EventDetails }) => (
    <View style={[styles.eventItem, { backgroundColor: item.color }]}>
      <Text>{item.startTime} - {item.endTime}</Text>
      <Text> | {item.JioName}</Text>
      {item.location ? <Text> @ {item.location}</Text> : null}
      <TouchableOpacity style={{ flex: 1, alignSelf: 'flex-end', flexDirection: 'row-reverse' }} onPress={() => handleEditEvent(item, item.id)}>
        <Icon2 name="edit" size={20} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={{ alignContent: 'flex-end', flexDirection: 'row-reverse' }} onPress={() => handleDeleteEvent(item.id)}>
        <Icon2 name="delete" size={20} color="black" />
      </TouchableOpacity>
    </View>
  );

  const markedDates: { [key: string]: any } = {
    ...Object.keys(events || {}).reduce((acc, date) => {
      acc[date] = {
        dots: events[date].map(event => ({ key: event.id, color: event.color, selectedDotColor: event.color })),
        selected: selected === date || multiDay.includes(date),
        selectedColor: selected === date || multiDay.includes(date) ? '#ffc0cb' : undefined,
      };
      return acc;
    }, {} as { [key: string]: any }),
    [selected]: { selected: true, disableTouchEvent: true, selectedColor: '#ffc0cb' }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size='large' color='#0000ff' />
      ) : (
        <>
          <Text style={styles.eventCount}>You have {monthlyEventCount} Jio(s) this month.</Text>
          <View style={{ backgroundColor: 'white' }}>
            <Calendar
              hideExtraDays={true}
              enableSwipeMonths={true}
              current={format(new Date(), 'yyyy-MM-dd')}
              style={{
                borderRadius: 5,
                height: 380,
                width: 350,
                backgroundColor: 'white',
              }}
              theme={{
                calendarBackground: 'white',
                dayTextColor: 'black',
                textDisabledColor: 'black',
                monthTextColor: 'black'
              }}
              onDayPress={handleDayPress}
              onMonthChange={handleMonthChange}
              markingType={'multi-dot'}
              markedDates={markedDates}
            />
          </View>
          {selected &&
            <View style={styles.eventsContainer}>
              <Text style={styles.eventsHeader}>Events on {format(selected, 'dd MMMM')}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Icon name="add-circle-outline" size={28} color="black" />
              </TouchableOpacity>
              <View style={{ maxHeight: '80%' }}>
                <FlatList
                  data={events[selected] || []}
                  renderItem={renderEventItem}
                  keyExtractor={(item) => item.id}
                  ListEmptyComponent={<Text style={{ marginLeft: 20, fontSize: 16 }}> No Events </Text>}
                  contentContainerStyle={{ paddingBottom: '5%' }}
                />
              </View>
            </View>}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalView}>
              <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={handleCloseEvent}>
                <Icon name="close-outline" size={26} color="black" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Event"
                value={eventText}
                onChangeText={setEventText}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={location}
                onChangeText={setLocation}
              />
              <TouchableOpacity style={styles.timePicker} onPress={() => setShowStartPicker(true)}>
                <Text>Start Time: {format(startTime, 'hh:mm a')}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (date) {
                      setStartTime(date);
                    }
                  }}
                />
              )}
              <TouchableOpacity style={styles.timePicker} onPress={() => setShowEndPicker(true)}>
                <Text>End Time: {format(endTime, 'hh:mm a')}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (date) {
                      setEndTime(date);
                    }
                  }}
                />
              )}
              <View style={styles.colorPicker}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[styles.colorOption, { backgroundColor: color, borderWidth: selectedColor === color ? 2 : 0 }]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
              {/*
          <Button
            title={`Multi-Day Mode: ${multiDayMode ? 'On' : 'Off'}`}
            onPress={() => setMultiDayMode(!multiDayMode)}
          />*/}
              <Pressable style={styles.addEventButton} onPress={handleSaveEvent}>
                <Text>{isEditing ? 'Update Event' : 'Add Event'}</Text>
              </Pressable>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blanchedalmond',
    paddingTop: 20,
  },
  eventsContainer: {
    width: '100%',
    paddingTop: 10,
    flex: 1,
  },
  eventsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingLeft: 20,
  },
  eventItem: {
    backgroundColor: '#dcae96',
    padding: 5,
    marginVertical: 5,
    marginHorizontal: 16,
    borderRadius: 5,
    flexDirection: 'row'
  },
  eventText: {
    fontSize: 16,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#dcae96',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 12,
    width: '80%',
    paddingLeft: 8,
  },
  addButton: {
    position: 'absolute',
    right: '5%',
    verticalAlign: 'top',
    paddingTop: 10,
    backgroundColor: 'blanchedalmond',
    borderRadius: 50,
  },
  addEventButton: {
    padding: 5,
    backgroundColor: 'blanchedalmond'
  },
  timePicker: {
    padding: 5,
  },
  eventCount: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center'
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  colorOption: {
    width: 25,
    height: 25,
    borderRadius: 15,
    margin: 5,
    borderColor: 'black',
  },
});

export default App;