// const url = "http://192.168.68.116:5000";
const url = "https://api.arcdem.site";
// const url = "http://127.0.0.1:5000";

let selectedGroup;
let openedId = 0;
let openedMark = 0;
let openedMarkId = 0;

let currentPopup = null; // Track the currently open popup
let firstPopupOpened = false; // Ensure only the first marker opens a popup
let displayAssessState = false;
let displaySubgrpState = false;
let currSubgrpIDPopup = 0;
let currSubgrpParentIDPopup = 0;
let markerArr = [];
let assessGroup = {};
let markers = {};
const main = document.getElementById("main");
const sideGIS = document.querySelector(".sideGIS");
// -------------------------------------------------------------------------

document.addEventListener("click", (event) => {
  const panel = document.querySelector(".groupsList"); // Target div
  const selected = document.querySelector(".groupsList h6.selected"); // Target div

  if (!panel || !selected) return;

  if (panel.contains(event.target) && !selected.contains(event.target)) {
    closeGroupDetails(openedId); // Example: Close the div
  }
});

const yellowMark = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redMark = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", // you can change to green, yellow, etc.
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const blueMark = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

// ------------------------------------------------------------------------

const fetchGroup = async (param, relation = "") => {
  try {
    let link = `${url}/group/${param}`;

    if (relation === "") {
      link = `${url}/group/${param}`;
    } else {
      link = `${url}/group/${param}/${relation}`;
    }

    const response = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched group:", data);
    return data;
  } catch (error) {
    console.error("Error fetching group:", error);
    return [];
  }
};

const fetchAncestors = async (ID) => {
  try {
    let link = `${url}/assessment/${ID}/address`;

    const response = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched ancestor:", data);
    return data;
  } catch (error) {
    console.error("Error fetching ancestor:", error);
    return [];
  }
};

const fetchCracks = async () => {
  try {
    let link = `${url}/cracks`;

    const response = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched crack:", data);
    return data;
  } catch (error) {
    console.error("Error fetching crack:", error);
    return [];
  }
};

const fetchAssessments = async (assessID, cracks = false) => {
  try {
    let link;
    if (cracks) link = `${url}/assessment/${assessID}/cracks`;
    else link = `${url}/assessments`;

    const response = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched assessment:", data);
    return data;
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return [];
  }
};

const groupSorting = async (groupID) => {
  selectedGroup = document.getElementById("sortGroup").value;
  displayGroupLevels();
};

const init = async () => {
  homePanel();
  selectedGroup = document.getElementById("sortGroup").value;
  displayGroupLevels();
  displayMarkers();
};

const displayMarkers = async () => {
  const assessments = await fetchAssessments();

  assessments.forEach((assessment) => {
    let lat = (assessment.start_coor[0] + assessment.end_coor[0]) / 2;
    let lng = (assessment.start_coor[1] + assessment.end_coor[1]) / 2;

    let marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Opened Assessment", {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
      });

    markers[`assID-${assessment.id}`] = marker;
    marker.on("click", (e) => {
      e.originalEvent.stopPropagation();
      displayMarkersDetails(assessment.id, lat, lng);
      marker.openPopup();
    });
  });
};

