// const url = "http://192.168.68.121:5000";
const url = "https://api.arcdem.site";

let openedId = 0;
let openedMarkId = 0;
let markers = {};
let modify = { grp: [], ass: [] };

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
      displayMarkersDetails(assessment.id, lat, lng);
      marker.openPopup();
    });
  });
};

const manageMarkers = async () => {
  const assessments = await fetchAssessments();

  assessments.forEach((assessment) => {
    let lat = (assessment.start_coor[0] + assessment.end_coor[0]) / 2;
    let lng = (assessment.start_coor[1] + assessment.end_coor[1]) / 2;

    let marker = L.marker([lat, lng]).addTo(map);
    markers[`assID-${assessment.id}`] = marker;
    marker.on("click", (e) => {
      e.originalEvent.stopPropagation();
      manageMarkersDetails(assessment.id, lat, lng);
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
      <div class="select grp" id="grp-${group.id}">
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

    // Hide arrow for nodes without children
    if (child.querySelector(".select") === null) {
      trigger.classList.add("opacity-0", "pointer-events-none");
    }

    textP.addEventListener("dblclick", (e) => {
      e.preventDefault(); // Prevent default selection
      window.getSelection()?.removeAllRanges(); // Clear any accidental selection
      toggleOpen();
    });
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
    triggerText.addEventListener("click", function () {
      const id = ass.id.replace("ass-", "");
      const lat = parseFloat(ass.dataset.lat);
      const lng = parseFloat(ass.dataset.lng);
      displayMarkersDetails(id, lat, lng);
    });
  });
};

const manageAll = async () => {
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
                <p class="flex justify-between items-center gap-2 group">
                  Assessment ${index}
                  <img
                    class="hidden group-hover:block"
                    src="../img/edit.png"
                    alt=""
                  />
                </p>
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
      <div class="select grp" id="grp-${group.id}">
        <span class="select--trigger"><small>&#8250;</small></span>
        <div class="select--text">
          <p class="flex justify-between items-center gap-2 group">
            ${group.name}
            <img
              class="hidden group-hover:block"
              src="../img/edit.png"
              alt=""
            />
          </p>
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

    // Hide arrow for nodes without children
    if (child.querySelector(".select") === null) {
      trigger.classList.add("opacity-0", "pointer-events-none");
    }

    textP.addEventListener("dblclick", (e) => {
      e.preventDefault(); // Prevent default selection
      window.getSelection()?.removeAllRanges(); // Clear any accidental selection
      toggleOpen();
    });
  });

  // Handle clicks for group and assessment entries
  let grps = document.querySelectorAll(".select.grp");
  grps.forEach((grp) => {
    const triggerText = grp.querySelector(".select--text p");
    triggerText.addEventListener("click", () => {
      const id = grp.id.replace("grp-", "");
      manageGroupDetails(id);
    });
  });

  let asss = document.querySelectorAll(".select.ass");
  asss.forEach((ass) => {
    const triggerText = ass.querySelector(".select--text p");
    triggerText.addEventListener("click", function () {
      const id = ass.id.replace("ass-", "");
      const lat = parseFloat(ass.dataset.lat);
      const lng = parseFloat(ass.dataset.lng);
      manageMarkersDetails(id, lat, lng);
    });
  });
};

