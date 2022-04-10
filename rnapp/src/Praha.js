import * as Location from 'expo-location';
import  MapView, { Callout } from 'react-native-maps';
import  { Marker }  from 'react-native-maps';
import { Text, View, StyleSheet, Dimensions, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { bundledAssets } from 'expo-file-system';



export const Praha = props => {
    const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [vehicles, setVehicles] = useState(null);

  let random = Math.random();

  const golemio_klic = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZvanRhLmRlam5vemthQGdtYWlsLmNvbSIsImlkIjoxMjIxLCJuYW1lIjpudWxsLCJzdXJuYW1lIjpudWxsLCJpYXQiOjE2NDk2MTY4ODMsImV4cCI6MTE2NDk2MTY4ODMsImlzcyI6ImdvbGVtaW8iLCJqdGkiOiJkYmIyNThmZC1jNmQ5LTQxNGUtODliOC1lNDg0MTNjNWE5NTQifQ.hnm9WFrHwudjIjqPO4onAV0p3kBIb4d_vI0PVamucOk";
  let vozidla_typy = {
    "0": {"nazev": "Tramvaj"},
    "1": {"nazev": "Metro"},
    "2": {"nazev": "Vlak"},
    "3": {"nazev": "Autobus"},
    "4": {"nazev": "Loď"},
    "5": {"nazev": "Lanová tramvaj"},
    "6": {"nazev": "Lanovka"},
    "7": {"nazev": "Pozemní lanovka"},
    "11": {"nazev": "Trolejbus"},
    "12": {"nazev": "Jednokolejka"},
};
  useEffect(() => {
    setInterval(() => {
        fetch("https://api.golemio.cz/v2/vehiclepositions", {method: "GET", headers: {"x-access-token": golemio_klic}})
        .then(response => response.json())
        .then(data => {
            console.log("Stazeny a dekodovany JSON:");
            setVehicles(data.features);
        });
    }, 10000);
  
}, []);
//console.log(vehicles)

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      setInterval(async () => {
        let location = await Location.getCurrentPositionAsync();
        setLat(location.coords.latitude);
        setLon(location.coords.longitude);
        setLocation(location);
    }, 5000);
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

    {vehicles.map((marker) => {
        //console.log((vozidla_typy[marker.properties.trip.gtfs.route_type].icon))
        if (marker.properties.trip.vehicle_registration_number == null) {
            return;
        }
        else {
            return <Marker 
              key={marker.properties.trip.vehicle_registration_number} 
              coordinate={{latitude: marker.geometry.coordinates[1], longitude: marker.geometry.coordinates[0]}}                                        
              >
                  <Callout>
                      <View style={{height: 100, width: 200}}>
                        <Text style={styles.paragraph}>Linka {marker.properties.trip.gtfs.route_short_name}</Text>
                        <Text style={styles.desc}>Druh dopravy: {vozidla_typy[marker.properties.trip.gtfs.route_type].nazev}</Text>
                        <Text style={styles.desc}>Dopravce: {marker.properties.trip.agency_name.scheduled}</Text>
                        <Text style={styles.desc}>Jede do: {marker.properties.trip.gtfs.trip_headsign}</Text>
                      </View>
                  </Callout>
                  
                  </Marker>
        }
              
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
    alignItems: 'center',
    justifyContent: 'center',
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
  desc: {
    textAlign: 'center',
    },
});

export default Praha;