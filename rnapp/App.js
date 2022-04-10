import React, { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, SafeAreaView, Dimensions, Image } from 'react-native';
import Constants from 'expo-constants';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Main from "./src/Main";
import Select from "./src/Select";
import Praha from "./src/Praha";

export const SCREEN_MAIN = "Home";
export const SCREEN_SELECT = "Select a Line";
export const SCREEN_PRAHA = "Tracking PID";

const Tab = createBottomTabNavigator();


export default function App() {
  return (
 <NavigationContainer>
  <Tab.Navigator screenOptions={({route}) => ({
    tabBarIcon: ({color, size}) => {
      let iconName;
      switch (route.name) {
        case SCREEN_MAIN : iconName = "map-outline"; break;
        case SCREEN_SELECT : iconName = "bus"; break;
        case SCREEN_PRAHA : iconName = "location-outline"; break;
        default: iconName = "information";
      }
      return <Ionicons name={iconName} size={size} color={color} />;
    },
  })}>
    <Tab.Screen name={SCREEN_MAIN} component={Main} options={{title: "Mapa"}} />
    <Tab.Screen name={SCREEN_SELECT} component={Select} options={{title: "Vyber linku"}} />
    <Tab.Screen name={SCREEN_PRAHA} component={Praha} options={{title: "PID registrovaná vozidla"}} />

  </Tab.Navigator> 
 </NavigationContainer> 
 );
}