const displayMarkersDetails = async (ID, lat, lng, detail = true) => {
  if (ID === openedMarkId) return;
  console.log(`assID-${openedMarkId}`);
  if (openedMarkId !== 0) markers[`assID-${openedMarkId}`].closePopup();
  resetMarkerColors();
  openedMarkId = ID;
  markers[`assID-${ID}`].openPopup();

  let focus = [];
  mark = markers[`assID-${ID}`];
  focus.push(mark);
  mark.setIcon(yellowMark);
  zoomToPoints(focus);

  if (detail) {
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
  }

  let select = document.getElementById(`ass-${ID}`);
  const child = select.querySelector(".select--child");
  const textP = select.querySelector(".select--text p");

  const removeSelected = () => {
    document.querySelectorAll(".select--child").forEach((el) => {
      el.classList.remove("selected");
    });
    document.querySelectorAll(".select--text p").forEach((el) => {
      el.classList.remove("selected");
    });
  };

  removeSelected();
  child.classList.add("selected");
  textP.classList.add("selected");

  textP.style.userSelect = "none";
  textP.style.webkitUserSelect = "none";
  textP.style.mozUserSelect = "none";
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

const resetZoom = () => {
  map.setView([12.8797, 121.774], 6); // Center of the Philippines, Zoom level 6
};

const displayGroupDetails = async (ID, detail = true) => {
  if (openedId === ID) return;

  if (detail) {
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
  }

  zoomBasedOnGroup(ID);

  openedId = ID;

  if (openedMarkId !== 0) markers[`assID-${openedMarkId}`].closePopup();

  let select = document.getElementById(`grp-${ID}`);
  const child = select.querySelector(".select--child");
  const textP = select.querySelector(".select--text p");

  const removeSelected = () => {
    document.querySelectorAll(".select--child").forEach((el) => {
      el.classList.remove("selected");
    });
    document.querySelectorAll(".select--text p").forEach((el) => {
      el.classList.remove("selected");
    });
  };

  removeSelected();
  child.classList.add("selected");
  textP.classList.add("selected");

  textP.style.userSelect = "none";
  textP.style.webkitUserSelect = "none";
  textP.style.mozUserSelect = "none";
};

const manageGroupDetails = async (ID) => {
  let select = document.getElementById(`grp-${ID}`);
  select.classList.toggle("selected");

  if (!modify.grp.includes(Number(ID))) {
    modify.grp.push(Number(ID));

    let children = select.querySelectorAll(".select");
    children.forEach((child) => {
      child.classList.remove(".selected");
      let childId;
      if (child.id.startsWith("grp")) {
        childId = Number(child.id.replace("grp-", ""));
        modify.grp = modify.grp.filter((item) => item !== Number(childId));
      } else {
        childId = Number(child.id.replace("ass-", ""));
        modify.ass = modify.ass.filter((item) => item !== Number(childId));
      }
    });

    let element = select.parentElement; // Start from the parent
    while (element && element !== document.body) {
      if (element.classList.contains("selection__wrapper")) break;

      if (element.classList.contains("select")) {
        element.classList.remove("selected");

        let id = element.id;
        if (id.startsWith("grp-")) {
          const parentId = Number(id.replace("grp-", ""));
          modify.grp = modify.grp.filter((item) => item !== parentId);
        }
      }

      element = element.parentElement;
    }
  } else modify.grp = modify.grp.filter((item) => item !== Number(ID)); // Remove child group from modify.grp

  console.log(modify);

  updateList();
};

const manageMarkersDetails = async (ID, lat, lng) => {
  let focus = [];
  mark = markers[`assID-${ID}`];
  focus.push(mark);

  zoomToPoints(focus);

  let select = document.getElementById(`ass-${ID}`);
  select.classList.toggle("selected");
  if (!modify.ass.includes(Number(ID))) {
    modify.ass.push(Number(ID));

    let element = select.parentElement; // Start from the parent
    while (element && element !== document.body) {
      if (element.classList.contains("selection__wrapper")) break;

      if (element.classList.contains("select")) {
        element.classList.remove("selected");

        let id = element.id;
        if (id.startsWith("grp-")) {
          const parentId = Number(id.replace("grp-", ""));
          modify.grp = modify.grp.filter((item) => item !== parentId);
        }
      }

      element = element.parentElement;
    }
  } else modify.ass = modify.ass.filter((item) => item !== Number(ID)); // Remove child group from modify.grp

  console.log(modify);

  updateList();
};

const updateList = async () => {
  const removeSelected = () => {
    document.querySelectorAll(".select--child").forEach((el) => {
      el.classList.remove("selected");
    });
    document.querySelectorAll(".select--text p").forEach((el) => {
      el.classList.remove("selected");
    });
  };
  removeSelected();
  resetMarkerColors();

  modify.grp.forEach((ID) => {
    const select = document.getElementById(`grp-${ID}`);
    const child = select.querySelector(".select--child");
    const textP = select.querySelector(".select--text p");

    child.classList.add("selected");
    textP.classList.add("selected");

    textP.style.userSelect = "none";
    textP.style.webkitUserSelect = "none";
    textP.style.mozUserSelect = "none";

    if (select.classList.contains("selected")) {
      zoomBasedOnGroup(ID);
    } else resetMarkerColors();
  });

  modify.ass.forEach((ID) => {
    const select = document.getElementById(`ass-${ID}`);
    const child = select.querySelector(".select--child");
    const textP = select.querySelector(".select--text p");

    child.classList.add("selected");
    textP.classList.add("selected");

    textP.style.userSelect = "none";
    textP.style.webkitUserSelect = "none";
    textP.style.mozUserSelect = "none";

    const marker = markers[`assID-${ID}`];
    marker.setIcon(yellowMark);
  });
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

async function createHorizontalCrackChart() {
  try {
    const response = await fetch(`${url}/priority_scores`);
    const data = await response.json();

    // Sort by priority (highest score first)
    data.sort(
      (a, b) =>
        b.weighted_crack_score_per_meter - a.weighted_crack_score_per_meter
    );

    const labels = data.map((d) => d.group_name);
    const values = data.map((d) => d.weighted_crack_score_per_meter);

    let ctx;
    try {
      ctx = document.getElementById("crackChart").getContext("2d");
    } catch {
      return;
    }

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Weighted Crack Score per Meter",
            data: values,
            backgroundColor: "rgba(210, 183, 70, 0.6)", // Primary color with opacity
            borderColor: "rgba(210, 183, 70, 1)", // Primary color
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y", // horizontal
        responsive: true,
        maintainAspectRatio: false, // allows full container size
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              display: true,
              color: "rgba(210, 183, 70, 0.1)", // Light primary color for grid
            },
            ticks: {
              color: "#666", // Darker color for better readability
            },
          },
          y: {
            grid: {
              display: true,
              color: "rgba(210, 183, 70, 0.1)", // Light primary color for grid
            },
            ticks: {
              color: "#666", // Darker color for better readability
            },
          },
        },
        elements: {
          bar: {
            barThickness: 25, // fixed bar "height" (since it's horizontal)
            maxBarThickness: 30, // Optional: limit max
          },
        },
        plugins: {
          title: {
            display: true,
            text: "Road Repair Priority by Group",
            color: "#333", // Dark color for title
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Score: ${context.parsed.x.toFixed(2)}`;
              },
            },
            backgroundColor: "rgba(210, 183, 70, 0.9)", // Primary color for tooltip
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 10,
            cornerRadius: 6,
          },
          legend: {
            display: true,
            position: "bottom",
            labels: {
              color: "#666",
              font: {
                size: 12,
              },
            },
          },
        },
        layout: {
          padding: {
            left: 15,
            right: 25,
            top: 15,
            bottom: 15,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating horizontal crack chart:", error);
  }
}

const closeMarkerDetails = async () => {
  markers[`assID-${openedMarkId}`].closePopup();
  markers[`assID-${openedMarkId}`].setIcon(blueMark);
  openedMarkId = 0;
};

const dashboard = async (self) => {
  const navs = document.querySelectorAll(".profile--nav a");
  navs.forEach((n) => n.classList.remove("open"));
  self.classList.add("open");

  const mainPanel = document.querySelector(".mainPanel");
  mainPanel.innerHTML = `
          <div
            class="dashboard h-full w-full mx-auto grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-5"
          >
            <div
              class="selection bg-white h-full w-full rounded-xl flex flex-col overflow-hidden"
            >
              <div class="yellow-part admined" id="toggle-2">
                <h2>Selection</h2>
              </div>

              <div class="selection__wrapper overflow-x-auto flex-1 ml-5 mr-5">
                
              </div>
            </div>

            <div
              class="graph bg-white h-full w-full rounded-xl overflow-hidden"
            >
              <div class="yellow-part admined" id="toggle-2">
                <h2>Top Places With Most Cracks</h2>
              </div>

              <div id="chartContainer" class="w-full h-full relative">
                <canvas id="crackChart" class="w-full h-full"></canvas>
              </div>

            </div>

            <div
              class="detail bg-white h-full w-full rounded-xl lg:col-start-2 lg:row-start-1 lg:row-span-2 overflow-hidden"
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
              class="map bg-white h-full w-full rounded-xl overflow-hidden lg:col-start-3 lg:row-start-1 lg:row-span-2"
            >
              <div id="map" class="w-full h-full z-10"></div>
            </div>
          </div>
  `;

  initMap();

  displayAll();
  createHorizontalCrackChart();
  displayMarkers();
};

const manage = async (self) => {
  const navs = document.querySelectorAll(".profile--nav a");
  navs.forEach((n) => n.classList.remove("open"));
  self.classList.add("open");

  const mainPanel = document.querySelector(".mainPanel");
  mainPanel.innerHTML = `
          <div class="manage h-full w-full mx-auto grid grid-cols-2 gap-5">
            <div
              class="selection bg-white h-full w-full rounded-xl flex flex-col overflow-hidden"
            >
              <div
                class="yellow-part admined flex justify-between mx-5 gap-10"
                id="toggle-2"
              > <a class="btn primary" onclick="groupSelected()">Group</a>
              <a class="btn primary" onclick="ungroupSelected()">Ungroup</a>
                <a class="btn red" onclick="deleteSelected()">Delete</a>
              </div>

              <div id="grp-0" class="selection__wrapper grp overflow-x-auto flex-1 ml-5 mr-5">
                
              </div>
            </div>

            <div class="map bg-white h-full w-full rounded-xl overflow-hidden">
              <div id="map" class="w-full h-full z-10"></div>
            </div>
          </div>
  `;

  initMap();

  await manageAll();
  await manageMarkers();
};

const deleteSelected = async () => {
  // Show the confirmation modal
  const modal = document.getElementById("confirmationModal");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  // Show modal with Tailwind classes for visibility
  modal.classList.remove("hidden");

  // Wait for user response (resolve/reject based on user choice)
  return new Promise((resolve, reject) => {
    confirmBtn.onclick = async () => {
      const selectedData = {
        groups: modify.grp,
        assessments: modify.ass,
      };

      try {
        const response = await fetch(`${url}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedData),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data); // Success message from server

          // Reset modify arrays and update the UI
          modify.grp = [];
          modify.ass = [];
          updateList(); // Update the UI (clear selected states)
        } else {
          const data = await response.json();
          console.log(data.error); // Error message from server
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error deleting selected:", error);
        alert("An error occurred while deleting.");
      }

      // Close the modal after the deletion
      modal.classList.add("hidden");
      resolve(); // Resolve promise indicating deletion completed
    };

    cancelBtn.onclick = () => {
      // Close the modal without deleting
      modal.classList.add("hidden");
      reject("Deletion cancelled"); // Reject promise indicating cancellation
    };
  });
};

