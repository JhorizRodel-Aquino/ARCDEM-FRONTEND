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

// Cursor Coordinates Display
var coordinates = L.control({ position: "bottomright" });

coordinates.onAdd = function () {
  var div = L.DomUtil.create("div", "coordinate-display");
  div.style.padding = "5px";
  div.style.background = "rgba(255, 255, 255, 0.8)";
  div.style.borderRadius = "5px";
  div.innerHTML = "Lat: -, Lng: -";
  return div;
};

coordinates.addTo(map);

map.on("mousemove", function (e) {
  document.querySelector(
    ".coordinate-display"
  ).innerHTML = `Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(
    5
  )}`;
});

// Base Layers
let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let googleStreets = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

googleHybrid = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
);

// Layer Control
let baseLayers = {
  OpenStreetMap: osm,
  "Satellite View": googleHybrid,
  "Google Street": googleStreets,
};

// Add Layer Control Button
L.control.layers(baseLayers, null, { position: "bottomright" }).addTo(map);

L.control.zoom({ position: "bottomright" }).addTo(map);
