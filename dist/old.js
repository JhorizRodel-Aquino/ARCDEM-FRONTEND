// const url = "http://192.168.68.116:5000";
const url = "http://127.0.0.1:5000";
// const url = "https://roadtrack-test.onrender.com";
let selectedGroup = document.getElementById("sortGroup").value;
let openedId = 0;
let openedMark = 0;
let map = L.map("map").setView([14.205, 120.885], 17);
let currentPopup = null; // Track the currently open popup
let firstPopupOpened = false; // Ensure only the first marker opens a popup
let displayAssessState = false;
let displaySubgrpState = false;
let currSubgrpIDPopup = 0;
let currSubgrpParentIDPopup = 0;
let markerArr = [];

const yellowIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// let markerData = {
//   assessments: [
//     {
//       end_coor: [14.2984189, 121.0522294],
//       id: 3,
//       start_coor: [14.2984189, 121.0522294],
//     },
//     {
//       end_coor: [14.3219259, 121.0621044],
//       id: 6,
//       start_coor: [14.3219259, 121.0621044],
//     },
//     {
//       end_coor: [14.3219259, 121.0621044],
//       id: 20,
//       start_coor: [14.3219259, 121.0621044],
//     },
//     {
//       end_coor: [14.3219259, 121.0621044],
//       id: 30,
//       start_coor: [14.3219259, 121.0621044],
//     },
//     {
//       end_coor: [14.3219259, 121.0621044],
//       id: 40,
//       start_coor: [14.3219259, 121.0621044],
//     },
//     {
//       end_coor: [14.2042025, 120.8607875],
//       id: 4,
//       start_coor: [14.2042025, 120.8607875],
//     },
//     {
//       end_coor: [14.2225073, 120.8425914],
//       id: 5,
//       start_coor: [14.2225073, 120.8425914],
//     },
//     {
//       end_coor: [14.2225073, 120.8425914],
//       id: 29,
//       start_coor: [14.2225073, 120.8425915],
//     },
//     {
//       end_coor: [14.2225073, 120.8425914],
//       id: 39,
//       start_coor: [14.2225073, 120.8425915],
//     },
//     {
//       end_coor: [14.2225073, 120.8425914],
//       id: 49,
//       start_coor: [14.2225073, 120.8425915],
//     },
//   ],
// };

// let markerData = {
//   Indang: [
//     {
//       end_coor: [-14.6325006, 121.9502079],
//       id: 1,
//       start_coor: [-14.5995264, 120.9842123],
//       cracks: [
//         {
//           type: "Transverse Crack222",
//           severity: "High",
//           recommendedSolution: "Seal with hot mix asphalt.",
//         },
//         {
//           type: "Transverse Crack",
//           severity: "High",
//           recommendedSolution: "Seal with hot mix asphalt.",
//         },
//         {
//           type: "Transverse Crack",
//           severity: "High",
//           recommendedSolution: "Seal with hot mix asphalt.",
//         },
//       ],
//     },
//   ],
// };

let assessGroup = {};

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

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