// Helper to find top-most parent group (excluding document body)
const getTopGroup = (el) => {
  let current = el;
  let lastGroup = null;
  let check = 0;
  let checking = true;
  while (current && current !== document.body && checking) {
    if (current.classList.contains("grp")) {
      if (check > 1) checking = false;
      lastGroup = current;
    }
    current = current.parentElement;

    check++;
  }
  return lastGroup ? lastGroup.id : null;
};

const groupSelected = async () => {
  const nameModal = document.getElementById("groupNameModal");
  const nameInput = document.getElementById("groupNameInput");
  const confirmGroupBtn = document.getElementById("confirmGroupBtn");
  const cancelGroupBtn = document.getElementById("cancelGroupBtn");

  // Warning Modal elements
  const warningModal = document.getElementById("warningModal");
  const warningMessage = document.getElementById("warningMessage");
  const closeWarningBtn = document.getElementById("closeWarningBtn");

  const selectedGroups = modify.grp;
  const selectedAssessments = modify.ass;

  // Validation: Check if both groups and assessments are selected
  if (selectedGroups.length > 0 && selectedAssessments.length > 0) {
    warningMessage.textContent =
      "You cannot group both groups and assessments at the same time.";
    warningModal.classList.remove("hidden");
    return;
  }

  // Validation: Check if neither groups nor assessments are selected
  if (selectedGroups.length === 0 && selectedAssessments.length === 0) {
    warningMessage.textContent =
      "Please select groups or assessments to group.";
    warningModal.classList.remove("hidden");
    return;
  }

  const items = selectedGroups.length ? selectedGroups : selectedAssessments;
  const type = selectedGroups.length ? "grp" : "ass";
  const prefix = type === "grp" ? "grp-" : "ass-";

  // Check if all items share the same top-level group
  const topLevel = new Set();
  items.forEach((id) => {
    const el = document.getElementById(`${prefix}${id}`);
    const topGroup = getTopGroup(el);
    if (topGroup) topLevel.add(topGroup);
  });

  console.log("topLevel", topLevel);
  // Validation: Check if the selected items belong to the same group
  if (topLevel.size > 1) {
    warningMessage.textContent =
      "Selected items are not from the same top-level group. Please select items from the same group.";
    warningModal.classList.remove("hidden");
    return;
  }

  // Show the modal for the group name input
  nameModal.classList.remove("hidden");
  nameModal.classList.add("flex");

  return new Promise((resolve, reject) => {
    confirmGroupBtn.onclick = async () => {
      const groupName = nameInput.value.trim();
      if (!groupName) {
        warningMessage.textContent = "Please enter a group name.";
        warningModal.classList.remove("hidden");
        return;
      }

      try {
        const response = await fetch(`${url}/group`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: groupName,
            groups: selectedGroups,
            assessments: selectedAssessments,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);

          modify.grp = [];
          modify.ass = [];
          nameInput.value = "";
          updateList();
        } else {
          const data = await response.json();
          warningMessage.textContent = `Error: ${data.error}`;
          warningModal.classList.remove("hidden");
        }
      } catch (error) {
        console.error("Error grouping selected:", error);
        warningMessage.textContent = "An error occurred while grouping.";
        warningModal.classList.remove("hidden");
      }

      nameModal.classList.add("hidden");
      resolve();
    };

    cancelGroupBtn.onclick = () => {
      nameModal.classList.add("hidden");
      reject("Grouping cancelled");
    };
  });
};

