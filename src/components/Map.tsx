import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  CircularProgress, 
  Alert, 
  Snackbar, 
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Fade
} from '@mui/material';
import { Search } from 'lucide-react';
import { fetchHalalPlaces, geocodePostcode } from '../services/PlacesService';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// Move libraries outside component to prevent recreation
const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
};

const defaultLocations = [
  { name: 'London', coords: { lat: 51.5074, lng: -0.1278 } },
  { name: 'New York', coords: { lat: 40.7128, lng: -74.0060 } },
  { name: 'Tokyo', coords: { lat: 35.6762, lng: 139.6503 } },
  { name: 'Istanbul', coords: { lat: 41.0082, lng: 28.9784 } },
  { name: 'Dubai', coords: { lat: 25.2048, lng: 55.2708 } },
];

function getLocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access was denied. Please enable location services in your browser settings.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable. Please try again or select a location manually.';
    case error.TIMEOUT:
      return 'Location request timed out. Please try again or select a location manually.';
    default:
      return 'Unable to get your location. Please try again or select a location manually.';
  }
}

interface Place {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
  };
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export default function Map() {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [mapMoved, setMapMoved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>();
  const centerChangedRef = useRef(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'rated' | 'nearest'>('all');
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  // Update marker icons
  const { customMarkerIcon, userLocationIcon } = useMemo(() => {
    if (!isLoaded) return { customMarkerIcon: null, userLocationIcon: null };

    const createSvgMarker = (color: string) => {
      // Restaurant icon path (fork and knife)
      const iconPath = "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z";
      
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="${color}" stroke="white" stroke-width="2"/>
          <path transform="translate(8,8) scale(1)" d="${iconPath}" fill="white"/>
        </svg>
      `;

      // Properly encode the SVG
      const encodedSvg = encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');

      return {
        url: `data:image/svg+xml;charset=UTF-8,${encodedSvg}`,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      };
    };

    return {
      customMarkerIcon: createSvgMarker("#4CAF50"), // Green for restaurants
      userLocationIcon: createSvgMarker("#2196F3")  // Blue for user location
    };
  }, [isLoaded]);

  // Add error boundary
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <Box 
        sx={{ 
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Alert severity="error">
          Google Maps API key is missing. Please check your environment variables.
        </Alert>
      </Box>
    );
  }

  if (loadError) {
    console.error('Google Maps load error:', loadError);
    return (
      <Box 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
          p: 3
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          Error loading Google Maps: {loadError.message || 'Unknown error'}
        </Alert>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          This might be due to an invalid API key or network issues. Please check your console for more details.
        </Typography>
      </Box>
    );
  }

  // Add filter functions
  const filterPlaces = useCallback((places: Place[]): Place[] => {
    let filteredPlaces = [...places];

    // Apply active filter
    switch (activeFilter) {
      case 'open':
        filteredPlaces = filteredPlaces.filter(place => place.opening_hours?.open_now);
        break;
      case 'rated':
        filteredPlaces = filteredPlaces
          .filter(place => place.rating !== undefined)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'nearest':
        if (userLocation) {
          filteredPlaces.sort((a, b) => {
            const distA = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(userLocation.lat, userLocation.lng),
              new google.maps.LatLng(a.geometry.location.lat, a.geometry.location.lng)
            );
            const distB = google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(userLocation.lat, userLocation.lng),
              new google.maps.LatLng(b.geometry.location.lat, b.geometry.location.lng)
            );
            return distA - distB;
          });
        }
        break;
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredPlaces = filteredPlaces.filter(place => 
        place.name.toLowerCase().includes(query) ||
        place.vicinity.toLowerCase().includes(query)
      );
    }

    return filteredPlaces;
  }, [activeFilter, userLocation, searchQuery]);

  // Update the fetchNearbyPlaces function
  const fetchNearbyPlaces = useCallback(async (location: { lat: number; lng: number }) => {
    try {
      setSearchLoading(true);
      const center = { lat: location.lat, lng: location.lng };
      const results = await fetchHalalPlaces(center, searchRadius);
      setPlaces(results);
      setMapError(null);
    } catch (error) {
      console.error('Error fetching places:', error);
      setMapError('Failed to fetch nearby restaurants');
    } finally {
      setSearchLoading(false);
    }
  }, [searchRadius]);

  // Add search handler
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMapError(null);
    geocodePostcode(searchQuery.trim())
      .then(([lat, lng]) => {
        const newLocation = { lat, lng };
        setUserLocation(newLocation);
        setMapCenter(newLocation);
        if (mapInstance) {
          mapInstance.panTo(newLocation);
          mapInstance.setZoom(14);
          return fetchNearbyPlaces(newLocation);
        }
      })
      .catch(() => {
        // If geocoding fails, try filtering existing places
        const filtered = filterPlaces(places);
        if (filtered.length === 0) {
          setMapError('No results found. Try a different search term or location.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchQuery, mapInstance, fetchNearbyPlaces, filterPlaces, places]);

  // Get filtered places for rendering
  const filteredPlaces = useMemo(() => filterPlaces(places), [filterPlaces, places]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    
    // If we already have user location, fetch places
    if (userLocation) {
      fetchNearbyPlaces(userLocation);
    }

    // Simplified map movement listener
    map.addListener('dragend', () => {
      const center = map.getCenter();
      if (center) {
        setMapMoved(true);
        setMapCenter({
          lat: center.lat(),
          lng: center.lng()
        });
      }
    });
  }, [userLocation, fetchNearbyPlaces]);

  const onMapUnmount = useCallback(() => {
    if (mapInstance) {
      // Clean up listeners when component unmounts
      google.maps.event.clearListeners(mapInstance, 'idle');
    }
  }, [mapInstance]);

  const getUserLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setLoading(false);
          setShowLocationInput(false);
          // Fetch places immediately when we get the location
          if (mapInstance) {
            fetchNearbyPlaces(location);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Only show location input if we can't get the location
          setShowLocationInput(true);
          setLoading(false);
          setMapError(getLocationErrorMessage(error));
        },
        { 
          enableHighAccuracy: true, 
          timeout: 5000, 
          maximumAge: 0 
        }
      );
    } else {
      setShowLocationInput(true);
      setLoading(false);
      setMapError('Geolocation is not supported by your browser. Please enter your location manually.');
    }
  }, [mapInstance, fetchNearbyPlaces]);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMapError(null);
    try {
      const [lat, lng] = await geocodePostcode(searchQuery.trim());
      const newLocation = { lat, lng };
      setUserLocation(newLocation);
      setMapCenter(newLocation);
      if (mapInstance) {
        mapInstance.panTo(newLocation);
        mapInstance.setZoom(14);
        fetchNearbyPlaces(newLocation);
      }
    } catch (error) {
      setMapError('Could not find this location. Please try a different address.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !loading) {
      handleAddressSearch();
    }
  };

  const handleSearchThisArea = useCallback(() => {
    if (mapCenter) {
      setMapMoved(false);
      fetchNearbyPlaces(mapCenter);
    }
  }, [mapCenter, fetchNearbyPlaces]);

  // Update map center when user location changes
  useEffect(() => {
    if (userLocation && !mapCenter) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  // Add a function to handle returning to user location
  const handleReturnToMyLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          if (mapInstance) {
            mapInstance.panTo(location);
            mapInstance.setZoom(14);
            fetchNearbyPlaces(location);
          }
          setMapMoved(false);
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setMapError(getLocationErrorMessage(error));
          setLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 5000, 
          maximumAge: 0 
        }
      );
    } else {
      setMapError('Geolocation is not supported by your browser.');
    }
  }, [mapInstance, fetchNearbyPlaces]);

  if (!isLoaded) {
    return (
      <Box 
        sx={{ 
          height: '100%',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (loading && !showLocationInput) {
    return (
      <Box 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress />
        <Typography>Getting your location...</Typography>
      </Box>
    );
  }

  if (showLocationInput && !userLocation) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: '#1E2433',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3
        }}
      >
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Please enable location services or click "My Location" to find halal restaurants nearby
        </Typography>

        <Button
          variant="contained"
          onClick={handleReturnToMyLocation}
          startIcon={<span>📍</span>}
          sx={{
            bgcolor: '#4B9EF9',
            color: 'white',
            '&:hover': {
              bgcolor: '#4B9EF9',
              opacity: 0.9
            }
          }}
        >
          My Location
        </Button>

        {mapError && (
          <Alert 
            severity="error" 
            onClose={() => setMapError(null)}
            sx={{ mt: 2, maxWidth: 400 }}
          >
            {mapError}
          </Alert>
        )}
      </Box>
    );
  }

  if (!userLocation || !mapCenter) {
    return null;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#1E2433', // Dark background color
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main content */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        p: 3,
        gap: 3,
        height: '100vh'
      }}>
        {/* Filters Section */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}>
          {/* Filter Buttons */}
          <Box sx={{
            display: 'flex',
            gap: 1
          }}>
            <Button
              variant={activeFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setActiveFilter('all')}
              size="small"
              sx={{ color: activeFilter === 'all' ? 'white' : '#4B9EF9', bgcolor: activeFilter === 'all' ? '#4B9EF9' : 'transparent' }}
            >
              All Locations
            </Button>
            <Button
              variant={activeFilter === 'open' ? 'contained' : 'outlined'}
              onClick={() => setActiveFilter('open')}
              size="small"
              startIcon={<span>🕒</span>}
              sx={{ color: activeFilter === 'open' ? 'white' : '#4B9EF9', bgcolor: activeFilter === 'open' ? '#4B9EF9' : 'transparent' }}
            >
              Open Now
            </Button>
            <Button
              variant={activeFilter === 'rated' ? 'contained' : 'outlined'}
              onClick={() => setActiveFilter('rated')}
              size="small"
              startIcon={<span>⭐</span>}
              sx={{ color: activeFilter === 'rated' ? 'white' : '#4B9EF9', bgcolor: activeFilter === 'rated' ? '#4B9EF9' : 'transparent' }}
            >
              Top Rated
            </Button>
            <Button
              variant={activeFilter === 'nearest' ? 'contained' : 'outlined'}
              onClick={() => setActiveFilter('nearest')}
              size="small"
              startIcon={<span>📍</span>}
              sx={{ color: activeFilter === 'nearest' ? 'white' : '#4B9EF9', bgcolor: activeFilter === 'nearest' ? '#4B9EF9' : 'transparent' }}
            >
              Closest to Me
            </Button>
          </Box>

          {/* Radius Indicator */}
          <Typography variant="body2" sx={{ color: 'white' }}>
            Search radius: {(searchRadius / 1000).toFixed(1)}km
          </Typography>
        </Box>

        {/* Map and Details Container */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          gap: 3,
          minHeight: 0
        }}>
          {/* Map Section */}
          <Box sx={{ 
            flex: '1 1 60%',
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={14}
              onLoad={onMapLoad}
              onUnmount={onMapUnmount}
              options={{
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                  }
                ],
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false
              }}
            >
              {/* User location marker */}
              {userLocationIcon && userLocation && (
                <Marker
                  position={userLocation}
                  icon={userLocationIcon}
                  title="Your Location"
                />
              )}

              {/* Restaurant markers */}
              {customMarkerIcon && filteredPlaces.map((place) => (
                <Marker
                  key={place.place_id}
                  position={place.geometry.location}
                  onClick={() => setSelectedPlace(place)}
                  icon={customMarkerIcon}
                  title={place.name}
                  animation={google.maps.Animation.DROP}
                />
              ))}
            </GoogleMap>

            {/* Return to My Location button */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 1000,
              }}
            >
              <Button
                variant="contained"
                onClick={handleReturnToMyLocation}
                startIcon={<span>📍</span>}
                sx={{
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'background.paper',
                    opacity: 0.9
                  },
                  boxShadow: 2,
                  minWidth: 'auto',
                  px: 2
                }}
              >
                My Location
              </Button>
            </Box>

            {/* Search this area button */}
            <Fade in={mapMoved}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleSearchThisArea}
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'background.paper',
                      opacity: 0.9
                    },
                    boxShadow: 2,
                  }}
                >
                  Search this area
                </Button>
              </Box>
            </Fade>

            {/* Loading indicator */}
            <Fade in={searchLoading}>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  bgcolor: 'background.paper',
                  p: 1,
                  borderRadius: 1,
                  boxShadow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={20} />
                <Typography variant="body2">
                  Searching for halal restaurants...
                </Typography>
              </Box>
            </Fade>
          </Box>

          {/* Details Panel */}
          <Box sx={{ 
            flex: '1 1 40%',
            borderRadius: '12px',
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            overflow: 'auto',
            p: 3
          }}>
            {selectedPlace ? (
              <>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: 'primary.main'
                  }}
                >
                  {selectedPlace.name}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1
                    }}
                  >
                    📍 {selectedPlace.vicinity}
                  </Typography>

                  {selectedPlace.opening_hours && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: selectedPlace.opening_hours.open_now ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {selectedPlace.opening_hours.open_now ? '🟢 Open now' : '🔴 Closed'}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ 
                  display: 'flex',
                  gap: 2,
                  mb: 3
                }}>
                  {selectedPlace.rating && (
                    <Paper sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
                        {selectedPlace.rating} ⭐
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedPlace.user_ratings_total} reviews
                      </Typography>
                    </Paper>
                  )}

                  {selectedPlace.price_level && (
                    <Paper sx={{ flex: 1, p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: 'success.main', mb: 1 }}>
                        {'$'.repeat(selectedPlace.price_level)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Price Level
                      </Typography>
                    </Paper>
                  )}
                </Box>

                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name)}&query_place_id=${selectedPlace.place_id}`;
                    window.open(url, '_blank');
                  }}
                  sx={{ mb: 3 }}
                >
                  View on Google Maps
                </Button>

                <Typography variant="h6" sx={{ mb: 2 }}>Reviews</Typography>
                
                <Box sx={{ 
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  p: 3,
                  textAlign: 'center'
                }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No reviews yet. Be the first to write one!
                  </Typography>
                  <Button variant="outlined">
                    Write a Review
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                color: 'text.secondary',
                textAlign: 'center'
              }}>
                <Typography variant="h6">
                  Select a restaurant on the map to see details
                </Typography>
                <Typography variant="body2">
                  Click on any marker to view information about the restaurant
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Error Snackbar */}
      {mapError && (
        <Snackbar
          open={!!mapError}
          autoHideDuration={6000}
          onClose={() => setMapError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="error" 
            onClose={() => setMapError(null)}
            sx={{ width: '100%' }}
          >
            {mapError}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}