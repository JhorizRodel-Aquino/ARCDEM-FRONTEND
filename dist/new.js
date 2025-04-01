// const url = "http://192.168.68.116:5000";
const url = "http://127.0.0.1:5000";
// const url = "https://roadtrack-test.onrender.com";

let selectedGroup;
let openedId = 0;
let openedMark = 0;

let currentPopup = null; // Track the currently open popup
let firstPopupOpened = false; // Ensure only the first marker opens a popup
let displayAssessState = false;
let displaySubgrpState = false;
let currSubgrpIDPopup = 0;
let currSubgrpParentIDPopup = 0;
let markerArr = [];
let assessGroup = {};
const main = document.getElementById("main");
// -------------------------------------------------------------------------

document.addEventListener("click", (event) => {
  const panel = document.querySelector(".groupsList"); // Target div
  const selected = document.querySelector(".groupsList h6.selected"); // Target div

  if (!panel || !selected) return;

  if (panel.contains(event.target) && !selected.contains(event.target)) {
    closeGroupDetails(openedId); // Example: Close the div
  }
});

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

let satellite = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenTopoMap contributors",
  }
);

let light = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; CartoDB contributors",
  }
);

let dark = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution: "&copy; CartoDB contributors",
  }
);

// Layer Control
let baseLayers = {
  OpenStreetMap: osm,
  "Satellite View": satellite,
  "Light Mode": light,
  "Dark Mode": dark,
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
    // closeSubgrpDetails(
    //   currSubgrpIDPopup,
    //   currSubgrpParentIDPopup,
    //   (all = true)
    // );

    displayGroupLevels();
    return;
  }
  openedId = 0;
  selectedGroup = selected;
  console.log("okohdjkhjkhfsdf", groupID);
  displayGroupLevel(selectedGroup, groupID);
};

const init = async () => {
  homePanel();
  selectedGroup = document.getElementById("sortGroup").value;
  displayGroupLevels();
};