const fetchCracks = async (assessID) => {
  try {
    let link = `${url}/assessment/${assessID}/cracks`;

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

const groupSorting = async (groupID, selected = "") => {
  if (!selected) {
    selectedGroup = document.getElementById("sortGroup").value;
    console.log("opened1", openedId);
    closeSubgrpDetails(
      currSubgrpIDPopup,
      currSubgrpParentIDPopup,
      (all = true)
    );
    console.log("opened2", openedId);
    displayGroupLevel(selectedGroup);

    console.log("opened3", openedId);

    return;
  }
  openedId = 0;
  selectedGroup = selected;
  console.log("okohdjkhjkhfsdf", groupID);
  displayGroupLevel(selectedGroup, groupID);
};

const displayGroupLevel = async (param, groupID = 0) => {
  console.log("okohdjkhjkhfsdf", groupID);
  let groupNames = document.getElementById("groupNames");

  let groupLevels = await fetchGroup(param);
  console.log("Hello:", groupLevels);

  groupNames.innerHTML = "";

  for (let groupLevel of groupLevels) {
    groupNames.innerHTML += `
        <div id="group-${groupLevel.id}">
            <span class="pin_loc bg-primary flex gap-1 items-center py-4 allindent cursor-pointer border-y-[1px]" id="toggle-${groupLevel.id}" onclick="displayGroupDetails(${groupLevel.id})">
                <img src="/img/pin-loc.png" alt="" />
                <p>${groupLevel.name}</p>
            </span>
        </div>`;

    const assess = await fetchGroup(groupLevel.id, "assessments");
    const key = `groupAss-${groupLevel.id}`;
    assessGroup[key] = assess.assessments;
    addMarker(assessGroup[key]);
  }

  if (!groupID) displayGroupDetails(groupLevels[0].id);
  else {
    console.log("hioashs", !groupID);
    displayGroupDetails(groupID);
  }
};

const displayGroupDetails = async (ID) => {
  if (currSubgrpIDPopup != ID || currSubgrpIDPopup != openedId) {
    displayAssessState = false;
    displaySubgrpState = false;
    currSubgrpIDPopup = ID;
  }

  let groupNames = document.getElementById(`group-${ID}`);
  const key = `groupAss-${ID}`;
  if (openedId !== ID) {
    let openedGroup = document.getElementById(`details-${openedId}`);
    displayAssessState = false;

    const details = await fetchGroup(ID);
    const assess = await fetchGroup(ID, "assessments");

    removeMarker(assessGroup[key]);

    assessGroup[key] = assess.assessments;
    addMarker(assessGroup[key], "yellow");

    let coords = [];
    assessGroup[key].forEach((ass) => {
      coords.push(ass.start_coor);
    });

    if (openedGroup) {
      openedGroup.remove();
      removeMarker(assessGroup[`groupAss-${openedId}`]);
      addMarker(assessGroup[`groupAss-${openedId}`]);
    }
    openedId = ID;

    groupNames.innerHTML += `
            <div class="summaryDetailed grid gap-5" id="details-${ID}">
              <div>
                <p class="font-bold detailed-info border-t-2">Detailed Information <button onclick="generateSummary(${ID})">SUMMARY</button></p>
                <div>
                  <div class="detailed-info">
                    <span class="flex gap-[15px] items-center">
                    <img src="/img/length.png" alt="" />
                    <p class="font-bold">Length of Road Monitored:</p>
                    </span>
                    <p class="pl-[56px]">${details.n_assess * 5} meters</p>
                  </div>
                  <div class="detailed-info">
                      <span class="flex gap-[15px] items-center">
                      <img src="/img/lanes.png" alt="" />
                      <p class="font-bold">Number of Assessments:</p>
                      </span>
                      <p class="pl-[56px]">${details.n_assess} assessments</p>
                  </div>
                  <div class="detailed-info">
                      <span class="flex gap-[15px] items-center">
                      <img src="/img/cracks-detected.png" alt="" />
                      <p class="font-bold">Types of Cracks Detected:</p>
                      </span>
                      <span class="grid gap-2">
                      <p class="pl-[56px]">Transverse Cracks (${
                        details.n_cracks.trans
                      })</p>
                      <p class="pl-[56px]">Longitudinal Cracks (${
                        details.n_cracks.longi
                      })</p>
                      <p class="pl-[56px]">Multiple Cracks (${
                        details.n_cracks.multi
                      })</p>
                      </span>
                  </div>
                  <div class="detailed-info">
                      <span class="flex gap-[15px] items-center">
                      <img src="/img/total-crack.png" alt="" />
                      <p class="font-bold">Total Number of Cracks:</p>
                      </span>
                      <p class="pl-[56px]">${
                        details.n_cracks.trans +
                        details.n_cracks.longi +
                        details.n_cracks.multi
                      }  cracks</p>
                  </div>
                  <div class="detailed-info">
                      <span class="flex gap-[15px] items-center">
                      <img src="/img/date.png" alt="" />
                      <p class="font-bold">Date Last Updated:</p>
                      </span>
                      <p class="pl-[56px]">${details.date}</p>
                  </div>
                </div>
              </div>
              <div>
                <a><p class="font-bold detailed-info border-t-2" onclick="displayGroupAssessments(${ID})">&#43; Assessments</p></a>
                <div id="displayAssess-${ID}"></div>
              </div>
              <div>
                <a><p class="font-bold detailed-info border-t-2" onclick="displayGroupSubgroups(${ID})">&#43; Subgroups</p></a>
                <div id="displaySubgrp-${ID}"></div>
              </div>
            </div>`;

    let expanded = document.getElementById(`toggle-${ID}`);
    let sumDetails = document.getElementById(`details-${ID}`);

    expanded.addEventListener("click", () => {
      sumDetails.classList.toggle("open");
    });

    zoomToPoints(coords);
    sumDetails.classList.add("open");
  } else {
    let track = document.getElementById(`details-${ID}`);

    if (!track.classList.contains("open")) {
      let coords = [];
      assessGroup[key].forEach((ass) => {
        coords.push(ass.start_coor);
      });
      zoomToPoints(coords);
      removeMarker(assessGroup[key]);
      addMarker(assessGroup[key], "yellow");
    } else {
      const allCoords = Object.values(assessGroup).flatMap((group) =>
        group.map((item) => item.start_coor)
      );
      zoomToPoints(allCoords);
      removeMarker(assessGroup[key]);
      addMarker(assessGroup[key]);
    }
  }
};

const displayGroupAssessments = async (ID) => {
  displayAssessState = !displayAssessState;
  const displayAssessElement = document.getElementById(`displayAssess-${ID}`);

  if (displayAssessState) {
    displayAssessElement.innerHTML = "";

    const key = `groupAss-${ID}`;
    let index = 0;
    assessGroup[key].forEach(() => {
      index++;
      displayAssessElement.innerHTML += `
      <div class="detailed-info" onclick="displayAssessCracks(${index - 1})">
        <span class="flex gap-[15px] items-center">
        <img src="/img/length.png" alt="" />
        <a><p>Assessment ${index}</p></a> 
        </span>
      </div>
    `;
    });
    return;
  }
  displayAssessElement.innerHTML = "";
};

const displayAssessCracks = async (index) => {
  markerArr[index].fire("click");
};

const displayGroupSubgroups = async (ID) => {
  console.log("Z", assessGroup);
  displaySubgrpState = !displaySubgrpState;

  const displaySubgrpElement = document.getElementById(`displaySubgrp-${ID}`);

  let subgroups = await fetchGroup(ID, "children");
  subgroups = subgroups.children;
  console.log("sub", subgroups);

  if (displaySubgrpState) {
    displaySubgrpElement.innerHTML = "";

    subgroups.forEach((subgrp) => {
      displaySubgrpElement.innerHTML += `
      <div class="detailed-info" onclick="goForward(${subgrp.id})">
        <span class="flex gap-[15px] items-center">
        <img src="/img/length.png" alt="" />
        <a><p>${subgrp.name}</p></a> 
        </span>
      </div>
    `;
    });
    return;
  }

  displaySubgrpElement.innerHTML = "";
};

const goForward = async (ID) => {
  if (currSubgrpIDPopup != ID || currSubgrpIDPopup != openedId) {
    displayAssessState = false;
    displaySubgrpState = false;

    currSubgrpIDPopup = ID;
    currSubgrpParentIDPopup = 0;
  }
  let subPopup = document.getElementById("subPopup");

  const group = await fetchGroup(ID);
  const assess = await fetchGroup(ID, "assessments");

  currSubgrpParentIDPopup = group.parent_id;

  removeMarker(assessGroup[`groupAss-${group.parent_id}`]);
  addMarker(assessGroup[`groupAss-${group.parent_id}`]);

  const key = `groupAss-${ID}`;
  assessGroup[key] = assess.assessments;
  addMarker(assessGroup[key], "yellow", (popup = true));
  let coords = [];
  assessGroup[key].forEach((ass) => {
    coords.push(ass.start_coor);
  });
  zoomToPoints(coords);

  console.log("ID", ID);
  console.log("ParentID", group.parent_id);

  console.log("currID", ID);
  console.log("currParentID", group.parent_id);

  const currSubgrpPopup = document.getElementById("subgroupPopup");
  if (currSubgrpPopup) currSubgrpPopup.remove();
  subPopup.innerHTML += `
          <div id="subgroupPopup" class="absolute h-full w-full left-0 bottom-0 bg-light z-40 overflow-y-scroll">
            <span class="bg-primary pr-8 flex justify-between items-center" id="toggle-${
              group.id
            }">
              <span class="pin_loc bg-primary flex gap-1 items-center py-4 allindent cursor-pointer border-y-[1px]">
                  <img src="/img/pin-loc.png" alt="" />
                  <p>${group.name}</p>
              </span>
              <span id="subGrpCloseBtn" class="text-4xl">
                  <a onclick="closeSubgrpDetails(${ID}, ${
    group.parent_id
  })">×</a>
              </span>
            </span>
        
            <div class="summaryDetailed grid gap-5 open" id="details-${
              group.id
            }">
              <div>
                <p class="font-bold detailed-info border-t-2">Detailed Information</p>
                <div>
                  <div class="detailed-info">
                    <span class="flex gap-[15px] items-center">
                    <img src="/img/length.png" alt="">
                    <p class="font-bold">Length of Road Monitored:</p>
                    </span>
                    <p class="pl-[56px]">${group.n_assess * 5} meters</p>
                  </div>
                  <div class="detailed-info">
                      <span class="flex gap-[15px] items-center">
                      <img src="/img/lanes.png" alt="">
                      <p class="font-bold">Number of Assessments:</p>
                      </span>
                      <p class="pl-[56px]">${group.n_assess} assessments</p>
                  </div>
                  <div class="detailed-info">
                      <span class="flex gap-[15px] items-center">
                      <img src="/img/cracks-detected.png" alt="" />
                      <p class="font-bold">Types of Cracks Detected:</p>
                      </span>
                      <span class="grid gap-2">
                      <p class="pl-[56px]">Transverse Cracks (${
                        group.n_cracks.trans
                      })</p>
                      <p class="pl-[56px]">Longitudinal Cracks (${
                        group.n_cracks.longi
                      })</p>
                      <p class="pl-[56px]">Multiple Cracks (${
                        group.n_cracks.multi
                      })</p>
                      </span>
                  </div>
                  <div class="detailed-info">
                      <span class="flex gap-[15px] items-center">
                      <img src="/img/total-crack.png" alt="" />
                      <p class="font-bold">Total Number of Cracks:</p>
                      </span>
                      <p class="pl-[56px]">${
                        group.n_cracks.trans +
                        group.n_cracks.longi +
                        group.n_cracks.multi
                      }  cracks</p>
                  </div>
                  <div class="detailed-info">
                      <span class="flex gap-[15px] items-center">
                      <img src="/img/date.png" alt="" />
                      <p class="font-bold">Date Last Updated:</p>
                      </span>
                      <p class="pl-[56px]">${group.date}</p>
                  </div>
                </div>
              </div>
              <div>
                <a><p class="font-bold detailed-info border-t-2" onclick="displayGroupAssessments(${
                  group.id
                })">&#43; Assessments</p></a>
                <div id="displayAssess-${group.id}"></div>
              </div>
              <div>
                <a><p class="font-bold detailed-info border-t-2" onclick="displayGroupSubgroups(${
                  group.id
                })">&#43; Subgroups</p></a>
                <div id="displaySubgrp-${group.id}"></div>
              </div>
            </div>
          </div>
        `;
};

const closeSubgrpDetails = async (ID, parentID, all = false) => {
  closeAssessmentDetails();
  removeMarker(assessGroup[`groupAss-${ID}`]);
  const subgrpPopup = document.getElementById("subgroupPopup");
  if (subgrpPopup) subgrpPopup.remove();

  if (currSubgrpIDPopup != parentID && !all) {
    displaySubgrpState = true;
    displayAssessState = true;
    currSubgrpIDPopup = parentID;

    if (currSubgrpIDPopup != openedId) goForward(parentID);
    else {
      // currSubgrpParentIDPopup = 0;
      let expanded = document.getElementById(`toggle-${openedId}`);
      let sumDetails = document.getElementById(`details-${openedId}`);
      expanded.addEventListener("click", () => {
        sumDetails.classList.toggle("open");
      });

      removeMarker(assessGroup[`groupAss-${openedId}`]);
      addMarker(assessGroup[`groupAss-${openedId}`], "yellow");
    }
  } else {
    addMarker(assessGroup[`groupAss-${ID}`]);
    currSubgrpIDPopup = 0;
    currSubgrpParentIDPopup = 0;
  }
  delete assessGroup[`groupAss-${ID}`];
};

const addMarker = async (coords, color = "", popup = false) => {
  const infoPanel = document.querySelector("#crack-details");
  let markers = [];
  let assessIndex = 0;
  coords.forEach((coor) => {
    assessIndex++;
    const coors = coor.start_coor;
    let marker;
    if (color) marker = L.marker(coors, { icon: yellowIcon }).addTo(map);
    // Opens popup by default;
    else marker = L.marker(coors).addTo(map); // Opens popup by default;

    // Bind popup once, but don't open it yet
    marker.bindPopup(`Assessment ${assessIndex}`, { closeButton: false });

    // Click event for opening the popup and showing crack details
    marker.on("click", async () => {
      if (currentPopup) {
        map.closePopup(currentPopup); // Close previous popup
      }

      marker.openPopup(); // Open new popup
      currentPopup = marker.getPopup(); // Store the opened popup

      if (openedMark != coor.id) {
        openedMark = coor.id;

        // Fetch and display crack details
        let lat = coors[0] < 0 ? "S" : "N";
        let lon = coors[1] < 0 ? "E" : "W";

        document.getElementById(
          "coordinates"
        ).innerHTML = `${coors[0]} ${lat}, ${coors[1]} ${lon}`;

        // let grpNameElement = document.getElementById(`grpname-${groupID}`);
        // let grpName = grpNameElement
        //   ? grpNameElement.innerHTML
        //   : "Unknown Group";
        // document.getElementById("group").innerHTML = grpName;

        const ancestors = await fetchGroup(coor.id, "ancestors");
        console.log(ancestors);
        document.getElementById("address").innerHTML = "";
        let i = ancestors.length;
        ancestors.forEach((ancestor) => {
          i--;
          console.log("jkahskjahs", i);
          let comma = ", ";
          if (i + 1 == ancestors.length) {
            comma = "";
          }
          console.log("yow", i + 1 !== ancestors.length);
          let func = `goBack(${ancestor.id}, ${i})`;
          if (popup && ancestors.length - i != ancestors.length) {
            func = `closeSubgrpDetails(${ancestors[i - 1].id}, ${
              ancestors[i].id
            })`;
          }
          if (i + 1 == ancestors.length) func = `goBack(${ancestor.id}, ${i})`;
          document.getElementById("address").innerHTML += `
            <a onclick="${func}"><p>${comma}${ancestor.name}</p></a>
          `;
        });

        let crackDetails = await fetchCracks(coor.id);
        let index = 0;
        infoPanel.innerHTML = ""; // Clear existing content

        crackDetails.cracks.forEach((crack) => {
          index++;

          let sol =
            crack.crack_type === "longitudinal" ||
            crack.crack_type === "transverse"
              ? "Asphalt"
              : "Reblock";

          infoPanel.innerHTML += `
          <div class="crack-info grid gap-2">
            <h3 class="font-bold">Crack ${index}:</h3>
            <p><span class="font-bold">Type: </span>${crack.crack_type}</p>
            <p><span class="font-bold">Severity: </span>${crack.crack_severity}</p>
            <p><span class="font-bold">Recommended Solution: </span>${sol}</p>
          </div>
        `;
        });

        infoPanel.innerHTML += `
            <img src="crack.png" class="object-fit p-5">
        `;

        document.getElementById("AssessCloseBtn").innerHTML = `
          <a onclick="closeAssessmentDetails()">&times;</a>
        `;

        document.getElementById("crack").classList.remove("-translate-x-full");
        document.getElementById("crack").style.left = "0";
      }
    });

    // Ensure only the first marker in the **entire session** opens its popup
    if (!firstPopupOpened) {
      marker.openPopup();
      currentPopup = marker.getPopup();
      firstPopupOpened = true;
    }

    markers.push(marker);
  });
  if (color) markerArr = markers;
};

const removeMarker = (coords) => {
  coords.forEach((coor) => {
    const [lat, lng] = coor.start_coor; // Extract lat & lng from array

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        let markerLatLng = layer.getLatLng();
        if (markerLatLng.lat === lat && markerLatLng.lng === lng) {
          map.removeLayer(layer);
        }
      }
    });
  });
};

