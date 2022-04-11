import * as Location from 'expo-location';
import  MapView, { Callout } from 'react-native-maps';
import  { Marker }  from 'react-native-maps';
import { Text, View, StyleSheet, Dimensions, Image, Button, StatusBar, TextInput, Modal, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { bundledAssets } from 'expo-file-system';



export const Praha = props => {
    const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [vehicles, setVehicles] = useState(null);
  const [line, onChangeLine] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  
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
    fetch("https://api.golemio.cz/v2/vehiclepositions?routeShortName=1", {method: "GET", headers: {"x-access-token": golemio_klic}})
    .then(response => response.json())
    .then(data => {
        console.log("Stazeny a dekodovany JSON:");
        setVehicles(data.features);
    });
  
  
}, []);
  const fetchAPI = (text) => {
    if (line == null) {
      fetch("https://api.golemio.cz/v2/vehiclepositions", {method: "GET", headers: {"x-access-token": golemio_klic}})
        .then(response => response.json())
        .then(data => {
            console.log("Stazeny a dekodovany JSON:");
            setVehicles(data.features);
        });
    }
    else {
      fetch("https://api.golemio.cz/v2/vehiclepositions?routeShortName=" + line, {method: "GET", headers: {"x-access-token": golemio_klic}})
      .then(response => response.json())
      .then(data => {
          console.log("Stazeny a dekodovany JSON:");
          setVehicles(data.features);
      });
    }
  };

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
        <TextInput style={styles.input} onChangeText={onChangeLine} value={line} placeholder="Input line number (blank if all (not recommended))"/>
        <Button title="Refresh" onPress={fetchAPI} />
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
          switch (marker.properties.trip.gtfs.route_type) {
            case 0:
              return <Marker 
              key={marker.geometry.coordinates[1] + marker.geometry.coordinates[0] + marker.properties.trip.gtfs.trip_id } 
              coordinate={{latitude: marker.geometry.coordinates[1], longitude: marker.geometry.coordinates[0]}}                                        
              >             
                  <Image source={require("../icon/tram.png")} style={{height: 20, width: 20 }}   />                   
                  <Callout>
                      <View style={{height: 125, width: 200}}>
                      <Modal
                        animationType="slide"
                        transparent={false}
                        visible={modalVisible}
                        onRequestClose={() => {
                          setModalVisible(!modalVisible);
                        }}
                      ><Text style={styles.modalHead}>Info o prostředku</Text>
                      <Text style={styles.modalText}>Číslo vozu: {marker.properties.trip.vehicle_registration_number}</Text>
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                      >
                        <Text style={styles.textStyle}>Hide Modal</Text>
                      </Pressable>
                      </Modal>
                      <Pressable
                        style={[styles.button, styles.buttonOpen]}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={styles.paragraph}>Linka {marker.properties.trip.gtfs.route_short_name}</Text>
                        </Pressable>
                        <Text style={styles.desc}>Druh dopravy: {vozidla_typy[marker.properties.trip.gtfs.route_type].nazev}</Text>
                        <Text style={styles.desc}>Dopravce: {marker.properties.trip.agency_name.scheduled}</Text>
                        <Text style={styles.desc}>Jede do: {marker.properties.trip.gtfs.trip_headsign}</Text>
                        <Text style={styles.desc}>Zpoždění: {Math.floor(marker.properties.last_position.delay.actual / 60)} minutes and {marker.properties.last_position.delay.actual % 60} seconds</Text>
                      </View>
                  </Callout>
                  
                  </Marker>
            case 2:
              return <Marker 
              key={marker.geometry.coordinates[1] + marker.geometry.coordinates[0] + marker.properties.trip.gtfs.trip_id} 
              coordinate={{latitude: marker.geometry.coordinates[1], longitude: marker.geometry.coordinates[0]}}                                        
              >             
                  <Image source={require("../icon/train.png")} style={{height: 20, width: 20 }}   /> 
                  <Callout>
                      <View style={{height: 125, width: 200}}>
                      <Modal
                        animationType="slide"
                        transparent={false}
                        visible={modalVisible}
                        onRequestClose={() => {
                          setModalVisible(!modalVisible);
                        }}
                      ><Text style={styles.modalHead}>Info o prostředku</Text>
                      <Text style={styles.modalText}>Číslo vozu: {marker.properties.trip.vehicle_registration_number}</Text>
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                      >
                        <Text style={styles.textStyle}>Hide Modal</Text>
                      </Pressable>
                      </Modal>
                      <Pressable
                        style={[styles.button, styles.buttonOpen]}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={styles.paragraph}>Linka {marker.properties.trip.gtfs.route_short_name}</Text>
                        </Pressable>
                        <Text style={styles.desc}>Druh dopravy: {vozidla_typy[marker.properties.trip.gtfs.route_type].nazev}</Text>
                        <Text style={styles.desc}>Dopravce: {marker.properties.trip.agency_name.scheduled}</Text>
                        <Text style={styles.desc}>Jede do: {marker.properties.trip.gtfs.trip_headsign}</Text>
                        <Text style={styles.desc}>Zpoždění: {Math.floor(marker.properties.last_position.delay.actual / 60)} minutes and {marker.properties.last_position.delay.actual % 60} seconds</Text>
                      </View>
                  </Callout>
                  
                  </Marker>
            case 3:
              return <Marker 
              key={marker.geometry.coordinates[1] + marker.geometry.coordinates[0] + marker.properties.trip.gtfs.trip_id } 
              coordinate={{latitude: marker.geometry.coordinates[1], longitude: marker.geometry.coordinates[0]}}                                        
              >             
                  <Image source={require("../icon/bus.png")} style={{height: 20, width: 20 }}   /> 
                  <Callout>
                      <View style={{height: 125, width: 200}}>
                      <Modal
                        animationType="slide"
                        transparent={false}
                        visible={modalVisible}
                        onRequestClose={() => {
                          setModalVisible(!modalVisible);
                        }}
                      ><Text style={styles.modalHead}>Info o prostředku</Text>
                      <Text style={styles.modalText}>Číslo vozu: {marker.properties.trip.vehicle_registration_number}</Text>
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                      >
                        <Text style={styles.textStyle}>Hide Modal</Text>
                      </Pressable>
                      </Modal>
                      <Pressable
                        style={[styles.button, styles.buttonOpen]}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={styles.paragraph}>Linka {marker.properties.trip.gtfs.route_short_name}</Text>
                        </Pressable>
                        <Text style={styles.desc}>Druh dopravy: {vozidla_typy[marker.properties.trip.gtfs.route_type].nazev}</Text>
                        <Text style={styles.desc}>Dopravce: {marker.properties.trip.agency_name.scheduled}</Text>
                        <Text style={styles.desc}>Jede do: {marker.properties.trip.gtfs.trip_headsign}</Text>
                        <Text style={styles.desc}>Zpoždění: {Math.floor(marker.properties.last_position.delay.actual / 60)} minutes and {marker.properties.last_position.delay.actual % 60} seconds</Text>
                      </View>
                  </Callout>
                  
                  </Marker>
            case 4:
              return <Marker 
              key={marker.geometry.coordinates[1] + marker.geometry.coordinates[0] + marker.properties.trip.gtfs.trip_id } 
              coordinate={{latitude: marker.geometry.coordinates[1], longitude: marker.geometry.coordinates[0]}}                                        
              >             
                  <Image source={require("../icon/ship.png")} style={{height: 20, width: 20 }}   /> 
                  <Callout>
                      <View style={{height: 125, width: 200}}>
                      <Modal
                        animationType="slide"
                        transparent={false}
                        visible={modalVisible}
                        onRequestClose={() => {
                          setModalVisible(!modalVisible);
                        }}
                      ><Text style={styles.modalHead}>Info o prostředku</Text>
                      <Text style={styles.modalText}>Číslo vozu: {marker.properties.trip.vehicle_registration_number}</Text>
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                      >
                        <Text style={styles.textStyle}>Hide Modal</Text>
                      </Pressable>
                      </Modal>
                      <Pressable
                        style={[styles.button, styles.buttonOpen]}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={styles.paragraph}>Linka {marker.properties.trip.gtfs.route_short_name}</Text>
                        </Pressable>
                        <Text style={styles.desc}>Druh dopravy: {vozidla_typy[marker.properties.trip.gtfs.route_type].nazev}</Text>
                        <Text style={styles.desc}>Dopravce: {marker.properties.trip.agency_name.scheduled}</Text>
                        <Text style={styles.desc}>Jede do: {marker.properties.trip.gtfs.trip_headsign}</Text>
                        <Text style={styles.desc}>Zpoždění: {Math.floor(marker.properties.last_position.delay.actual / 60)} minutes and {marker.properties.last_position.delay.actual % 60} seconds</Text>
                      </View>
                  </Callout>
                  
                  </Marker>
            default:
              return <Marker 
              key={marker.geometry.coordinates[1] + marker.geometry.coordinates[0] + marker.properties.trip.gtfs.trip_id} 
              coordinate={{latitude: marker.geometry.coordinates[1], longitude: marker.geometry.coordinates[0]}}                                        
              >             
                  <Image source={require("../icon/ostatni.png")} style={{height: 20, width: 20 }}   /> 
                  <Callout>
                      <View style={{height: 125, width: 200}}>
                      <Modal
                        animationType="slide"
                        transparent={false}
                        visible={modalVisible}
                        onRequestClose={() => {
                          setModalVisible(!modalVisible);
                        }}
                      ><Text style={styles.modalHead}>Info o prostředku</Text>
                      <Text style={styles.modalText}>Číslo vozu: {marker.properties.trip.vehicle_registration_number}</Text>
                      <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}
                      >
                        <Text style={styles.textStyle}>Hide Modal</Text>
                      </Pressable>
                      </Modal>
                      <Pressable
                        style={[styles.button, styles.buttonOpen]}
                        onPress={() => setModalVisible(true)}
                      >
                        <Text style={styles.paragraph}>Linka {marker.properties.trip.gtfs.route_short_name}</Text>
                        </Pressable>
                        <Text style={styles.desc}>Druh dopravy: {vozidla_typy[marker.properties.trip.gtfs.route_type].nazev}</Text>
                        <Text style={styles.desc}>Dopravce: {marker.properties.trip.agency_name.scheduled}</Text>
                        <Text style={styles.desc}>Jede do: {marker.properties.trip.gtfs.trip_headsign}</Text>
                        <Text style={styles.desc}>Zpoždění: {Math.floor(marker.properties.last_position.delay.actual / 60)} minutes and {marker.properties.last_position.delay.actual % 60} seconds</Text>
                      </View>
                  </Callout>
                  
                  </Marker>
          }
            
        }
              
           )}

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
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    marginTop: 50,
    textAlign: "center"
  },
  modalHead: {
    marginBottom: 15,
    fontSize: 24,
    marginTop: 50,
    textAlign: "center"
  }
});

export default Praha;