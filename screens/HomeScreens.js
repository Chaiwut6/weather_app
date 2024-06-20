import React, { useCallback, useEffect, useState } from 'react';
import { View, SafeAreaView, TextInput, TouchableOpacity, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CalculatorIcon, CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from 'lodash'
import { fetchLocation, fetchWeatherForecast } from '../api/weather'
import { weatherImages } from '../constants';

export default function HomeScreens() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setlocations] = useState([])
  const [weather, setWeather] = useState([])

  const handleLocation = (loc) => {
    console.log('location: ', loc)
    setlocations([])
    toggleSearch(false)
    fetchWeatherForecast({
      cityName: loc.name, days: '7'
    }).then(data => {
      setWeather(data)
      console.log('got forecase: ', data)
    })
  }


  const handleSearch = async (value) => {
    if (value.length > 2) {
      try {
        const data = await fetchLocation({ cityName: value });
        setlocations(data)
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    }
  };

  useEffect(()=>{
    fetchMyweatherData()
  },[])

  const fetchMyweatherData = async()=>{
    fetchWeatherForecast({
      cityName:'Islamabad',
      days:'7'
    }).then(data=>{
      setWeather(data)
    })
  }

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather


  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        style={styles.backgroundImage}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.searchContainer}>
          <View style={[styles.inputBox, showSearch ? {} : { display: 'none' }]}>
            <TextInput
              onChangeText={handleTextDebounce}
              placeholder='Search city'
              placeholderTextColor='lightgray'
              style={styles.input}
            />
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => toggleSearch(!showSearch)}
          >
            <MagnifyingGlassIcon size={20} color="white" />
          </TouchableOpacity>
        </View>



        <View style={styles.locationText}>
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>
            {location?.name},<Text style={{ fontSize: 18, fontWeight: '600', color: '#9CA3AF' }}>
              {" " + location?.country}
            </Text>
          </Text>

          <View style={styles.Image}>
            <Image source={weatherImages[current?.condition?.text]} style={{ width: 200, height: 200 }} />
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 60, marginLeft: 20 }}>
              {current?.temp_c}&#176;
            </Text>
            <Text style={{ textAlign: 'center', color: 'white', fontSize: 20, marginLeft: 20, letterSpacing: 2, }}>
              {current?.condition?.text}
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16 }}>
            <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
              <Image source={require('../assets/icons/wind.png')} style={{ width: 25, height: 25 }} />
              <Text style={{ color: "white", fontWeight: '600', fontSize: 18, marginLeft: 10 }}>
                {current?.wind_kph} km
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
              <Image source={require('../assets/icons/drop.png')} style={{ width: 25, height: 25 }} />
              <Text style={{ color: "white", fontWeight: '600', fontSize: 18, marginLeft: 10 }}>
                {current?.humidity}%
              </Text>
            </View>
            <View style={{ flexDirection: "row", marginTop: 8, alignItems: "center" }}>
              <Image source={require('../assets/icons/sun.png')} style={{ width: 25, height: 25 }} />
              <Text style={{ color: "white", fontWeight: '600', fontSize: 18, marginLeft: 10 }}>
                {weather?.forecast?.forecastday[0]?.astro?.sunrise}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginBottom: 16, }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 8 }}>
            <CalendarDaysIcon size="22" color="white" />
            <Text style={{ color: 'white', fontSize: 18, marginLeft: 10 }}>Daily forecast</Text>
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={{ paddingHorizontal: 15 }}
            showsHorizontalScrollIndicator={false}
          >
            {
              weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date)
                let options = {weekday:'long'}
                let dayName = date.toLocaleDateString('en-Us',options)
                return (
                  <View key={index} style={{ flex: 1, justifyContent: "center", alignItems: 'center', width: 90, height: 120, borderRadius: 24, paddingVertical: 12, marginBottom: 8, marginTop: 10, marginRight: 10, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <Image source={{uri: 'https:' + current?.condition?.icon}} style={{ height: 50, width: 50 }} />
                    <Text style={{ color: 'white' }}>{dayName}</Text>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>{item?.day?.avgtemp_c}&#176;</Text>
                  </View>
                )
              })
            }

          </ScrollView>
        </View>

        {
          locations.length > 0 && showSearch ? (
            <View style={styles.location}>
              {locations.map((loc, index) => {

                const showBorder = index + 1 !== locations.length;
                const borderClass = showBorder ? styles.locationItemBorder : '';
                return (
                  <TouchableOpacity
                    onPress={() => handleLocation(loc)}
                    key={index}
                    style={[styles.locationItem, borderClass]}
                  >
                    <MapPinIcon size={20} color="gray" />
                    <Text style={{ color: 'black', fontSize: 18, marginLeft: 8 }}>{loc?.name}, {loc?.country}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null
        }

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
    marginTop: 30,
  },
  inputBox: {
    flex: 1,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingLeft: 12,
    alignItems: "center"
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 9999,
    padding: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  location: {
    position: 'absolute',
    width: '95%',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    top: 80,
    marginLeft: 10,
    borderRadius: 30,
    borderBottomColor: '#9CA3AF',


  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 12,
    paddingRight: 1,
    marginBottom: 3,
  },
  locationItemBorder: {
    borderBottomWidth: 2,
    borderBottomColor: '#9CA3AF',
  },
  locationText: {
    marginHorizontal: 16,
    justifyContent: 'space-around',
    flex: 1,
    marginBottom: 8
  },
  Image: {
    flexDirection: "row",
    justifyContent: "center"
  }
});