const homePanel = async (param, groupID = 0) => {
  let target = document.querySelector(".groupsPanel");
  if (target) target.remove();
  main.insertAdjacentHTML(
    "afterend",
    `
  <aside class="groupsPanel">
    <div class="groupsPanel__menu" id="groupsPanel__menu">
      <span class=""></span>
      <span class=""></span>
      <span class=""></span>
    </div>
    <div class="backdrop absolute w-full h-full top-0 left-0 z-40 sm:hidden"></div>
    <div class="groupsPanel__wrapper h-full grid grid-rows-[auto_1fr] z-10">
      <div class="groupsLabel z-50 text-dar w-full top-0 right-0">
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
      panel.classList.remove("open");
      wrapper.classList.remove("open");
      backdrop.classList.add("z-40");
    }
  });

  // displayGroupDetails(groupLevels[0].id);

  // if (!groupID) displayGroupDetails(groupLevels[0].id);
  // else {
  //   console.log("hioashs", !groupID);
  //   displayGroupDetails(groupID);
  // }
};

const displayGroupLevels = async () => {
  const groupLevels = await fetchGroup(selectedGroup);
  const groupNames = document.getElementById("groupNames");

  groupNames.innerHTML = "";
  for (let groupLevel of groupLevels) {
    groupNames.innerHTML += `
        <h6 id="group-${groupLevel.id}" onclick="displayGroupDetails(${groupLevel.id})">${groupLevel.name}</h6>
      `;

    // const assess = await fetchGroup(groupLevel.id, "assessments");
    // const key = `groupAss-${groupLevel.id}`;
    // assessGroup[key] = assess.assessments;
    // addMarker(assessGroup[key]);
  }
};

const displayGroupDetails = async (ID) => {
  if (ID === openedId) return;

  // if (currSubgrpIDPopup != ID || currSubgrpIDPopup != openedId) {
  //   displayAssessState = false;
  //   displaySubgrpState = false;
  //   currSubgrpIDPopup = ID;
  // }

  // let groupNames = document.getElementById(`group-${ID}`);
  // const key = `groupAss-${ID}`;
  // if (openedId !== ID) {
  //   let openedGroup = document.getElementById(`details-${openedId}`);
  //   displayAssessState = false;

  const details = await fetchGroup(ID);

  //   const assess = await fetchGroup(ID, "assessments");

  //   removeMarker(assessGroup[key]);

  //   assessGroup[key] = assess.assessments;
  //   addMarker(assessGroup[key], "yellow");

  //   let coords = [];
  //   assessGroup[key].forEach((ass) => {
  //     coords.push(ass.start_coor);
  //   });

  //   if (openedGroup) {
  //     openedGroup.remove();
  //     removeMarker(assessGroup[`groupAss-${openedId}`]);
  //     addMarker(assessGroup[`groupAss-${openedId}`]);
  //   }
  //   openedId = ID;

  closeGroupDetails(openedId);
  main.insertAdjacentHTML(
    "afterend",
    `
    <aside class="groupDetails details" id="groupDetails-${ID}">
      <div
        id="details__toggle"
        class="details__toggle z-[-1] sm:hidden text-center flex items-center justify-center text-5xl leading-none rounded-full h-14 w-16 pb-2 pl-5 bg-light absolute top-[50%] translate-y-[-50%] right-0 translate-x-[65%] duration-300 ease-in-out"
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
        <span class="pin_loc flex gap-1 items-center cursor-pointer">
          <img src="/img/pin-loc.png" alt="" />
          <p>${details.name}</p>
        </span>
        <a class="text-4xl" onclick="closeGroupDetails(${ID}, ${true})">×</a>
      </div>

      <div class="detailedInfo h-full overflow-y-auto" id="details-2">
        <p class="font-bold detailed-info border-t-2">
          Detailed Information
        </p>
        <div class="detailedInfos__wrapper">
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
            } cracks</p>
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
    </aside>
  `
  );

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

  changePanel(ID, details.parent_id);
  openedId = ID;

  //   let expanded = document.getElementById(`toggle-${ID}`);
  //   let sumDetails = document.getElementById(`details-${ID}`);

  //   expanded.addEventListener("click", () => {
  //     sumDetails.classList.toggle("open");
  //   });

  //   zoomToPoints(coords);
  //   sumDetails.classList.add("open");
  // } else {
  //   let track = document.getElementById(`details-${ID}`);

  //   if (!track.classList.contains("open")) {
  //     let coords = [];
  //     assessGroup[key].forEach((ass) => {
  //       coords.push(ass.start_coor);
  //     });
  //     zoomToPoints(coords);
  //     removeMarker(assessGroup[key]);
  //     addMarker(assessGroup[key], "yellow");
  //   } else {
  //     const allCoords = Object.values(assessGroup).flatMap((group) =>
  //       group.map((item) => item.start_coor)
  //     );
  //     zoomToPoints(allCoords);
  //     removeMarker(assessGroup[key]);
  //     addMarker(assessGroup[key]);
  //   }
  // }
};

const changePanel = async (ID, parentID) => {
  console.log("changes");
  let subgrp = await fetchGroup(ID, "children");
  let assess = await fetchGroup(ID, "assessments");

  document.querySelector(".groupsPanel").remove();

  let backFunc = `displayGroupDetails(${parentID})`;
  if (!parentID) backFunc = `closeGroupDetails(${openedId}, ${true})`;
  main.insertAdjacentHTML(
    "afterend",
    `
    <aside class="groupsPanel">
      <div class="groupsPanel__menu" id="groupsPanel__menu">
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
      panel.classList.remove("open");
      wrapper.classList.remove("open");
      back.classList.remove("open");
      backdrop.classList.add("z-40");
    }
  });

  const assessContent = document.getElementById("assessments-content");
  assess = assess.assessments;
  let index = 0;
  assessContent.innerHTML = "";
  assess.forEach((ass) => {
    index++;
    assessContent.innerHTML += `
        <h6 id="assess-${ass.id}" onclick="">Assessment ${index}</h6>
      `;
  });

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
};

const closeGroupDetails = async (ID, animate = false) => {
  let target = document.getElementById(`groupDetails-${ID}`);
  if (!target) return;

  if (animate) {
    openedId = 0;
    target.classList.add("animate-moveOutLeft", "z-40");
    homePanel();
    displayGroupLevels();
    document.getElementById("sortGroup").value = selectedGroup;
    setTimeout(() => {
      target.remove();
    }, 300);
  } else target.remove();

  // document.getElementById(`group-${ID}`).classList.remove("selected");
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
  console.log(data);
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

// displayGroupLevel(selectedGroup);

init();
