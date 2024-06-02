import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

function App() {
  const [selected, setSelected] = useState('');  
  const uniFriends = {key: 'uniFriends', color: 'red', selectedDotColor: '#ffc0cb'};
  const polyFriends = {key: 'polyFriends', color: '#d2bd0a', selectedDotColor: '#ffc0cb'};
  const holidayFriends = {key: 'holidayFriends', color: 'green', selectedDotColor: '#ffc0cb'};

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
      hideExtraDays={true}
      enableSwipeMonths={true}
      current="2024-06-01"

      style={{
        borderRadius: 5,
        elevation: 5,
        borderWidth: 4,
        borderColor: 'rgba(100, 100, 0, 0.3)',
        height: 380,
        width: 350
      }}
      theme={{
        calendarBackground: '#fff',
        dayTextColor: '#000',
        textDisabledColor: '#444',
        monthTextColor: '#888'
      }}
    
      onDayPress={day => {
        setSelected(day.dateString);
      }}
      
      markingType={'multi-dot'}
      markedDates={{
        '2024-06-18': {dots: [uniFriends], disabled: true},
        '2024-06-25': {dots: [uniFriends, polyFriends, holidayFriends], disabled: true},
        '2024-06-26': {dots: [polyFriends, holidayFriends], disabled: true},
        [selected]: {selected: true, disableTouchEvent: true, selectedColor: '#ffc0cb'}
      }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
});

export default App;
