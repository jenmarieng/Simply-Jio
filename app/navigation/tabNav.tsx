import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import activity from "../MyTabs/activity";
import food from "../MyTabs/food";
import home from "../MyTabs/home";
import scheduling from "../MyTabs/scheduling/scheduling";
import search from "../MyTabs/search";
import Icon from 'react-native-vector-icons/FontAwesome';
import IconType2 from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export default function TabNav() {

  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen name="WhenToJio?" component={scheduling} options={{
        headerShown: false, tabBarIcon: () => (
          <Icon name='calendar' size={20} />
        )
      }} />
      <Tab.Screen name="Search" component={search} options={{ headerShown: false, tabBarIcon: () => (
          <Icon name='search' size={20} />
        ) }} />
      <Tab.Screen name="Home" component={home} options={{ headerShown: false, tabBarIcon: () => (
          <Icon name='home' size={20} />
        ) }}/>
      <Tab.Screen name="ActivityJio" component={activity} options={{ headerShown: false, tabBarIcon: () => (
          <Icon name='group' size={20} />
        ) }} />
      <Tab.Screen name="FoodJio" component={food} options={{ headerShown: false, tabBarIcon: () => (
          <IconType2 name='food' size={20} />
        ) }} />
    </Tab.Navigator>
  );
}