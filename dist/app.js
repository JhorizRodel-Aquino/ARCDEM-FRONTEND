const url = "https://small-groups-wonder.loca.lt";

//FUNCTION FOR PROVINCES
async function fetchGroup(level) {
  try {
    const response = await fetch(`${url}/group?level=${level}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched provinces:", data);
    return data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return [];
  }
}


// VUE INITIALIZATION AFTER FETCHING
async function initApp() {
  const provinces = await fetchGroup("region");
  console.log(provinces);
  //   const region = await fetchRegion();
  //   const city = await fetchCity();

  const app = Vue.createApp({
    data() {
      return {
        provs: provinces,
        expandedIndex: 0, // Keeps track of which one is expanded
        
      };
    },
    methods: {
      toggleDetails(index, id) {
        this.expandedIndex = this.expandedIndex === index ? null : index;
     },
    },
    mounted() {
      console.log("Provinces Loaded:", this.provs); // Debugging
    },
  });

  app.mount("#app");
}

initApp();
