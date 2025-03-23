const url = "https://legal-sites-pick.loca.lt";

// FUNCTION FOR PROVINCES
async function fetchGroup(param, relation = "") {
  try {
    let link = `${url}/group/${param}`;

    if (relation === "") {
      link = `${url}/group/${param}`;
    } else {
      link = `${url}/group/${param}/${relation}`;
    }
    // if (typeof param === "string") {
    //   link = `${url}/group/${param}`;
    // } else if (typeof param === "number") {
    //   link = `${url}/group/${param}`;
    // } else {
    //   throw new Error("Invalid parameter type. Expected string or number.");
    // }

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
}

const app = Vue.createApp({
  data() {
    return {
      groupLoc: [], // Holds fetched region data
      expandedIndex: null, // Keeps track of which one is expanded
      selectedOption: "region", // This will hold the selected value
      loading: false, // Tracks loading state
      info: null, // Holds detailed information for the expanded item
      assessment: [],
      children: [],
    };
  },
  computed: {
    filteredData() {
      // Return the dataset based on selectedOption
      return this.groupLoc;
    },
  },
  methods: {
    async onOptionChange() {
      // Fetch data when the option changes
      this.groupLoc = await fetchGroup(this.selectedOption);

      this.expandedIndex = null; // Reset expanded index
      if (this.groupLoc.length > 0) {
        const expandedItem = this.groupLoc[0];
        // Call toggleDetails with index 0 and the corresponding ID
        await this.toggleDetails(0, expandedItem.id);
      }
    },
    async toggleDetails(index, id) {
      // If the same item is clicked again, collapse it without fetching data
      if (this.expandedIndex === index) {
        this.expandedIndex = null; // Collapse the details section
        this.info = null; // Clear the info object
        return;
      }

      // Fetch detailed information for the clicked item
      this.info = await fetchGroup(id);
      console.log("Fetched info:", this.info); // Debugging: Log the info object

      this.assessment = await fetchGroup(id, "assessments");

      // Expand the clicked item
      this.expandedIndex = index;
    },
  },
  async created() {
    // Fetch initial data when the component is created
    this.groupLoc = await fetchGroup(this.selectedOption);

    // Automatically expand index 0 if data is available
    if (this.groupLoc.length > 0) {
      const expandedItem = this.groupLoc[0];
      // Call toggleDetails with index 0 and the corresponding ID
      await this.toggleDetails(0, expandedItem.id);
    }
  },
});

app.mount(".map__location");
