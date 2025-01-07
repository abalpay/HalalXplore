import { LatLng } from 'leaflet';

interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    periods?: any[];
  };
  price_level?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface PlacesResponse {
  results: PlaceResult[];
  status: string;
  error_message?: string;
  next_page_token?: string;
}

export async function geocodePostcode(postcode: string): Promise<[number, number]> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  const params = new URLSearchParams({
    address: postcode,
    key: apiKey,
  });

  try {
    const response = await fetch(`/api/geocode?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error('Invalid postcode or no results found');
    }

    const location = data.results[0].geometry.location;
    return [location.lat, location.lng];
  } catch (error) {
    console.error('Error geocoding postcode:', error);
    throw error instanceof Error ? error : new Error('Failed to geocode postcode');
  }
}

export async function fetchHalalPlaces(center: LatLng, radius: number = 5000): Promise<PlaceResult[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  const params = new URLSearchParams({
    location: `${center.lat},${center.lng}`,
    type: 'restaurant',
    keyword: 'halal',
    key: apiKey,
    language: 'en',
  });

  if (radius > 0) {
    params.append('radius', radius.toString());
  }

  try {
    const response = await fetch(`/api/places?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Places API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PlacesResponse = await response.json();
    
    if (data.status === 'ZERO_RESULTS') {
      return [];
    }
    
    if (data.status !== 'OK') {
      console.error('Places API error:', data.error_message);
      throw new Error(data.error_message || 'Failed to fetch places');
    }

    return data.results.map(place => ({
      ...place,
      vicinity: place.vicinity || 'No address available',
      rating: place.rating || 0,
      price_level: place.price_level || 0,
      opening_hours: place.opening_hours || { open_now: false }
    }));
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch restaurants');
  }
}