const ungroupSelected = async () => {
  const warningModal = document.getElementById("warningModal");
  const warningMessage = document.getElementById("warningMessage");

  const selectedGroups = modify.grp;
  const selectedAssessments = modify.ass;

  // Check if assessments are selected — not allowed
  if (selectedAssessments.length > 0) {
    warningMessage.textContent =
      "You cannot ungroup selected assessments. Only groups can be ungrouped.";
    warningModal.classList.remove("hidden");
    return;
  }

  // Check if no group is selected
  if (selectedGroups.length === 0) {
    warningMessage.textContent = "Please select a group to ungroup.";
    warningModal.classList.remove("hidden");
    return;
  }

  // Only allow one group to be ungrouped at a time
  if (selectedGroups.length > 1) {
    warningMessage.textContent = "You can only ungroup one group at a time.";
    warningModal.classList.remove("hidden");
    return;
  }

  const groupId = selectedGroups[0];

  try {
    const response = await fetch(`${url}/ungroup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ group_id: groupId }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data);
      modify.grp = [];
      updateList();
    } else {
      const data = await response.json();
      warningMessage.textContent = `Error: ${data.error}`;
      warningModal.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error ungrouping:", error);
    warningMessage.textContent = "An error occurred while ungrouping.";
    warningModal.classList.remove("hidden");
  }
};

const closeWarning = async () => {
  document.getElementById("warningModal").classList.add("hidden");
};

// Function to fetch admin profile data
async function fetchAdminProfile() {
  try {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      console.error("No authentication token found");
      return null;
    }

    const response = await fetch("http://localhost:5000/admin/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.error("Authentication failed or token expired");
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

const init = async () => {
  dashboard(document.getElementById("initial"));
  const profile = await fetchAdminProfile();
  document.getElementById("adminEmail").innerHTML = `${profile.email}`
};

init();