const displayMarkersDetails = async (ID, lat, lng) => {
  if (ID === openedMarkId) return;
  if (openedMarkId !== 0) markers[`assID-${openedMarkId}`].closePopup();
  openedMarkId = ID;
  console.log(ID);
  markers[`assID-${ID}`].openPopup();
  const detailsElement = document.querySelector(".details");
  if (detailsElement) detailsElement.remove();

  document.querySelectorAll(".groupsList--content h6").forEach((assess) => {
    assess.classList.remove("selected");
  });

  openedAss = document.getElementById(`assess-${ID}`);
  if (openedAss) openedAss.classList.add("selected");

  const assessCracks = await fetchAssessments(ID, true);
  main.insertAdjacentHTML(
    "afterend",
    `<aside class="assessDetails details" id="assessDetails">
          <div
            id="details__toggle"
            class="details__toggle cursor-pointer z-[-1] sm:hidden text-center flex items-center justify-center text-5xl leading-none rounded-full h-14 w-16 pb-2 pl-5 bg-light absolute top-[50%] translate-y-[-50%] right-0 translate-x-[65%] duration-300 ease-in-out"
          >
            &lsaquo;
          </div>

          <div>
            <div class="top">
              <h5 class="inline" id="coordinates">
                <span>
                  ${Math.abs(lat).toFixed(6)}&deg; ${lat >= 0 ? "N" : "S"},
                </span>
                <span>
                  ${Math.abs(lng).toFixed(6)}&deg; ${lng >= 0 ? "E" : "W"}
                </span>
              </h5>
              <h2 class="opacity-0">.</h2>
              <h5 class="inline">Road: 5m</h5>
            </div>
          </div>

          <span class="yellow-part bg-primary flex justify-between items-center">
            <span class="flex gap-1 items-center py-3 overflow-x-hidden">
              <img src="/img/pin-loc.png" class="w-[15px] h-[15px] md:w-[20px] md:h-[20px] lg:w-[30px] lg:h-[30px]" alt="" />
              <span class="address" id="address" ">
               
              </span>
            </span>
            <a class="text-2xl sm:text-2xl md:text-3xl lg:text-4xl" onclick="closeMarkerDetails()">×</a>
          </span>

          <div id="crackDetails" class="overflow-y-auto">

          </div>
        </aside>
  `
  );

  let address = document.querySelector("#address");
  const ancestors = await fetchAncestors(ID);
  console.log("ID", ancestors);

  ancestors.forEach((ancestor, index) => {
    address.insertAdjacentHTML(
      "beforeend",
      `${index > 0 ? ", " : ""}${ancestor.name}`
    );
  });

  document.getElementById("details__toggle").addEventListener("click", () => {
    document.querySelector(".details").classList.toggle("close");
    document.querySelector(".details__toggle").classList.toggle("scale-x-[-1]");
    document.querySelector(".details__toggle").classList.toggle("pl-5");
    document.querySelector(".details__toggle").classList.toggle("pr-5");
  });

  const toggleButton = document.getElementById("details__toggle");
  const detailsPanel = document.querySelector(".details");

  // Function to reset classes when screen reaches 'sm'
  function resetOnSm(event) {
    if (event.matches) {
      detailsPanel.classList.remove("close");
      toggleButton.classList.remove("scale-x-[-1]", "pl-5", "pr-5");
      toggleButton.classList.add("pl-5");
    }
  }
  // Media query for 'sm' breakpoint (640px)
  const smMediaQuery = window.matchMedia("(min-width: 640px)");
  // Run on page load and when media query changes
  resetOnSm(smMediaQuery);
  smMediaQuery.addEventListener("change", resetOnSm);

  let crackDetails = document.getElementById("crackDetails");
  let index = 0;

  const formattedDate = new Date(assessCracks.date)
    .toLocaleString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    })
    .replace(",", "");

  crackDetails.innerHTML += `<p class="crack-info py-2"><span class="font-bold">Date Asssessed: </span>${formattedDate}</p>`;
  assessCracks.cracks.forEach((crack) => {
    let solution;
    if (
      crack.crack_type == "transverse" ||
      (crack.crack_type == "longitudinal" && crack.crack_severity == "narrow")
    ) {
      solution = "Grooving and Sealing";
    } else if (
      crack.crack_type == "transverse" ||
      (crack.crack_type == "longitudinal" && crack.crack_severity == "wide")
    ) {
      solution = "Stitch Repair";
    } else {
      solution = "Reblocking";
    }
    crackDetails.innerHTML += `
    <div class="crack-info grid gap-2">
      <h3 class="font-bold">Crack ${index + 1}:</h3>
      <p class="capitalize"><span class="font-bold">Type: </span>${
        crack.crack_type
      } Crack</p>
      <p class="capitalize"><span class="font-bold">Severity: </span>${
        crack.crack_severity
      }</p>
      <p><span class="font-bold">Length: </span>${crack.crack_length}m</p>
      <p id="crack-${index}-width"</p>
      <p id="crack-${index}-affect"></p>
      <p><span class="font-bold">Recommended Solution: </span>${solution}</p>
    </div>`;

    const type = document.getElementById(`crack-${index}-width`);
    const affected = document.getElementById(`crack-${index}-affect`);

    if (crack.crack_type.toLowerCase() === "multiple") {
      affected.innerHTML = `<span class="font-bold">Affected Area: </span>${(
        crack.crack_width * crack.crack_length
      ).toFixed(3)}m<sup>2</sup>`;
      type.innerHTML = `<span class="font-bold">Width: </span>${crack.crack_width}m`;
    } else if (
      crack.crack_type.toLowerCase() === "longitudinal" ||
      crack.crack_type.toLowerCase() === "transverse"
    ) {
      affected.remove();
    }

    index++;
  });

  let filename = `${url}/image/${assessCracks.filename}.jpg`;
  crackDetails.innerHTML += `
  <img src="${filename}" class="object-fit p-5" />`;

  const sideGIS = document.querySelector(".sideGIS");
  sideGIS.classList.add("open");
};

