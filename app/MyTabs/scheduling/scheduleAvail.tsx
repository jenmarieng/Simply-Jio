import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { saveAvailability, getUserAvailability } from '../../../components/eventService';
import { subWeeks, addWeeks, format, startOfWeek, addDays, set } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { onSnapshot, collection, addDoc } from 'firebase/firestore';
import { db, firebaseAuth } from '../../../FirebaseConfig';
import { getEventData } from '../../../components/eventService';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type RootStackParamList = {
  ScheduleAvailability: { eventId: string };
};

type ScheduleAvailabilityScreenRouteProp = RouteProp<RootStackParamList, 'ScheduleAvailability'>;

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 7; i <= 23; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
    slots.push(`${i.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const Stack = createNativeStackNavigator();

interface EventDetails {
  JioName: string;
  location: string;
  startTime: string;
  endTime: string;
  multiDay: string[];
  id: string;
  color: string,
}

interface Events {
  [date: string]: EventDetails[];
}

const ScheduleAvailabilityScreen = () => {
  const route = useRoute<ScheduleAvailabilityScreenRouteProp>();
  const { eventId } = route.params;
  const user = firebaseAuth.currentUser;
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<{ [key: string]: string[] }>({});
  const [availabilityData, setAvailabilityData] = useState<{ [key: string]: { [key: string]: string[] } } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [eventName, setEventName] = useState('');
  const navigation = useNavigation() as any;
  const [participants, setParticipants] = useState<{ userId: string, userName: string }[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<string[]>([]);
  const [unavailableParticipants, setUnavailableParticipants] = useState<string[]>([]);
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'events', eventId, 'userAvailabilities'),
      (snapshot) => {
        const data: { [key: string]: { [key: string]: string[] } } = {};
        snapshot.forEach((doc) => {
          const { date, timeSlots, userName } = doc.data();
          if (!data[date]) {
            data[date] = {};
          }
          timeSlots.forEach((timeSlot: string) => {
            if (!data[date][timeSlot]) {
              data[date][timeSlot] = [];
            }
            data[date][timeSlot].push(userName);
          });
        });
        setAvailabilityData(data);
      }
    );
    return unsubscribe;
  }, [eventId]);

  useEffect(() => {
    const fetchEventData = async () => {
      const eventData = await getEventData(eventId);
      setEventName(eventData.name);
      setParticipants(eventData.participants);
      setParticipantNames(eventData.participants.map((p: { userName: string }) => p.userName));
    };
    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const fetchUserAvailability = async () => {
      if (user) {
        const userAvailability = await getUserAvailability(eventId, user.uid);
        setSelectedTimeSlots(userAvailability);
      }
    };
    fetchUserAvailability();
  }, [eventId, user]);

  const handleTimeSlotSelect = (date: string, timeSlot: string) => {
    setSelectedTimeSlots((prev) => {
      const dateSlots = prev[date] || [];
      if (dateSlots.includes(timeSlot)) {
        return { ...prev, [date]: dateSlots.filter((slot) => slot !== timeSlot) };
      } else {
        return { ...prev, [date]: [...dateSlots, timeSlot] };
      }
    });
  };

  const handleSaveAvailability = async () => {
    if (user) {
      for (const [date, timeSlots] of Object.entries(selectedTimeSlots)) {
        await saveAvailability(eventId, {
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          date,
          timeSlots,
        });
      }
      alert('Availability saved!');
      navigation.navigate('AvailScheduleScreen');
    }
  };

  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setCurrentWeek(selectedDate);
    }
  };

  const startDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const timeSlots = generateTimeSlots();

  const renderTableHeader = () => {
    return (
      <View style={styles.tableRow}>
        <View style={styles.timeColumn}>
        </View>
        {[...Array(7)].map((_, i) => {
          const date = addDays(startDate, i);
          return (
            <View key={i} style={styles.tableCell}>
              <Text style={{ textAlign: 'center' }}>{format(date, "EEE '\n' dd MMM")}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderTimeSlotRow = (time: string) => {
    return (
      <View key={time} style={styles.tableRow}>
        <View style={styles.timeColumn}>
          <Text>{time}</Text>
        </View>
        {[...Array(7)].map((_, i) => {
          const date = format(addDays(startDate, i), 'yyyy-MM-dd');
          return (
            <TouchableOpacity
              key={`${date}-${time}`}
              style={[
                styles.tableCell,
                selectedTimeSlots[date]?.includes(time) && styles.selectedTimeSlot,
              ]}
              onPress={() => handleTimeSlotSelect(date, time)}
            >
              <Text>{selectedTimeSlots[date]?.includes(time)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const calculateColorIntensity = (availableCount: number) => {
    const totalParticipants = participants.length;
    const intensity = Math.floor((availableCount / totalParticipants) * 255);
    return `rgba(230, 162, 153, ${intensity / 255})`;
  };

  const handleTimeSlotSelectForDetails = (date: string, timeSlot: string) => {
    const users = availabilityData?.[date]?.[timeSlot] || [];
    setAvailableParticipants(users);
    setUnavailableParticipants(participants.filter(p => !users.includes(p.userName)).map(p => p.userName));
    setSelectedDate(date);
    setSelectedTime(timeSlot);
  };

  const renderGroupAvailabilityRow = (time: string) => {
    return (
      <View key={time} style={styles.tableRow}>
        <View style={styles.timeColumn}>
          <Text>{time}</Text>
        </View>
        {[...Array(7)].map((_, i) => {
          const date = format(addDays(startDate, i), 'yyyy-MM-dd');
          const users = availabilityData?.[date]?.[time] || [];
          const fraction = `${users.length}/${participants.length}`;
          const backgroundColor = calculateColorIntensity(users.length);
          return (
            <TouchableOpacity
              key={`${date}-${time}`}
              style={[styles.tableCell, { backgroundColor }]}
              onPress={() => handleTimeSlotSelectForDetails(date, time)}
            >
              {users.length > 0 ?
                <Text>{fraction}</Text>
                : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(eventId);
    alert('Copied to clipboard!');
  };

  const AvailScheduleScreen = () => {
    const [multiDay, setMultiDay] = useState<string[]>([]);
    const [selectedJioName, setSelectedJioName] = useState('');
    const [selectedJioLocation, setSelectedJioLocation] = useState('');
    const [selectedJioDate, setSelectedJioDate] = useState(new Date());
    const [selectedJioStartTime, setSelectedJioStartTime] = useState(new Date());
    const [selectedJioEndTime, setSelectedJioEndTime] = useState(new Date());
    const [showJioDatePicker, setShowJioDatePicker] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const confirmSlots = async () => {
      setIsModalVisible(true);
    };
    
    const saveEventSlot = async () => {
      if (!selectedJioDate || !selectedJioStartTime || !selectedJioEndTime || !selectedJioName) {
        alert('Please fill in all fields');
        return;
      }
  
      const eventDetails: EventDetails = {
        JioName: selectedJioName,
        id: `${selectedJioName}-${Date.now()}`,
        location: selectedJioLocation,
        multiDay: multiDay.length > 0 ? multiDay : [format(selectedJioDate, 'yyyy-MM-dd')],
        startTime: format(selectedJioStartTime, 'HH:mm'),
        endTime: format(selectedJioEndTime, 'HH:mm'),
        color: 'peru',
      };
    
      if (!user) {
        alert('User not logged in');
        return;
      }
      
      for (const participant of participants) {
        const userDoc = collection(db, 'users', participant.userId, 'JioEvents');
        for (let date of eventDetails.multiDay) {
          await addDoc(userDoc, { ...eventDetails, date });
        }
      }

      setIsModalVisible(false);
      setSelectedJioName('');
      setSelectedJioDate(new Date());
      setSelectedJioStartTime(new Date());
      setSelectedJioEndTime(new Date());
      alert('Event saved to calendar!');
    };
  
    const handleDateChange = (event: any, date?: Date) => {
      if (date) {
        setSelectedJioDate(date);
        setSelectedJioStartTime(set(date, { hours: selectedJioStartTime.getHours(), minutes: selectedJioStartTime.getMinutes() }));
        setSelectedJioEndTime(set(date, { hours: selectedJioEndTime.getHours(), minutes: selectedJioEndTime.getMinutes() }));
      }
    };
  
    const handleStartTimeChange = (event: any, time?: Date) => {
      if (time) {
        setSelectedJioStartTime(time);
      }
    };
  
    const handleEndTimeChange = (event: any, time?: Date) => {
      if (time) {
        setSelectedJioEndTime(time);
      }
    };
    
    return (
      <View style={styles.container}>
        <ScrollView style={{ paddingBottom: '10%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.bolded}> JioName: </Text>
            <Text style={styles.heading}>{eventName}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.bolded}> JioID: </Text>
            <Text style={[styles.heading]}>{eventId} </Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Icon name="content-copy" size={16} color="grey" />
                <Text style={{ color: 'grey', fontSize: 16 }}>Copy</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.bolded}>Group Availability</Text>
            <TouchableOpacity style={{ marginLeft: 10, backgroundColor: 'black', padding: 5 }} onPress={confirmSlots}>
              <Text style={{ color: '#f4d0cb' }}>Confirm Slots</Text>
            </TouchableOpacity>
            <Modal
              animationType="slide"
              transparent={true}
              visible={isModalVisible}
              onRequestClose={() => setIsModalVisible(false)}
            >
              <View style={styles.modalContent}>
                <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => {
                    setIsModalVisible(false);
                    setSelectedJioName('');
                    setSelectedJioDate(new Date());
                    setSelectedJioStartTime(new Date());
                    setSelectedJioEndTime(new Date());
                  }}>
                  <Icon name="close-outline" size={26} color="grey" />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  placeholder="Confirmed Jio Name"
                  value={selectedJioName}
                  onChangeText={setSelectedJioName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  value={selectedJioLocation}
                  onChangeText={setSelectedJioLocation}
                />
                  <View style={styles.dateTimePickerContainer}>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowJioDatePicker(true)}>
              <Text>{`Jio Date: ${format(selectedJioDate, 'dd-MM-yyyy')}`}</Text>
            </TouchableOpacity>
            {showJioDatePicker && (
              <DateTimePicker
                value={selectedJioDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowJioDatePicker(false);
                  handleDateChange(event, date);
                }}
              />
            )}
          </View>
          <View style={styles.dateTimePickerContainer}>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowStartPicker(true)}>
              <Text>{`Jio Start Time: ${format(selectedJioStartTime, 'HH:mm')}`}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={selectedJioStartTime}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  setShowStartPicker(false);
                  handleStartTimeChange(event, time);
                }}
              />
            )}
          </View>
          <View style={styles.dateTimePickerContainer}>
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowEndPicker(true)}>
              <Text>{`Jio End Time: ${format(selectedJioEndTime, 'HH:mm')}`}</Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={selectedJioEndTime}
                mode="time"
                display="default"
                onChange={(event, time) => {
                  setShowEndPicker(false);
                  handleEndTimeChange(event, time);
                }}
              />
            )}
          </View>
                <TouchableOpacity
                  onPress={saveEventSlot}
                  style={{ backgroundColor: 'powderblue', alignSelf: 'center', padding: 10 }}
                >
                  <Text>Save Event</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
          {(selectedDate && selectedTime) ?
            <>
              <Text>Available: {availableParticipants.join(', ')}</Text>
              <Text>Unavailable: {unavailableParticipants.join(', ')}</Text>
              <Text>Date: {selectedDate} || Time: {selectedTime}</Text>
            </>
            :
            <Text>Participants: {participantNames.join(', ')}</Text>
          }
        </ScrollView>
        <View style={styles.navigation}>
          <Button color='#e6a299' title="<< WEEK" onPress={() => setCurrentWeek(subWeeks(currentWeek, 1))} />
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text>{format(startDate, 'MMMM yyyy')}</Text>
          </TouchableOpacity>
          <Button color='#e6a299' title="WEEK >>" onPress={() => setCurrentWeek(addWeeks(currentWeek, 1))} />
        </View>
        <ScrollView horizontal>
          <View>
            {renderTableHeader()}
            <ScrollView>
              {timeSlots.map(renderGroupAvailabilityRow)}
            </ScrollView>
          </View>
        </ScrollView>

        {showDatePicker && (
          <DateTimePicker
            value={currentWeek}
            mode="date"
            display="default"
            onChange={handleDatePickerChange}
          />
        )}
        <Button color="#e6a299" title="Edit Availability" onPress={() => navigation.navigate('EditAvailScreen', { eventId })} />
      </View>
    );
  };

  const EditAvailScreen = () => {
    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={styles.bolded}> JioName: </Text>
          <Text style={styles.heading}>{eventName}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={styles.bolded}> JioID: </Text>
          <Text style={[styles.heading]}>{eventId} </Text>
          <TouchableOpacity onPress={copyToClipboard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Icon name="content-copy" size={14} color="grey" />
              <Text style={{ color: 'grey', fontSize: 14 }}>Copy</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.bolded}>Your Availability</Text>
        <View style={styles.navigation}>
          <Button color='#e6a299' title="<< WEEK" onPress={() => setCurrentWeek(subWeeks(currentWeek, 1))} />
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text>{format(startDate, 'MMMM yyyy')}</Text>
          </TouchableOpacity>
          <Button color='#e6a299' title="WEEK >>" onPress={() => setCurrentWeek(addWeeks(currentWeek, 1))} />
        </View>
        <ScrollView horizontal>
          <View>
            {renderTableHeader()}
            <ScrollView>
              {timeSlots.map(renderTimeSlotRow)}
            </ScrollView>
          </View>
        </ScrollView>
        <Button color='#e6a299' title="Save Availability" onPress={handleSaveAvailability} />

        {showDatePicker && (
          <DateTimePicker
            value={currentWeek}
            mode="date"
            display="default"
            onChange={handleDatePickerChange}
          />
        )}
      </View>
    );
  };

  return (
    <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: 'powderblue' } }}>
      <Stack.Screen name="AvailScheduleScreen" component={AvailScheduleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditAvailScreen" component={EditAvailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  heading: {
    fontSize: 16,
    textAlign: 'center',
  },
  bolded: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    borderWidth: 1,
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeColumn: {
    borderWidth: 1,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#e6a299',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateTimePickerContainer: {
    marginBottom: 16,
  },
  datePickerButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
  },
});

export default ScheduleAvailabilityScreen;