function zoomToPoints(coords) {
  const bounds = L.latLngBounds(coords);
  map.fitBounds(bounds, { padding: [50, 50] });
}

const goBack = (ID, index) => {
  closeAssessmentDetails();

  let option;
  if (index == 0) option = "region";
  else if (index == 1) option = "province";
  else if (index == 2) option = "city";

  if (document.getElementById("subgroupPopup") && currSubgrpIDPopup != ID) {
    closeSubgrpDetails(
      currSubgrpIDPopup,
      currSubgrpParentIDPopup,
      (all = true)
    );
  }

  if (currSubgrpIDPopup == ID) return;

  document.getElementById("sortGroup").value = option;
  groupSorting(ID, option);
};

const closeAssessmentDetails = () => {
  document.getElementById("crack").style.left = "-100%";
  openedMark = 0;
  map.closePopup();
};

map.on("click", () => {
  closeAssessmentDetails();
});


async function generateSummary(ID) {
  let data = await fetchGroup(ID, "summary");
  console.log(data)
  const container = document.createElement("div");
  container.classList.add("container");
  container.id = "report-container";

  container.innerHTML = `
            <h2 class="title">Road Assessment Report</h2>
            <div class="info" id="info-container"></div>
            <h3 class="title">Assessments</h3>
            <div id="assessments-container"></div>
        `;

  document.body.appendChild(container);
  populateInfo(data);
  generateAssessments(data);
}