const resetZoom = () => {
  map.setView([12.8797, 121.774], 6); // Center of the Philippines, Zoom level 6
};

const homePanel = async (param, groupID = 0) => {
  let target = document.querySelector(".groupsPanel");
  if (target) target.remove();
  main.insertAdjacentHTML(
    "afterend",
    `
  <aside class="groupsPanel">
    <div class="groupsPanel__menu close" id="groupsPanel__menu">
      <span class=""></span>
      <span class=""></span>
      <span class=""></span>
    </div>
    <div class="backdrop absolute w-full h-full top-0 left-0 z-40 sm:hidden"></div>
    <div class="groupsPanel__wrapper h-full grid grid-rows-[auto_1fr] z-10">
      <div class="groupsLabel z-50 text-light w-full top-0 right-0">
        <label class="groupsPanel--sorts h6 border-b-2 grid px-3 py-3 sm:grid-cols-[auto_auto] gap-2">
          Sort by:
          <select id="sortGroup" class="text-dark" onchange="groupSorting()">
            <option value="region" selected>Region</option>
            <option value="province">Province</option>
            <option value="city">City</option>
          </select>
        </label>
      </div>
      <div class="groupsList">
        <div id="groupNames"></div>
      </div>
    </div>
  </aside>
`
  );

  document.getElementById("groupsPanel__menu").addEventListener("click", () => {
    document.querySelector(".groupsPanel__menu").classList.toggle("close");
    document.querySelector(".groupsPanel").classList.toggle("open");
    document.querySelector(".groupsPanel__wrapper").classList.toggle("open");
    document.querySelector(".backdrop").classList.toggle("z-40");
  });

  document.addEventListener("touchstart", (event) => {
    const menuButton = document.getElementById("groupsPanel__menu");
    const panel = document.querySelector(".groupsPanel");
    const wrapper = document.querySelector(".groupsPanel__wrapper");
    const backdrop = document.querySelector(".backdrop");

    // Check if the click is outside the panel and menu button
    if (
      !panel.contains(event.target) &&
      !menuButton.contains(event.target) &&
      window.innerWidth < 640 // Apply only for mobile screens (sm)
    ) {
      menuButton.classList.remove("close");
      panel.classList.remove("open");
      wrapper.classList.remove("open");
      backdrop.classList.add("z-40");
    }
  });

  resetMarkerColors();
  resetZoom();
  sideGIS.classList.remove("open");
};

const displayGroupLevels = async () => {
  const groupLevels = await fetchGroup(selectedGroup);
  const groupNames = document.getElementById("groupNames");

  groupNames.innerHTML = "";
  for (let groupLevel of groupLevels) {
    groupNames.innerHTML += `
        <h6 id="group-${groupLevel.id}" onclick="displayGroupDetails(${groupLevel.id})">${groupLevel.name}</h6>
      `;
  }
};

