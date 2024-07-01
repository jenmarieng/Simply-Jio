import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { googlePlaces_api_key } from '../../apiKeys';

const GOOGLE_PLACES_API_KEY = googlePlaces_api_key;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

const ActivityJio = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [query, setQuery] = useState<string>('');
  const [pageToken, setPageToken] = useState<string | null>(null);

  type PlacesTypes = {
    [key: string]: string[];
  };

  const placesTypes: PlacesTypes = {
    Shopping: ['store', 'clothing_store', 'shoe-store', 'department_store', 'electronics_store', 'shopping_mall', 'furniture-store', 'jewelry_store'],
    Movie: ['movie_theater'],
    Bowling: ['bowling_alley'],
    Attractions: ['tourist_attraction', 'amusement-park', 'zoo', 'museum', 'aquarium', 'art-gallery'],
    Chill: ['museum', 'art_gallery'],
    Beauty: ['spa', 'beauty_salon', 'hair_care'],
    Others: ['park'],
  };

  const fetchPlaces = async (nextPageToken: string | null = null) => {
    try {
      const types = selectedCategories.flatMap(category => placesTypes[category]).join('|');
      const response = await axios.get(BASE_URL, {
        params: {
          query: query || 'point of interest',
          type: types,
          key: GOOGLE_PLACES_API_KEY,
          pagetoken: nextPageToken,
          component: 'country:sg',
        }
      });
      if (nextPageToken) {
        setPlaces(prevPlaces => [...prevPlaces, ...response.data.results]);
      } else {
        setPlaces(response.data.results);
      }
      setPageToken(response.data.next_page_token);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedCategories.length > 0 || query) {
      fetchPlaces();
    } else {
      setPlaces([]);
    }
  }, [selectedCategories, query]);

  const formatPlaceType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isValidPlace = (place: any) => {
    const placeTypes = place.types;
    return selectedCategories.every(category =>
      placesTypes[category].some(type => placeTypes.includes(type))
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select filters or start searching for ActivityJios!</Text>
      <View style={styles.filterContainer}>
        <ScrollView horizontal>
          {Object.keys(placesTypes).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterButton,
                selectedCategories.includes(category) && styles.filterButtonSelected
              ]}
              onPress={() => setSelectedCategories((prev) => {
                if (prev.includes(category)) {
                  return prev.filter((c) => c !== category);
                } else {
                  return [...prev, category];
                }
              })}>
              <Text style={styles.filterButtonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Search"
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={selectedCategories.length > 0 ? places.filter(isValidPlace) : places}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => {
          const placeTypes = item.types.filter((type: string) => selectedCategories.some(category => placesTypes[category].includes(type)));
          return (
            <View style={styles.placeContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.location}>{item.formatted_address}</Text>
              {selectedCategories.length === 0 && <Text style={styles.type}>{item.types.map(formatPlaceType).join(', ')}</Text>}
              {selectedCategories.length > 0 && <Text style={styles.type}>{placeTypes.map(formatPlaceType).join(', ')}</Text>}
            </View>
          );
        }}
      />
      {pageToken && (
        <TouchableOpacity style={styles.loadMoreButton} onPress={() => fetchPlaces(pageToken)}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'pink',
  },
  heading: {
    fontSize: 18,
    marginLeft: 5,
    fontWeight: 'bold',
    color: 'black',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterButton: {
    padding: 8,
    margin: 5,
    backgroundColor: '#cc99a2',
    borderRadius: 5,
  },
  filterButtonSelected: {
    backgroundColor: '#997379',
  },
  filterButtonText: {
    color: 'white',
  },
  input: {
    marginTop: -10,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 5,
    marginBottom: 10,
  },
  placeContainer: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#ffecef',
    borderRadius: 8,
  },
  loadMoreButton: {
    padding: 5,
    backgroundColor: '#cc99a2',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 14,
    color: '#6b6b6b',
  },
  location: {
    fontSize: 14,
  },
});

export default ActivityJio;