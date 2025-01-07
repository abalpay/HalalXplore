import { useState } from 'react';
import { Box, Paper, InputBase, IconButton, Select, MenuItem, Slider, Chip } from '@mui/material';
import { Search, SlidersHorizontal } from 'lucide-react';
import Map from '../components/Map';

export default function Discover() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          maxWidth: 800,
          width: '90%',
          background: 'rgba(43, 45, 66, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <IconButton sx={{ p: '10px' }}>
            <Search />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search for halal restaurants..."
          />
        </Box>

        <Select
          size="small"
          value="all"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="restaurant">Restaurant</MenuItem>
          <MenuItem value="cafe">Cafe</MenuItem>
          <MenuItem value="fastfood">Fast Food</MenuItem>
        </Select>

        <Select
          size="small"
          value="all"
          sx={{ minWidth: 100 }}
        >
          <MenuItem value="all">Price</MenuItem>
          <MenuItem value="low">$</MenuItem>
          <MenuItem value="medium">$$</MenuItem>
          <MenuItem value="high">$$$</MenuItem>
        </Select>

        <IconButton 
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            bgcolor: showFilters ? 'primary.main' : 'transparent',
            '&:hover': {
              bgcolor: showFilters ? 'primary.dark' : 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <SlidersHorizontal />
        </IconButton>
      </Paper>

      {/* Additional Filters */}
      {showFilters && (
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            p: 2,
            maxWidth: 800,
            width: '90%',
            background: 'rgba(43, 45, 66, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <span>Distance</span>
              <span>5 km</span>
            </Box>
            <Slider
              defaultValue={5}
              min={1}
              max={20}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label="Open Now" onClick={() => {}} />
            <Chip label="Highly Rated" onClick={() => {}} />
            <Chip label="Delivery" onClick={() => {}} />
            <Chip label="Takeout" onClick={() => {}} />
          </Box>
        </Paper>
      )}

      {/* Map */}
      <Box sx={{ height: '100%' }}>
        <Map />
      </Box>
    </Box>
  );
}