const displayGroupDetails = async (ID) => {
  const detailsElement = document.querySelector(".details");
  if (detailsElement) {
    detailsElement.remove();
  }

  const details = await fetchGroup(ID);
  console.log("details", details);

  if (ID !== openedId) {
    await changePanel(ID, details.parent_id);
  }

  closeGroupDetails(openedId);
  main.insertAdjacentHTML(
    "afterend",
    `
    <aside class="groupDetails details" id="groupDetails-${ID}">
      <div
        id="details__toggle"
        class="details__toggle cursor-pointer z-[-1] sm:hidden text-center flex items-center justify-center text-5xl leading-none rounded-full h-14 w-16 pb-2 pl-5 bg-light absolute top-[50%] translate-y-[-50%] right-0 translate-x-[65%] duration-300 ease-in-out"
      >
        &lsaquo;
      </div>
      <div>
        <div
          class="top flex z-50 w-full items-center top-0 left-0 allindent bg-dark text-light"
        >
          <h2 class="text-light">Location</h2>
        </div>
      </div>
      <div
        class="yellow-part bg-primary flex justify-between items-center border-y-[1px]"
        id="toggle-2"
      >
        <span class="pin_loc flex gap-1 items-center justify-between cursor-pointer">
          <img src="/img/pin-loc.png" alt="" class="w-[15px] h-[15px] md:w-[20px] md:h-[20px] lg:w-[30px] lg:h-[30px]"/>
          <p>${details.name}</p>
        </span>
        <a class="text-2xl sm:text-2xl md:text-3xl lg:text-4xl" onclick="closeGroupDetails(${ID}, ${true})">×</a>
      </div>
      <div class="detailedInfo h-full overflow-y-auto" id="details-2">
        <span class="detailed-info title border-t-2 flex justify-between">
            <p class="font-bold  ">Summary Information</p>
            <button id="downloadSummaryBtn" onclick="downloadSummary(event, ${ID})"><img src="/img/download.png" class="w-[15px] h-[15px] md:w-[20px] md:h-[20px] lg:w-[25px] lg:h-[25px]" alt="" /></button>
        </span>
        <div class="detailedInfos__wrapper">
          <div class="detailed-info">
            <span class="flex gap-[15px] items-center">
              <img src="/img/length.png" class="" alt="" />
              <p class="font-bold">Length of Road Monitored:</p>
            </span>
            <p class="detailed_assess">${details.n_assess * 5} meters</p>
          </div>
          <div class="detailed-info">
            <span class="flex gap-[15px] items-center">
              <img src="/img/lanes.png" alt="" />
              <p class="font-bold">Number of Assessments:</p>
            </span>
            <p class="detailed_assess">${details.n_assess} assessments</p>
          </div>
          <div class="detailed-info">
            <span class="flex gap-[15px] items-center">
              <img src="/img/cracks-detected.png" alt="" />
              <p class="font-bold">Types of Cracks Detected:</p>
            </span>
            <span class="grid gap-2">
              <p class="detailed_assess">Transverse Cracks (${
                details.n_cracks.trans
              })</p>
              <p class="detailed_assess">Longitudinal Cracks (${
                details.n_cracks.longi
              })</p>
              <p class="detailed_assess">Multiple Cracks (${
                details.n_cracks.multi
              })</p>
            </span>
          </div>
          <div class="detailed-info">
            <span class="flex gap-[15px] items-center">
              <img src="/img/total-crack.png" alt="" />
              <p class="font-bold">Total Number of Cracks:</p>
            </span>
            <p class="detailed_assess">${
              details.n_cracks.trans +
              details.n_cracks.longi +
              details.n_cracks.multi
            } cracks</p>
          </div>
          <div class="detailed-info">
            <span class="flex gap-[15px] items-center">
              <img src="/img/date.png" alt="" />
              <p class="font-bold">Date Last Updated:</p>
            </span>
            <p class="detailed_assess">${details.date}</p>
          </div>
        </div>
      </div>
    </aside>
  `
  );
  sideGIS.classList.add("open");

  document.getElementById("details__toggle").addEventListener("click", () => {
    document.querySelector(".details").classList.toggle("close");
    document.querySelector(".details__toggle").classList.toggle("scale-x-[-1]");
    document.querySelector(".details__toggle").classList.toggle("pl-5");
    document.querySelector(".details__toggle").classList.toggle("pr-5");
  });

  const toggleButton = document.getElementById("details__toggle");
  const detailsPanel = document.querySelector(".details");

  // Function to reset classes when screen reaches 'sm'
  function resetOnSm(event) {
    if (event.matches) {
      detailsPanel.classList.remove("close");
      toggleButton.classList.remove("scale-x-[-1]", "pl-5", "pr-5");
      toggleButton.classList.add("pl-5");
    }
  }
  // Media query for 'sm' breakpoint (640px)
  const smMediaQuery = window.matchMedia("(min-width: 640px)");
  // Run on page load and when media query changes
  resetOnSm(smMediaQuery);
  smMediaQuery.addEventListener("change", resetOnSm);

  openedId = ID;
};

