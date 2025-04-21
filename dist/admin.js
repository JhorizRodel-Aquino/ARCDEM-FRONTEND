const url = "http://127.0.0.1:5000";
// const url = "https://api.arcdem.site";

let openedId = 0;
let openedMarkId = 0;
let markers = {};

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

// Initialize the map
let map;
const initMap = () => {
  map = L.map("map", {
    center: [12.8797, 121.774],
    zoom: 6,
    maxBounds: [
      [3.5, 116.0],
      [23.5, 127.0],
    ],
    maxBoundsViscosity: 1.0,
    minZoom: 6,
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Cursor coordinates
  let coordinates = L.control({ position: "bottomright" });
  coordinates.onAdd = function () {
    let div = L.DomUtil.create("div", "coordinate-display");
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

  let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });

  let googleStreets = L.tileLayer(
    "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
  );

  let googleHybrid = L.tileLayer(
    "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
    {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
  );

  let baseLayers = {
    OpenStreetMap: osm,
    "Satellite View": googleHybrid,
    "Google Street": googleStreets,
  };

  L.control.layers(baseLayers, null, { position: "bottomright" }).addTo(map);

  map.on("click", () => {
    if (openedMarkId) {
      closeMarkerDetails();
    }
  });
};

// const navs = document.querySelectorAll(".profile--nav a");

// navs.forEach((nav) => {
//   nav.addEventListener("click", () => {
//     navs.forEach((n) => n.classList.remove("open"));
//     nav.classList.add("open");
//   });
// });

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
      displayMarkersDetails(this, assessment.id, lat, lng);
      marker.openPopup();
    });
  });
};

function zoomToPoints(markers) {
  const group = new L.featureGroup(markers);
  map.fitBounds(group.getBounds(), {
    padding: [50, 50], // adds 100px padding on all sides, feels like zooming out
  });
}

const fetchAll = async () => {
  try {
    let link = `${url}/group/descendants`;

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
    console.log("Fetched All:", data);
    return data;
  } catch (error) {
    console.error("Error fetching group:", error);
    return [];
  }
};

