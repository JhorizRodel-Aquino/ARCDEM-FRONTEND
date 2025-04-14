// Initialize the map
let map = L.map("map", {
  center: [12.8797, 121.774], // Center of the Philippines
  zoom: 6, // Default zoom level
  maxBounds: [
    [3.5, 116.0], // Southwest corner (lower-left)
    [23.5, 127.0], // Northeast corner (upper-right)
  ],
  maxBoundsViscosity: 1.0, // Prevents dragging outside bounds
  minZoom: 6, // Prevents zooming out too much
});

// Add tile layer to the map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