const capitalizeFirstLetter = (string) => {
  string.charAt(0).toUpperCase() + string.slice(1);
};

const getSolution = (crackType, crackSeverity) => {
  if (crackType === "multiple") return "Reblocking";
  if (crackSeverity === "narrow") return "Grooving and Sealing";
  if (crackSeverity === "wide") return "Stitch Repair";
  return "";
};

const downloadSummary = async (event, ID) => {
  event.stopPropagation();
  const summary = await fetchGroup(ID, "summary");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set page dimensions and margins
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Set initial position
  let yPos = 20;

  // Add location header (left-aligned and bold)
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(`${summary.name}, ${summary.address}`, margin, yPos);
  doc.setFont(undefined, "normal");
  yPos += 10;

  // Add Detailed Information header
  doc.setFontSize(14);
  doc.text("Detailed Information", margin, yPos);
  yPos += 10;

  // Add summary details
  doc.setFontSize(12);
  doc.text(
    `Length of Road Monitored: ${summary.n_assess * 5} meters`,
    margin,
    yPos
  );
  yPos += 8;
  doc.text(
    `Number of Assessments: ${summary.n_assess} assessments`,
    margin,
    yPos
  );
  yPos += 8;
  doc.text("Types of Cracks Detected:", margin, yPos);
  yPos += 8;

  // Add crack types with counts
  if (summary.n_cracks.trans > 0) {
    doc.text(
      `- Transverse Cracks (${summary.n_cracks.trans})`,
      margin + 6,
      yPos
    );
    yPos += 8;
  }
  if (summary.n_cracks.longi > 0) {
    doc.text(
      `- Longitudinal Cracks (${summary.n_cracks.longi})`,
      margin + 6,
      yPos
    );
    yPos += 8;
  }
  if (summary.n_cracks.multi > 0) {
    doc.text(`- Multiple Cracks (${summary.n_cracks.multi})`, margin + 6, yPos);
    yPos += 8;
  }

  doc.text(
    `Total Number of Cracks: ${Object.values(summary.n_cracks).reduce(
      (a, b) => a + b,
      0
    )} cracks`,
    margin,
    yPos
  );
  yPos += 8;
  doc.text(`Date Last Updated: ${summary.date}`, margin, yPos);
  yPos += 20; // Extra space before assessments

  // Process each assessment
  for (let i = 0; i < summary.assessments.length; i++) {
    const assessment = summary.assessments[i];
    const assessmentDate = new Date(assessment.date).toLocaleDateString();

    // Check if we need a new page (with extra space for spacing)
    if (yPos > doc.internal.pageSize.height - 120) {
      // Increased from 100 to 120 for spacing
      doc.addPage();
      yPos = 20;
    }

    // Add assessment header
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`Assessment ${i + 1}`, margin, yPos);
    doc.setFont(undefined, "normal");

    // Try to add image (right side) aligned with assessment header
    try {
      const imageUrl = `https://api.arcdem.site/image/${assessment.filename}.jpg`;
      const imgData = await getImageBase64(imageUrl);

      // Image dimensions (50px width, 2.5x height)
      const imgWidth = 45;
      const imgHeight = imgWidth * 2; // 2.5x the height

      // Position image to the right, aligned with assessment header
      const imgX = pageWidth - margin - imgWidth;
      const imgY = yPos; // Same Y position as assessment header

      doc.addImage(imgData, "JPEG", imgX, imgY, imgWidth, imgHeight);
    } catch (error) {
      console.error(`Failed to load image for assessment ${i + 1}:`, error);
    }

    // Add assessment details
    doc.text(`Date: ${assessmentDate}`, margin, yPos + 8);
    doc.text(`Length of Assessment: 5m`, margin, yPos + 16);

    const midLat = (assessment.start_coor[0] + assessment.end_coor[0]) / 2;
    const midLng = (assessment.start_coor[1] + assessment.end_coor[1]) / 2;
    doc.text(
      `Coordinates: ${midLat.toFixed(6)} ${midLng.toFixed(6)}`,
      margin,
      yPos + 24
    );

    // Add cracks table header
    doc.setFont(undefined, "bold");
    doc.text("Cracks", margin, yPos + 36);
    doc.setFont(undefined, "normal");

    // Prepare cracks table data
    const crackColumns = [
      "#",
      "Type",
      "Severity",
      "Length",
      "Width",
      "Affected Area",
      "Solution",
    ];
    const crackRows = assessment.cracks.map((crack, index) => {
      const affectedArea =
        crack.crack_type === "multiple"
          ? (
              parseFloat(crack.crack_length) *
              parseFloat(crack.crack_width || 0.5)
            ).toFixed(2) + " m²"
          : "-";

      return [
        index + 1,
        capitalizeFirstLetter(crack.crack_type),
        capitalizeFirstLetter(crack.crack_severity),
        `${crack.crack_length}m`,
        `${crack.crack_width || "0.5"}m`,
        affectedArea,
        getSolution(crack.crack_type, crack.crack_severity),
      ];
    });

    // Add cracks table (left side)
    doc.autoTable({
      head: [crackColumns],
      body: crackRows,
      startY: yPos + 40,
      margin: { left: margin, right: margin + 60 }, // Leave 60px on right for image
      styles: {
        fontSize: 9,
        cellPadding: 1.5,
        valign: "middle",
        overflow: "linebreak",
        halign: "center",
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        textPadding: 2,
      },
      bodyStyles: {
        textPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
      },
    });

    // Add triple spacing between assessments (approximately 24 units)
    yPos = doc.lastAutoTable.finalY + 44;

    // Add page break if needed (with extra space for spacing)
    if (
      yPos > doc.internal.pageSize.height - 40 &&
      i < summary.assessments.length - 1
    ) {
      doc.addPage();
      yPos = 20;
    }
  }

  doc.save(`Road_Assessment_Report_${summary.name.replace(/\s+/g, "_")}.pdf`);
};

