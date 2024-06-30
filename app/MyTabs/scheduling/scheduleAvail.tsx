import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { saveAvailability, getUserAvailability } from '../../../components/eventService';
import { subWeeks, addWeeks, format, startOfWeek, addDays, set, getHours, getMinutes } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { onSnapshot, collection, addDoc } from 'firebase/firestore';
import { db, firebaseAuth } from '../../../FirebaseConfig';
import { getEventData } from '../../../components/eventService';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { startGroupFromJio, checkIsChatCreated } from '../../../components/chatService';

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
  const [participants, setParticipants] = useState<{ userId: string, displayName: string }[]>([]);
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
          const { date, timeSlots, displayName } = doc.data();
          if (!data[date]) {
            data[date] = {};
          }
          timeSlots.forEach((timeSlot: string) => {
            if (!data[date][timeSlot]) {
              data[date][timeSlot] = [];
            }
            data[date][timeSlot].push(displayName);
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
      setParticipantNames(eventData.participants.map((p: { displayName: string }) => p.displayName));
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

  const handleSaveAvailability = async () => {
    if (user) {
      for (const [date, timeSlots] of Object.entries(selectedTimeSlots)) {
        await saveAvailability(eventId, {
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
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

  const calculateColorIntensity = (availableCount: number) => {
    const totalParticipants = participants.length;
    const intensity = Math.floor((availableCount / totalParticipants) * 255);
    return `rgba(230, 162, 153, ${intensity / 255})`;
  };

  const handleTimeSlotSelectForDetails = (date: string, timeSlot: string) => {
    const users = availabilityData?.[date]?.[timeSlot] || [];
    setAvailableParticipants(users);
    setUnavailableParticipants(participants.filter(p => !users.includes(p.displayName)).map(p => p.displayName));
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
    const [createdChat, setCreatedChat] = useState(false);
    const [chatId, setChatId] = useState('');
    const navigation = useNavigation() as any;

    const confirmSlots = async () => {
      setIsModalVisible(true);
    };

    const saveEventSlot = async () => {
      if (!selectedJioDate || !selectedJioName) {
        alert('Jio Name cannot be empty.');
        return;
      }
      if (getHours(selectedJioStartTime) == getHours(selectedJioEndTime) && getMinutes(selectedJioStartTime) == getMinutes(selectedJioEndTime)) {
        alert('Start and end time cannot be the same');
        return;
      }
      if (selectedJioEndTime < selectedJioStartTime) {
        alert('End time cannot be before start time');
        return;
      }

      const eventDetails: EventDetails = {
        JioName: eventName + "'s " + selectedJioName,
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
      alert('Jio saved to calendar!');
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

    useEffect(() => {
      checkIsChatCreated(eventId).then((result) => {
        setCreatedChat(result);
      })
    })

    const createGroupChat = async () => {
      const chatGroupId = await startGroupFromJio(eventName, eventId);
      if (chatGroupId) {
        setChatId(chatGroupId);
      }
    };

    return (
      <View style={styles.container}>
        <ScrollView style={{ paddingBottom: '10%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.bolded}> Jio Group: </Text>
            <Text style={styles.heading}>{eventName}</Text>
            {createdChat ?
              <TouchableOpacity style={{ marginLeft: 10, backgroundColor: 'black', padding: 2 }} onPress={() => { navigation.navigate('Chats', { screen: 'ChatGroup', params: { id: chatId } }) }}>
                <Text style={{ color: '#f4d0cb', fontSize: 12, alignSelf: 'center' }}>OPEN CHAT</Text>
              </TouchableOpacity>
              :
              <TouchableOpacity style={{ marginLeft: 10, backgroundColor: 'black', padding: 2 }} onPress={() => createGroupChat()}>
                <Text style={{ color: '#f4d0cb', fontSize: 12, alignSelf: 'center' }}>CREATE CHAT</Text>
              </TouchableOpacity>
            }
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.bolded}> Jio Group ID: </Text>
            <Text style={[styles.heading]}>{eventId} </Text>
            <TouchableOpacity onPress={copyToClipboard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 2 }}>
                <Icon name="content-copy" size={16} color="grey" />
                <Text style={{ color: 'grey', fontSize: 16, alignSelf: 'center' }}>Copy</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={styles.bolded}>Group Availability</Text>
            <TouchableOpacity style={{ marginLeft: 10, backgroundColor: 'black', padding: 4 }} onPress={confirmSlots}>
              <Text style={{ color: '#f4d0cb', fontSize: 12 }}>CONFIRM JIO</Text>
            </TouchableOpacity>
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
        </ScrollView>
        <View style={styles.navigation}>
          <Button color='#e6a299' title="<< WEEK" onPress={() => setCurrentWeek(subWeeks(currentWeek, 1))} />
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={{ alignSelf: 'center' }}>{format(startDate, 'MMMM yyyy')}</Text>
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
        <Pressable style={{ backgroundColor: '#e6a299', padding: 7 }} onPress={() => navigation.navigate('EditAvailScreen', { eventId })}>
          <Text style={styles.availButtonText}>EDIT AVAILABILITY</Text>
        </Pressable>
      </View>
    );
  };

  const EditAvailScreen = () => {
    const [showTimePickerModal, setShowTimePickerModal] = useState(false);
    const [timePickerDate, setTimePickerDate] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleLongPress = (date: string, time: string) => {
      setTimePickerDate(date);
      setShowTimePickerModal(true);
    };

    const confirmTimeRange = () => {
      if (startTime && endTime) {
        const startTimeHours = getHours(startTime);
        const endTimeHours = getHours(endTime);
        const startTimeMinutes = getMinutes(startTime);
        const endTimeMinutes = getMinutes(endTime);
        if (startTimeHours < 7 || startTimeHours > 19 || endTimeHours < 7 || endTimeHours > 19) {
          alert('Error. Only slots from 7am to 11.30pm are available for now');
          return;
        }
        if (startTimeHours == endTimeHours && startTimeMinutes == endTimeMinutes) {
          alert('Error. Start and end time must be different');
          return;
        }
        if (startTimeHours > endTimeHours || startTimeHours === endTimeHours && startTimeMinutes > endTimeMinutes) {
          alert('Error. Start time must be before end time');
          return;
        }
        if (startTimeMinutes % 30 !== 0 || endTimeMinutes % 30 !== 0) {
          alert('Error. Start and end time must be multiples of 30 minutes');
          return;
        }
        let currentTime = new Date(startTime);
        const endTimeDate = new Date(endTime);

        while (currentTime <= endTimeDate) {
          const currentTimeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
          setSelectedTimeSlots((prev) => {
            const dateSlots = prev[timePickerDate] || [];
            if (!dateSlots.includes(currentTimeString)) {
              return {
                ...prev,
                [timePickerDate]: [...dateSlots, currentTimeString],
              };
            }
            return prev;
          });
          currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
        }
      }
      setShowTimePickerModal(false);
    };

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
                onLongPress={() => handleLongPress(date, time)}
              >
                <Text>{selectedTimeSlots[date]?.includes(time)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Text style={styles.bolded}>Your Availability</Text>
          <Text style={styles.heading}> for {eventName}</Text>
        </View>
        <View style={styles.navigation}>
          <Button color='#e6a299' title="<< WEEK" onPress={() => setCurrentWeek(subWeeks(currentWeek, 1))} />
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={{ alignSelf: 'center' }}>{format(startDate, 'MMMM yyyy')}</Text>
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
        <Modal visible={showTimePickerModal} animationType="slide" onRequestClose={() => setShowTimePickerModal(false)}>
          <View style={styles.modalView}>
            <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={() => setShowTimePickerModal(false)}>
              <Icon2 name="close-outline" size={26} color="black" />
            </TouchableOpacity>
            <Text style={{ fontWeight: 'bold' }}>Add your availability on {timePickerDate}</Text>
            <TouchableOpacity style={{ padding: 5 }} onPress={() => setShowStartPicker(true)}>
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
            <TouchableOpacity style={{ padding: 5 }} onPress={() => setShowEndPicker(true)}>
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
            <Pressable style={{ padding: 5, backgroundColor: 'white' }} onPress={confirmTimeRange}>
              <Text style={{ color: '#e6a299', fontWeight: 'bold' }}>ADD TIMESLOTS</Text>
            </Pressable>
          </View>
        </Modal>
        <View style={styles.bottomContainer}>
          <Pressable onPress={() => navigation.replace('AvailScheduleScreen')}>
            <Icon2 name="arrow-back-circle-outline" size={30} color="grey" />
          </Pressable>
          <Pressable style={styles.availButton} onPress={handleSaveAvailability}>
            <Text style={styles.availButtonText}>SAVE AVAILABILITY</Text>
          </Pressable>
        </View>

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
    paddingVertical: 2,
  },
  bolded: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    paddingVertical: 2,
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
  modalView: {
    margin: 20,
    backgroundColor: '#e6a299',
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
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  availButton: {
    backgroundColor: '#e6a299',
    padding: 5,
    width: '91%',
  },
  availButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  dateButton: {
    padding: 4,
    width: 120,
    borderRadius: 5,
    borderWidth: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default ScheduleAvailabilityScreen;