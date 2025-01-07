import { Box, Paper, Slider, FormControlLabel, Switch, Select, MenuItem, Typography } from '@mui/material';

export default function Filters() {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Distance (km)</Typography>
        <Slider
          defaultValue={5}
          min={1}
          max={20}
          valueLabelDisplay="auto"
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Cuisine Type</Typography>
        <Select
          fullWidth
          size="small"
          defaultValue="all"
        >
          <MenuItem value="all">All Cuisines</MenuItem>
          <MenuItem value="middle-eastern">Middle Eastern</MenuItem>
          <MenuItem value="indian">Indian</MenuItem>
          <MenuItem value="malaysian">Malaysian</MenuItem>
        </Select>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Price Range</Typography>
        <Select
          fullWidth
          size="small"
          defaultValue="all"
        >
          <MenuItem value="all">All Prices</MenuItem>
          <MenuItem value="$">$</MenuItem>
          <MenuItem value="$$">$$</MenuItem>
          <MenuItem value="$$$">$$$</MenuItem>
        </Select>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Rating</Typography>
        <Select
          fullWidth
          size="small"
          defaultValue="all"
        >
          <MenuItem value="all">All Ratings</MenuItem>
          <MenuItem value="4+">4+ Stars</MenuItem>
          <MenuItem value="3+">3+ Stars</MenuItem>
        </Select>
      </Box>

      <FormControlLabel
        control={<Switch />}
        label="Currently Open"
      />
    </Paper>
  );
}