const getImageBase64 = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const resetMarkerColors = () => {
  const marks = Object.values(markers); // Assuming 'markers' is an object of marker instances
  marks.forEach((mark) => {
    mark.setIcon(blueMark); // Use the built-in Leaflet default icon
  });
};

const changePanel = async (ID, parentID) => {
  let subgrp = await fetchGroup(ID, "children");
  let assess = await fetchGroup(ID, "assessments");

  document.querySelector(".groupsPanel").remove();

  let backFunc = `displayGroupDetails(${parentID})`;
  console.log("parent", parentID);
  if (!parentID) backFunc = `closeGroupDetails(${openedId}, ${true})`;
  main.insertAdjacentHTML(
    "afterend",
    `
    <aside class="groupsPanel">
      <div class="groupsPanel__menu close" id="groupsPanel__menu">
        <span class=""></span>
        <span class=""></span>
        <span class=""></span>
      </div>
      <div class="groupsPanel__back"><span onclick="${backFunc}">&larr;</span></div>
      <div
        class="backdrop absolute w-full h-full top-0 left-0 z-40 sm:hidden"
      ></div>
      <div class="groupsPanel__wrapper h-full grid grid-rows-[auto_1fr]">
        <div class="groupsLabel z-50 w-full">
          <div
            class="groupsPanel--subs grid grid-cols-2 justify-items-center"
          >
            <h6 id="assessments" class="open">Assessments</h6>
            <h6 id="subgroups">Subgroups</h6>
          </div>
        </div>

        <div class="groupsList">
          <div class="groupsList--content open" id="assessments-content">

          </div>

          <div class="groupsList--content" id="subgroups-content">

          </div>
        </div>
      </div>
    </aside>
    `
  );

  document.getElementById("groupsPanel__menu").addEventListener("click", () => {
    document.querySelector(".groupsPanel__menu").classList.toggle("close");
    document.querySelector(".groupsPanel").classList.toggle("open");
    document.querySelector(".groupsPanel__wrapper").classList.toggle("open");
    document.querySelector(".groupsPanel__back").classList.toggle("open");
    document.querySelector(".backdrop").classList.toggle("z-40");
  });

  document.addEventListener("touchstart", (event) => {
    const menuButton = document.getElementById("groupsPanel__menu");
    const panel = document.querySelector(".groupsPanel");
    const wrapper = document.querySelector(".groupsPanel__wrapper");
    const back = document.querySelector(".groupsPanel__back");
    const backdrop = document.querySelector(".backdrop");

    // Check if the click is outside the panel and menu button
    if (
      !panel.contains(event.target) &&
      !menuButton.contains(event.target) &&
      window.innerWidth < 640 // Apply only for mobile screens (sm)
    ) {
      menuButton.classList.remove("close");
      panel.classList.remove("open");
      wrapper.classList.remove("open");
      back.classList.remove("open");
      backdrop.classList.add("z-40");
    }
  });

  const assessContent = document.getElementById("assessments-content");
  assess = assess.assessments;
  let index = 0;
  let focus = [];
  resetMarkerColors();
  assessContent.innerHTML = "";
  assess.forEach((ass) => {
    index++;
    let lat = (ass.start_coor[0] + ass.end_coor[0]) / 2;
    let lng = (ass.start_coor[1] + ass.end_coor[1]) / 2;
    assessContent.innerHTML += `
        <h6 id="assess-${ass.id}" class="assess" onclick="displayMarkersDetails(${ass.id}, ${lat}, ${lng});">Assessment ${index}</h6>
      `;
    mark = markers[`assID-${ass.id}`];
    focus.push(mark);
    mark.setIcon(yellowMark);
  });
  zoomToPoints(focus);

  const subgrpContent = document.getElementById("subgroups-content");
  subgrp = subgrp.children;
  subgrpContent.innerHTML = "";
  subgrp.forEach((sub) => {
    subgrpContent.innerHTML += `
        <h6 id="group-${sub.id}" onclick="displayGroupDetails(${sub.id})">${sub.name}</h6>
      `;
  });

  document.querySelectorAll(".groupsPanel--subs h6").forEach((sub) => {
    sub.addEventListener("click", () => {
      document.querySelectorAll(".groupsPanel--subs h6").forEach((subI) => {
        subI.classList.remove("open");
      });
      sub.classList.add("open");
      document.querySelectorAll(".groupsList--content").forEach((content) => {
        content.classList.remove("open");
      });
      document.getElementById(`${sub.id}-content`).classList.add("open");
    });
  });
  sideGIS.classList.add("open");
};