const displayAll = async () => {
  const all = await fetchAll();
  const selWrapper = document.querySelector(".selection__wrapper");
  selWrapper.innerHTML = "";

  const buildSelectHTML = (group) => {
    // Build children first (recursive call)
    const childHTML = group.children
      ? group.children.map((child) => buildSelectHTML(child)).join("")
      : "";

    // Build assessments
    let assessmentsHTML = "";
    if (group.assessments && group.assessments.length > 0) {
      let index = 0;
      assessmentsHTML = group.assessments
        .map((assessment) => {
          index++;
          const id = assessment.id;
          const lat = (assessment.start_coor[0] + assessment.end_coor[0]) / 2;
          const lng = (assessment.start_coor[1] + assessment.end_coor[1]) / 2;

          return `
            <div class="select ass" id="ass-${id}" data-lat="${lat}" data-lng="${lng}">
              <span class="select--trigger"><small>&#8250;</small></span>
              <div class="select--text">
                <p>Assessment ${index}</p>
                <div class="select--child">
                  <div class="select--content">
                  </div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
    }

    return `
      <div class="select grp" id="grp-${group.id || "unknown"}">
        <span class="select--trigger"><small>&#8250;</small></span>
        <div class="select--text">
          <p>${group.name || "Unnamed Group"}</p>
          <div class="select--child">
            <div class="select--content">
              ${childHTML}
              ${assessmentsHTML}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  all.forEach((group) => {
    selWrapper.innerHTML += buildSelectHTML(group);
  });

  // Dropdown behavior
  let selects = document.querySelectorAll(".select");
  selects.forEach((select) => {
    const trigger = select.querySelector(".select--trigger");
    const child = select.querySelector(".select--child");
    const textP = select.querySelector(".select--text p");

    const toggleOpen = () => {
      child.classList.toggle("open");
      textP.classList.toggle("open");
      trigger.classList.toggle("open");
    };

    trigger.addEventListener("click", toggleOpen);

    const removeSelected = () => {
      document.querySelectorAll(".select--child").forEach((el) => {
        el.classList.remove("selected");
      });
      document.querySelectorAll(".select--text p").forEach((el) => {
        el.classList.remove("selected");
      });
    };

    // textP.addEventListener("click", () => {
    //   removeSelected();
    //   child.classList.add("selected");
    //   textP.classList.add("selected");
    // });

    // textP.addEventListener("dblclick", (e) => {
    //   e.preventDefault(); // Prevent default selection
    //   window.getSelection()?.removeAllRanges(); // Clear any accidental selection
    //   toggleOpen();
    // });

    // textP.style.userSelect = "none";
    // textP.style.webkitUserSelect = "none";
    // textP.style.mozUserSelect = "none";

    // Hide arrow for nodes without children
    if (child.querySelector(".select") === null) {
      trigger.classList.add("opacity-0", "pointer-events-none");
    }
  });

  // Handle clicks for group and assessment entries
  let grps = document.querySelectorAll(".select.grp");
  grps.forEach((grp) => {
    const triggerText = grp.querySelector(".select--text p");
    triggerText.addEventListener("click", () => {
      const id = grp.id.replace("grp-", "");
      displayGroupDetails(id);
    });
  });

  let asss = document.querySelectorAll(".select.ass");
  asss.forEach((ass) => {
    const triggerText = ass.querySelector(".select--text p");

    // Using a regular function to ensure 'this' refers to the ass element
    triggerText.addEventListener("click", function () {
      const id = ass.id.replace("ass-", "");
      const lat = parseFloat(ass.dataset.lat);
      const lng = parseFloat(ass.dataset.lng);

      // 'this' will refer to the ass element
      displayMarkersDetails(this, id, lat, lng);
    });
  });
};

const displayMarkersDetails = async (SELF, ID, lat, lng) => {
  if (ID === openedMarkId) return;
  if (openedMarkId !== 0) markers[`assID-${openedMarkId}`].closePopup();
  openedMarkId = ID;
  markers[`assID-${ID}`].openPopup();

  const assessCracks = await fetchAssessments(ID, true);

  lat = lat.toFixed(6);
  lng = lng.toFixed(6);

  const detailWrapper = document.querySelector(".detail__wrapper");
  detailWrapper.innerHTML = "";
  detailWrapper.innerHTML += `
      <div class="yellow-part admined border-0 change" id="toggle-2">
        <span class="pin_loc flex gap-1 items-center">
          <img src="/img/pin-loc.png" alt="" />
          <h3 class="not-italic">${lat}, ${lng}</h3>
        </span>
      </div>


      <div id="crackContainer" class="overflow-y-auto detail__admin change">
        
      </div>
    `;

  let index = 0;
  const crackContainer = document.getElementById("crackContainer");
  crackContainer.innerHTML = "";

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
  crackContainer.innerHTML += `
          <div class="detailed-info admined">
            <span class="flex gap-[15px] items-center">
              <h4 class="font-bold">${formattedDate}</h4>
            </span>
          </div>      
        `;
  assessCracks.cracks.forEach((crack) => {
    index++;
    crackContainer.innerHTML += `
          <div class="detailed-info admined">
            <span class="flex gap-[15px] items-center">
              <p class="font-bold">Crack ${index}</p>
            </span>
            <p class="pl-6"><span class="font-bold">Type: </span>${crack.crack_type}</p>
            <p class="pl-6"><span class="font-bold">Severity: </span>${crack.crack_severity}</p>
            <p class="pl-6" id="endCrack-${index}"><span class="font-bold">Length: </span>${crack.crack_length}m</p>
          </div>
        `;

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
    const endCrack = document.getElementById(`endCrack-${index}`);
    if (crack.crack_type.toLowerCase() === "multiple") {
      endCrack.insertAdjacentHTML(
        "afterend",
        `
            <p class="pl-6"><span class="font-bold">Affected Area: </span>${
              crack.crack_width * crack.crack_length
            }m<sup>2</sup></p>
            <p class="pl-6"><span class="font-bold">Width: </span>${
              crack.crack_width
            }m</p>
            <p class="pl-6"><span class="font-bold">Recommended Solution: </span>${solution}</p>
          `
      );
    } else if (
      crack.crack_type.toLowerCase() === "longitudinal" ||
      crack.crack_type.toLowerCase() === "transverse"
    ) {
      endCrack.insertAdjacentHTML(
        "afterend",
        `
            <p class="pl-6"><span class="font-bold">Recommended Solution: </span>${solution}</p>
          `
      );
    }
  });

  let filename = `${url}/image/${assessCracks.filename}.jpg`;
  crackContainer.innerHTML += `<img src="${filename}" class="object-fit p-5" />`;

  // let textP = SELF.querySelector(".select--text p");
  const removeSelected = () => {
    document.querySelectorAll(".select--child").forEach((el) => {
      el.classList.remove("selected");
    });
    document.querySelectorAll(".select--text p").forEach((el) => {
      el.classList.remove("selected");
    });
  };
  const child = SELF.nextElementSibling;;
  SELF.addEventListener("click", () => {
    removeSelected();
    child.classList.add("selected");
    SELF.classList.add("selected");
  });

  SELF.addEventListener("dblclick", (e) => {
    e.preventDefault(); // Prevent default selection
    window.getSelection()?.removeAllRanges(); // Clear any accidental selection
    toggleOpen();
  });

  // SELF.style.userSelect = "none";
  // SELF.style.webkitUserSelect = "none";
  // SELF.style.mozUserSelect = "none";
};

const resetMarkerColors = () => {
  const marks = Object.values(markers); // Assuming 'markers' is an object of marker instances
  marks.forEach((mark) => {
    mark.setIcon(blueMark); // Use the built-in Leaflet default icon
  });
};

const zoomBasedOnGroup = async (ID) => {
  let assess = await fetchGroup(ID, "assessments");
  assess = assess.assessments;
  resetMarkerColors();
  let focus = [];
  assess.forEach((ass) => {
    mark = markers[`assID-${ass.id}`];
    focus.push(mark);
    mark.setIcon(yellowMark);
  });
  zoomToPoints(focus);
};

const displayGroupDetails = async (ID) => {
  if (openedId === ID) return;

  const detailsElement = document.querySelector(".details");
  if (detailsElement) {
    detailsElement.remove();
  }

  const details = await fetchGroup(ID);

  const detailWrapper = document.querySelector(".detail__wrapper");
  detailWrapper.innerHTML = "";
  detailWrapper.innerHTML += `
      <div class="yellow-part admined border-0 base change" id="toggle-2">
        <span class="pin_loc flex gap-1 items-center">
          <img src="/img/pin-loc.png" alt="" />
          <h3 class="not-italic">${details.name}</h3>
        </span>
      </div>

      <div class="detailedInfo detail__admin change" id="details-2">
        <div class="detailedInfos__wrapper">
          <div class="detailed-info admined">
            <span class="flex gap-[15px] items-center">
              <img src="/img/length.png" alt="" />
              <p class="font-bold">Length of Road Monitored:</p>
            </span>
            <p class="pl-[56px]">${details.n_assess * 5}m</p>
          </div>
          <div class="detailed-info admined">
            <span class="flex gap-[15px] items-center">
              <img src="/img/lanes.png" alt="" />
              <p class="font-bold">Number of Assessments:</p>
            </span>
            <p class="pl-[56px]">${details.n_assess}</p>
          </div>
          <div class="detailed-info admined">
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
          <div class="detailed-info admined">
            <span class="flex gap-[15px] items-center">
              <img src="/img/total-crack.png" alt="" />
              <p class="font-bold">Total Number of Cracks:</p>
            </span>
            <p class="pl-[56px]">${
              details.n_cracks.trans +
              details.n_cracks.longi +
              details.n_cracks.multi
            }</p>
          </div>
          <div class="detailed-info admined">
            <span class="flex gap-[15px] items-center">
              <img src="/img/date.png" alt="" />
              <p class="font-bold">Date Last Updated:</p>
            </span>
            <p class="pl-[56px]">${details.date}</p>
          </div>
        </div>
      </div>
    `;

  zoomBasedOnGroup(ID);

  openedId = ID;

  if (openedMarkId !== 0) {
    markers[`assID-${openedMarkId}`].closePopup();
    openedMarkId = 0;
  }
};

// const displayDetails = async (param) => {
//   if (param.startsWith("grp-")) {
//     const id = param.replace("grp-", "");
//     console.log(`Group ID: ${id}`);
//     // Fetch/display more data for the group if needed
//   } else if (param.startsWith("ass-")) {
//     const id = param.replace("ass-", "");
//     console.log(`Assessment ID: ${id}`);
//     displayMarkersDetails(id, lat, lng);
//     // Fetch/display more data for the assessment if needed
//   } else {
//     console.log("Unknown ID:", param);
//   }
// };

const closeMarkerDetails = async () => {
  markers[`assID-${openedMarkId}`].closePopup();
  openedMarkId = 0;
};

const dashboard = async (self) => {
  const navs = document.querySelectorAll(".profile--nav a");
  navs.forEach((n) => n.classList.remove("open"));
  self.classList.add("open");

  const mainPanel = document.querySelector(".mainPanel");
  mainPanel.innerHTML = `
             <div
            class="dashboard h-full w-full mx-auto grid grid-cols-3 grid-rows-2 gap-5"
          >
            <div
              class="selection bg-white h-full w-full rounded-xl flex flex-col overflow-hidden"
            >
              <div class="yellow-part admined" id="toggle-2">
                <h2>Selection</h2>
              </div>

              <div class="selection__wrapper overflow-x-auto flex-1 ml-5 mr-5">
                <div class="select">
                  <span class="select--trigger"><small>&#8250;</small></span>
                  <div class="select--text">
                    <p>Calabarzon</p>
                    <div class="select--child">
                      <div class="select--content">
                        <div class="select">
                          <span class="select--trigger"
                            ><small>&#8250;</small></span
                          >
                          <div class="select--text">
                            <p>Calabarzon</p>
                            <div class="select--child">
                              <div class="select--content">
                                <div class="select">
                                  <span class="select--trigger"
                                    ><small>&#8250;</small></span
                                  >
                                  <div class="select--text">
                                    <p>Calabarzon</p>
                                    <div class="select--child">
                                      <div class="select--content"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="select">
                  <span class="select--trigger"><small>&#8250;</small></span>
                  <div class="select--text">
                    <p>Calabarzon</p>
                    <div class="select--child">
                      <div class="select--content"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="graph bg-white h-full w-full rounded-xl overflow-hidden"
            >
              <div class="yellow-part admined" id="toggle-2">
                <h2>Top Places With Most Cracks</h2>
              </div>
            </div>

            <div
              class="detail bg-white h-full w-full rounded-xl col-start-2 row-start-1 row-span-2 overflow-hidden"
            >
              <div class="yellow-part admined detailTop" id="toggle-2">
                <h2>Details</h2>
              </div>

              <div class="detail__wrapper overflow-y-auto h-full w-full">
                <div
                  class="yellow-part admined border-0 base change"
                  id="toggle-2"
                >
                  <span class="pin_loc flex gap-1 items-center">
                    <img src="/img/pin-loc.png" alt="" />
                    <h3 class="not-italic">no province</h3>
                  </span>
                </div>

                <div class="detailedInfo detail__admin change" id="details-2">
                  <div class="detailedInfos__wrapper">
                    <div class="detailed-info admined">
                      <span class="flex gap-[15px] items-center">
                        <img src="/img/length.png" alt="" />
                        <p class="font-bold">Length of Road Monitored:</p>
                      </span>
                      <p class="pl-[56px]">5 meters</p>
                    </div>
                    <div class="detailed-info admined">
                      <span class="flex gap-[15px] items-center">
                        <img src="/img/lanes.png" alt="" />
                        <p class="font-bold">Number of Assessments:</p>
                      </span>
                      <p class="pl-[56px]">1 assessments</p>
                    </div>
                    <div class="detailed-info admined">
                      <span class="flex gap-[15px] items-center">
                        <img src="/img/cracks-detected.png" alt="" />
                        <p class="font-bold">Types of Cracks Detected:</p>
                      </span>
                      <span class="grid gap-2">
                        <p class="pl-[56px]">Transverse Cracks (1)</p>
                        <p class="pl-[56px]">Longitudinal Cracks (1)</p>
                        <p class="pl-[56px]">Multiple Cracks (0)</p>
                      </span>
                    </div>
                    <div class="detailed-info admined">
                      <span class="flex gap-[15px] items-center">
                        <img src="/img/total-crack.png" alt="" />
                        <p class="font-bold">Total Number of Cracks:</p>
                      </span>
                      <p class="pl-[56px]">2 cracks</p>
                    </div>
                    <div class="detailed-info admined">
                      <span class="flex gap-[15px] items-center">
                        <img src="/img/date.png" alt="" />
                        <p class="font-bold">Date Last Updated:</p>
                      </span>
                      <p class="pl-[56px]">2025-02-28 12:53:20</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- <div class="overflow-y-auto detail__admin">
                <div class="crack-info admined">
                  <span class="font-bold"><p>Crack 1:</p></span>
                  <p><span class="font-bold">Type: </span>longitudinal</p>
                  <p><span class="font-bold">Severity: </span>narrow</p>
                  <p>
                    <span class="font-bold">Recommended Solution: </span>Asphalt
                  </p>
                </div>
                <div class="crack-info admined">
                  <span class="font-bold"><p>Crack 2:</p></span>
                  <p><span class="font-bold">Type: </span>transverse</p>
                  <p><span class="font-bold">Severity: </span>wide</p>
                  <p>
                    <span class="font-bold">Recommended Solution: </span>Asphalt
                  </p>
                </div>
                <img src="crack.png" class="object-fit p-5" />
              </div> -->
            </div>

            <div
              class="map bg-white h-full w-full rounded-xl overflow-hidden col-start-3 row-start-1 row-span-2"
            >
              <div id="map" class="w-full h-full z-10"></div>
            </div>
          </div>
  `;

  initMap();

  await displayAll();
  await displayMarkers();
};

const manage = async () => {};
