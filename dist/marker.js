let markerData = {
  Indang: [
    {
      coords: [14.199637, 120.882066],
      cracks: [
        {
          type: "Transverse Crack222",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
        {
          type: "Transverse Crack",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
        {
          type: "Transverse Crack",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
      ],
    },
    {
      coords: [14.199536, 120.882067],
      cracks: [
        {
          type: "Transverse Crack111",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
        {
          type: "Transverse Crack",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
        {
          type: "Transverse Crack",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
      ],
    },
    {
      coords: [14.199939, 120.882069],
      cracks: [
        {
          type: "Transverse Crack333",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
        {
          type: "Transverse Crack",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
        {
          type: "Transverse Crack",
          severity: "High",
          recommendedSolution: "Seal with hot mix asphalt.",
        },
      ],
    },
  ],
  Tagaytay: [
    {
      coords: [14.1142, 120.9647],
      cracks: [
        {
          type: "Pothole",
          severity: "Severe",
          recommendedSolution: "Fill with new asphalt.",
        },
      ],
    },
  ],
  TreceMartires: [
    {
      coords: [14.2864, 120.8646],
      cracks: [
        {
          type: "Edge Crack",
          severity: "Medium",
          recommendedSolution: "Apply crack sealant.",
        },
      ],
    },
  ],
};

// Initialize the map
let map = L.map("map").setView([14.205, 120.885], 17);

// Add tile layer to the map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

if (typeof L.Control.Geocoder !== "undefined") {
  L.Control.geocoder({
    defaultMarkGeocode: false,
  })
    .on("markgeocode", function (e) {
      let latlng = e.geocode.center;
      map.setView(latlng, 17);
      // L.marker(latlng).addTo(map).bindPopup(e.geocode.name).openPopup();
    })
    .addTo(map);
} else {
  console.error("Leaflet Control Geocoder is not loaded properly.");
}

// Function to dynamically add markers and bind click events
function addMarkers(data) {
  let markers = []; // Array to store marker objects

  // Iterate through all cities
  Object.keys(data).forEach((city) => {
    data[city].forEach((item) => {
      // Create marker for each set of coordinates
      let marker = L.marker(item.coords).addTo(map);
      markers.push(marker);

      // Add click event to update the info panel
      marker.on("click", (e) => {
        e.originalEvent.stopPropagation(); // Prevent map click event from firing
        displayMultipleCracks(item.cracks); // Handle multiple cracks
        document.getElementById("crack").classList.remove("-translate-x-full");
        document.getElementById("crack").style.left = "0";
      });
    });
  });

  // Adjust map view to include all markers
  let markerBounds = L.latLngBounds(
    markers.map((marker) => marker.getLatLng())
  );
  map.fitBounds(markerBounds); // Fit the map to the bounds of all markers
}

// Function to handle multiple cracks
function displayMultipleCracks(cracks) {
  const infoPanel = document.querySelector("#crack-details");
  infoPanel.innerHTML = ""; // Clear existing content

  cracks.forEach((crack, index) => {
    infoPanel.innerHTML += `
      <div class="crack-info grid gap-2">
        <h3 class="font-bold">Crack ${index + 1}:</h3>
        <p><span class="font-bold">Type: </span>${crack.type}</p>
        <p><span class="font-bold">Severity: </span>${crack.severity}</p>
        <p><span class="font-bold">Recommended Solution: </span>${
          crack.recommendedSolution
        }</p>
      </div>
    `;
  });
}

map.on("click", () => {
  document.getElementById("crack").style.left = "-100%";
});

// Add markers to the map
addMarkers(markerData);


