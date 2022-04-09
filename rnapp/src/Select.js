import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, StatusBar, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import * as Location from 'expo-location';
import  MapView from 'react-native-maps';
import  { Marker }  from 'react-native-maps';

export const Select = props => {
    const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    {label: '101', value: '101'},
    {label: '102', value: '102'},
    {label: '103', value: '103'},
  ]);

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const markers = require('../Jablonec nad Nisou.json');
  let filter = markers.filter(e => e.description.includes(value));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLat(location.coords.latitude);
      setLon(location.coords.longitude);
      setLocation(location);
    })();
  }, []);

  let text = 'Waiting for GPS to find you :)';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }


  if (lat != null && lon != null) {
    return (
      <View style={styles.container}>
        <Text>Select a line!</Text>
            <DropDownPicker style={styles.dropdown}
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={setValue}
      setItems={setItems}
    />

         <MapView
         style={styles.map}
      initialRegion={{
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.0466,
        longitudeDelta: 0.0210,
      }}
    >
      <Marker
  coordinate={{ latitude : lat , longitude : lon }}>
    <Image source={require('../circle.png')} style={{height: 20, width: 20 }} />
    </Marker>
    {filter.map((marker) => {
              return <Marker 
              key={marker.id} 
              coordinate={{latitude: marker.lat, longitude: marker.lon}} 
              title={marker.title}
              description={marker.description}
              pinColor={marker.color}    />
           })}

      </MapView>
      </View>
      
    );
  }
  return(
    <View style={styles.container}>
      <Text>{text}</Text>
    </View>
    
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: StatusBar.currentHeight,
      alignItems: 'center',
      padding: 20,
    },
    paragraph: {
      fontSize: 18,
      textAlign: 'center',
    },
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    },
    dropdown: {
        marginBottom: 10,
        marginTop: 10,
    }
  });

export default Select;