import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Box, 
  CircularProgress, 
  Alert, 
  Snackbar, 
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { fetchHalalPlaces, geocodePostcode } from '../services/PlacesService';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Default locations for major cities
const defaultLocations = [
  { name: 'London', coords: [51.5074, -0.1278] },
  { name: 'New York', coords: [40.7128, -74.0060] },
  { name: 'Tokyo', coords: [35.6762, 139.6503] },
  { name: 'Istanbul', coords: [41.0082, 28.9784] },
  { name: 'Dubai', coords: [25.2048, 55.2708] },
];

function LocationPrompt({ 
  onLocationSelect, 
  onRetryLocation 
}: { 
  onLocationSelect: (location: [number, number]) => void;
  onRetryLocation: () => void;
}) {
  const [showPostcodeDialog, setShowPostcodeDialog] = useState(false);
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePostcodeSubmit = async () => {
    if (!postcode.trim()) {
      setError('Please enter a postcode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const coordinates = await geocodePostcode(postcode.trim());
      onLocationSelect(coordinates);
      setShowPostcodeDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 3,
        p: 3,
        bgcolor: 'background.default'
      }}
    >
      <Alert severity="info" sx={{ maxWidth: 400 }}>
        Location services are not available. Please choose a location:
      </Alert>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={onRetryLocation}
        sx={{ mb: 2 }}
      >
        Retry Location Access
      </Button>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Select a Major City:
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: 600 }}>
        {defaultLocations.map((location) => (
          <Button
            key={location.name}
            variant="outlined"
            onClick={() => onLocationSelect(location.coords as [number, number])}
          >
            {location.name}
          </Button>
        ))}
      </Box>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Or
      </Typography>

      <Button 
        variant="outlined" 
        onClick={() => setShowPostcodeDialog(true)}
      >
        Enter Postcode/ZIP Code
      </Button>

      <Dialog 
        open={showPostcodeDialog} 
        onClose={() => !loading && setShowPostcodeDialog(false)}
      >
        <DialogTitle>Enter Postcode/ZIP Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 300 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              label="Postcode/ZIP Code"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g., SW1A 1AA"
              disabled={loading}
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowPostcodeDialog(false)} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePostcodeSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Search'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function MapController() {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const addMarkersToMap = (places: any[]) => {
    clearMarkers();
    
    if (places.length === 0) {
      setError('No halal restaurants found in this area. Try zooming out or moving the map.');
      return;
    }

    places.forEach(place => {
      const marker = L.marker([
        place.geometry.location.lat,
        place.geometry.location.lng
      ]);

      const popupContent = `
        <div style="min-width: 200px; max-width: 300px">
          <h3 style="margin: 0 0 8px 0; color: #1E90FF">${place.name}</h3>
          <p style="margin: 0 0 8px 0; color: #666">${place.vicinity}</p>
          ${place.rating ? 
            `<div style="display: flex; align-items: center; margin-bottom: 8px">
              <span style="color: #FFD700; margin-right: 4px">★</span>
              <span style="color: #666">${place.rating.toFixed(1)} (${place.user_ratings_total} reviews)</span>
            </div>` : 
            ''}
          ${place.price_level ? 
            `<p style="margin: 0 0 8px 0; color: #666">Price: ${'$'.repeat(place.price_level)}</p>` : 
            ''}
          ${place.opening_hours ? 
            `<p style="margin: 0; color: ${place.opening_hours.open_now ? '#4CAF50' : '#F44336'}">
              ${place.opening_hours.open_now ? '🟢 Open now' : '🔴 Closed'}
            </p>` : 
            ''}
        </div>
      `;

      const popup = L.popup({
        maxWidth: 300,
        className: 'custom-popup'
      }).setContent(popupContent);

      marker.bindPopup(popup);
      marker.addTo(map);
      markersRef.current.push(marker);
    });
  };

  const updatePlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const center = map.getCenter();
      const radius = Math.min(5000, Math.round(map.getBounds().getNorthEast().distanceTo(map.getCenter())));
      const places = await fetchHalalPlaces(center, radius);
      addMarkersToMap(places);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch restaurants');
      console.error('Error updating places:', err);
    } finally {
      setLoading(false);
    }
  };

  useMapEvents({
    moveend: () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      fetchTimeoutRef.current = setTimeout(updatePlaces, 1000);
    },
    zoomend: () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      fetchTimeoutRef.current = setTimeout(updatePlaces, 1000);
    }
  });

  useEffect(() => {
    updatePlaces();
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            bgcolor: 'background.paper',
            p: 1,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      )}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

function LocationMarker() {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    map.locate().on("locationfound", (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Your Location
        </Typography>
      </Popup>
    </Marker>
  );
}

export default function Map() {
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getUserLocation = () => {
    setLoading(true);
    setLocationError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('location-error');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('location-error');
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  if (loading) {
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
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Getting your location...
        </Typography>
      </Box>
    );
  }

  if (locationError === 'location-error') {
    return (
      <LocationPrompt 
        onLocationSelect={(location) => {
          setUserLocation(location);
          setLocationError(null);
        }}
        onRetryLocation={getUserLocation}
      />
    );
  }

  if (!userLocation) {
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
          Unable to determine your location
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <MapContainer
        center={userLocation}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
        <MapController />
      </MapContainer>
    </Box>
  );
}