async function populateInfo(data) {
  const infoContainer = document.getElementById("info-container");
  infoContainer.innerHTML = `
            <p><strong>Address:</strong> ${data.address}</p>
            <p><strong>Total Assessments:</strong> ${data.totalAssessments}</p>
            <p><strong>Crack Types:</strong> ${data.crackTypes}</p>
            <p><strong>Latest Update:</strong> ${data.latestUpdate}</p>
        `;
}

async function generateAssessments(data) {
  const container = document.getElementById("assessments-container");
  container.innerHTML = "";
  console.log(data.assessments);
  data.assessments.forEach((assessment) => {
    const assessmentDiv = document.createElement("div");
    assessmentDiv.classList.add("assessment-container");

    const table = document.createElement("table");
    table.classList.add("assessment-table");
    table.innerHTML = `
                <tr><th colspan="2">Assessment ID: ${assessment.id}</th></tr>
                <tr><td><strong>Date</strong></td><td>${
                  assessment.date
                }</td></tr>
                <tr><td><strong>Start Coordinates</strong></td><td>${assessment.start_coor.join(
                  ", "
                )}</td></tr>
                <tr><td><strong>End Coordinates</strong></td><td>${assessment.end_coor.join(
                  ", "
                )}</td></tr>
                <tr><th colspan="2">Crack Details</th></tr>
                ${assessment.cracks
                  .map(
                    (crack) =>
                      `<tr><td>${crack.crack_type}</td><td>${crack.crack_severity}</td></tr>`
                  )
                  .join("")}
            `;

    const imageDiv = document.createElement("div");
    imageDiv.classList.add("image-container");

    const img = document.createElement("img");
    img.classList.add("assessment-image");
    // img.src = `images/assessment_${assessment.id}.png`;
    img.src = `crack.png`;
    img.alt = `Assessment ${assessment.id}`;

    imageDiv.appendChild(img);
    assessmentDiv.appendChild(table);
    assessmentDiv.appendChild(imageDiv);
    container.appendChild(assessmentDiv);
  });
}

// Add markers to the map

displayGroupLevel(selectedGroup);

// setInterval(() => {
//   console.log("state", openedId);
// }, 1000);
