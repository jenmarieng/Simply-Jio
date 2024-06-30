import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import activity from "../MyTabs/activity";
import food from "../MyTabs/food";
import home from "../MyTabs/home";
import scheduling from "../MyTabs/scheduling/_layout";
import chats from "../MyTabs/chats/_layout";
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function TabNav() {

  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="WhenToJio?" component={scheduling} options={{
        headerShown: false, tabBarIcon: () => (
          <Icon name='calendar' size={20} />
        )
      }} />
      <Tab.Screen name="Chats" component={chats} options={{ headerShown: false, tabBarIcon: () => (
          <Icon3 name='chatbubbles' size={20} />
        ) }} />
      <Tab.Screen name="Home" component={home} options={{ headerShown: false, tabBarIcon: () => (
          <Icon name='home' size={20} />
        ) }}/>
      <Tab.Screen name="ActivityJio" component={activity} options={{ headerShown: false, tabBarIcon: () => (
          <Icon name='group' size={20} />
        ) }} />
      <Tab.Screen name="FoodJio" component={food} options={{ headerShown: false, tabBarIcon: () => (
          <Icon2 name='food' size={20} />
        ) }} />
    </Tab.Navigator>
  );
}