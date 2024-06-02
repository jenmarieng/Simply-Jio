import React, {useState} from 'react';
import {View, Text, SafeAreaView, StyleSheet, ScrollView} from 'react-native';
import { Agenda } from 'react-native-calendars';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
    container: {
      flex: 1,
    //   justifyContent: 'center'
    },
    item: {
        backgroundColor: '#ffc0cb',
        flex: 1,
        borderRadius: 4,
        padding: 10,
        marginRight: 10,
        marginTop: 25,
        paddingBottom: 10
    },
    itemText: {
        color: '#363737',
        fontSize: 20
    }
  });

const MyAgenda=()=>{

// Specify how each date should be rendered. day can be undefined if the item is not first in that day
const renderEmptyDay = () => {
    return <View />;
  };

 //returns card for empty slots.
  const renderEmptyItem = () => {
    return (
        <Text >
         No slots in the calendar
        </Text>
    );
  };

// Specify how each item should be rendered in the agenda
 const renderItems=(item, isFirst) => {
    return (
    // <View style={{ marginTop: firstItemInDay ? 10 : 0 }}>
    <SafeAreaView>
        <GestureHandlerRootView style = {styles.item}>
            <Text style = {styles.itemText}>{item.name}</Text>
            <Text style = {styles.itemText}>{item.day}</Text>
        </GestureHandlerRootView>
  </SafeAreaView>
    )
  }

return(
<SafeAreaView style = {styles.container}>
<Agenda 
// The list of items that have to be displayed in the Agenda
items={{
  '2024-06-01': [{name: 'sleep therapy', height: 50, day: '2024-06-01'}],
  '2024-06-05': [{name: 'yoga', height: 50, day: '2024-06-05'}],
  '2024-06-15': [{name: 'camping', height: 50, day: '2024-06-15'}],
  '2024-06-18': [{name: 'C birthday', height: 50, day: '2024-06-18'}],
  '2024-06-22': [{name: 'hiking', height: 50, day: '2024-06-22'}],
  '2024-06-23': [{name: 'shopping', height: 50, day: '2024-06-23'}],
  '2024-06-25': [{name: 'J birthday', height: 50, day: '2024-06-25'}],
}}
renderDay={renderEmptyDay}
renderEmptyData={renderEmptyItem}
renderItem={renderItems}
scrollEnabled={true}
selected={new Date().toString()} //Initially selected day
hideKnob={false} // Hide knob button. Default = false
showClosingKnob={true} // When `true` and `hideKnob` prop is `false`, the knob will always be visible and the user will be able to drag the knob up and close the calendar. Default = false
style={{
  borderRadius: 5,
  elevation: 10,
  borderWidth: 4,
  borderColor: 'rgba(100, 100, 0, 0.3)',
  height: 5000, // something is weird over here
  width: 400
}}
theme={{
  backgroundColor: '#ffffff',
  calendarBackground: '#ffffff',
  textSectionTitleColor: '#b6c1cd',
  textSectionTitleDisabledColor: '#d9e1e8',
  selectedDayBackgroundColor: '#00adf5',
  selectedDayTextColor: '#ffffff',
  todayTextColor: '#00adf5',
  dayTextColor: '#2d4150',
  textDisabledColor: '#d9e1e8',
  dotColor: '#00adf5',
  selectedDotColor: '#ffffff',
  arrowColor: 'orange',
  disabledArrowColor: '#d9e1e8',
  monthTextColor: 'blue',
  indicatorColor: 'blue',
  textDayFontFamily: 'monospace',
  textMonthFontFamily: 'monospace',
  textDayHeaderFontFamily: 'monospace',
  textDayFontWeight: '300',
  textMonthFontWeight: 'bold',
  textDayHeaderFontWeight: '300',
  textDayFontSize: 16,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 16
 }}
/>
</SafeAreaView>
);
};

export default MyAgenda;