const closeMarkerDetails = async () => {
  document.querySelectorAll(".groupsList--content h6").forEach((assess) => {
    assess.classList.remove("selected");
  });

  if (openedId !== 0) displayGroupDetails(openedId);
  else {
    let target = document.querySelector(".details");
    target.classList.add("animate-moveOutLeft", "z-40");
    setTimeout(() => {
      target.remove();
    }, 300);
  }
  sideGIS.classList.remove("open");
  if (openedMarkId !== 0) markers[`assID-${openedMarkId}`].closePopup();
  openedMarkId = 0;
};

const closeGroupDetails = async (ID, animate = false) => {
  let target = document.querySelector(".details");
  if (!target) return;

  if (openedMarkId !== 0) markers[`assID-${openedMarkId}`].closePopup();
  openedMarkId = 0;

  if (animate) {
    if (!target.classList.contains("close"))
      target.classList.add("animate-moveOutLeft", "z-40");
    setTimeout(() => {
      target.remove();
    }, 300);

    openedId = 0;
    homePanel();
    displayGroupLevels();
    document.getElementById("sortGroup").value = selectedGroup;
  } else target.remove();
};

const zoomToPoints = async (markers) => {
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds(), {
    padding: [350, 50], // adds 100px padding on all sides, feels like zooming out
  });
};

map.on("click", () => {
  if (openedMarkId) {
    closeMarkerDetails();
    sideGIS.classList.remove("open");
  }
});

init();
