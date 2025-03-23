let markerData = [
  {
    coords: [14.199637, 120.882066],
    cracks: [
      {
        type: "Transverse Crack",
        severity: "High",
        recommendedSolution: "Seal with hot mix asphalt.",
      },
      {
        type: "Longitudinal Crack",
        severity: "Medium",
        recommendedSolution: "Apply crack sealant.",
      },
    ],
  },
  {
    coords: [14.2, 120.883],
    cracks: [
      {
        type: "Alligator Crack",
        severity: "Low",
        recommendedSolution: "Resurface with overlay.",
      },
      {
        type: "Edge Crack",
        severity: "High",
        recommendedSolution: "Repair with patching.",
      },
    ],
  },
  {
    coords: [14.205, 120.885],
    cracks: [
      {
        type: "Pothole",
        severity: "Severe",
        recommendedSolution: "Fill with new asphalt.",
      },
    ],
  },
];

// Initialize the map
let map = L.map("map").setView([14.2, 120.882], 13);

// Add tile layer to the map
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Function to dynamically add markers and bind click events
function addMarkers(data) {
  let markers = []; // Array to store marker objects

  data.forEach((item) => {
    // Create marker for each set of coordinates
    let marker = L.marker(item.coords).addTo(map);
    markers.push(marker);

    // Add click event to update the info panel
    marker.on("click", (e) => {
      e.originalEvent.stopPropagation(); // Prevent map click event from firing
      displayMultipleCracks(item.cracks); // Handle multiple cracks
      document.getElementById("crack").classList.remove("left-[-100%]");
      document.getElementById("crack").style.left = "0";
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


// region: [
//           {
//             date: "2025-02-28 12:53:20",
//             id: 1,
//             n_assess: 1,
//             n_cracks: {
//               longi: 6,
//               multi: 0,
//               trans: 1,
//             },
//             name: "Region",
//             parent_id: null,
//           },
//           {
//             date: "2025-02-28 12:53:20",
//             id: 4,
//             n_assess: 1,
//             n_cracks: {
//               longi: 0,
//               multi: 1,
//               trans: 1,
//             },
//             name: "Region2",
//             parent_id: null,
//           },
//           {
//             date: "2025-02-28 12:53:20",
//             id: 7,
//             n_assess: 4,
//             n_cracks: {
//               longi: 2,
//               multi: 2,
//               trans: 4,
//             },
//             name: "Region3",
//             parent_id: null,
//           },
//         ],
//         city: [
//           {
//             date: "2025-02-28 12:53:20",
//             id: 1,
//             n_assess: 1,
//             n_cracks: {
//               longi: 34,
//               multi: 0,
//               trans: 1,
//             },
//             name: "City",
//             parent_id: null,
//           },
//           {
//             date: "2025-02-28 12:53:20",
//             id: 4,
//             n_assess: 1,
//             n_cracks: {
//               longi: 13,
//               multi: 1,
//               trans: 1,
//             },
//             name: "City2",
//             parent_id: null,
//           },
//           {
//             date: "2025-02-28 12:53:20",
//             id: 7,
//             n_assess: 4,
//             n_cracks: {
//               longi: 2,
//               multi: 2,
//               trans: 4,
//             },
//             name: "City3",
//             parent_id: null,
//           },
//         ],
//         province: [
//           {
//             date: "2025-02-28 12:53:20",
//             id: 1,
//             n_assess: 1,
//             n_cracks: {
//               longi: 1,
//               multi: 12,
//               trans: 1,
//             },
//             name: "Province",
//             parent_id: null,
//           },
//           {
//             date: "2025-02-28 12:53:20",
//             id: 4,
//             n_assess: 1,
//             n_cracks: {
//               longi: 0,
//               multi: 1,
//               trans: 1,
//             },
//             name: "Province2",
//             parent_id: null,
//           },
//           {
//             date: "2025-02-28 12:53:20",
//             id: 7,
//             n_assess: 4,
//             n_cracks: {
//               longi: 2,
//               multi: 2,
//               trans: 4,
//             },
//             name: "Province3",
//             parent_id: null,
//           },
//         ],
//         cracks: [
//           {
//             segment_id: 1,
//             start_coor: [-14.5995264, 120.9842123],
//             end_coor: [-14.6325006, 121.9502079],
//             date_created: "20250228_12-53-20",
//             cracks: [
//               {
//                 type: "longitudinal",
//                 severity: "narrow",
//               },
//               {
//                 type: "transverse",
//                 severity: "wide",
//               },
//             ],
//           },
//           {
//             segment_id: 2,
//             start_coor: [-15.5995264, 120.9842123],
//             end_coor: [-14.6325406, 121.9572079],
//             date_created: "20250228_12-53-20",
//             cracks: [
//               {
//                 type: "multiple",
//                 severity: "narrow",
//               },
//               {
//                 type: "transverse",
//                 severity: "wide",
//               },
//             ],
//           },
//         ],