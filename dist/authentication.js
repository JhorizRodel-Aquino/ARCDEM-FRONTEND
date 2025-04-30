const url = "http://127.0.0.1:5000";

// Authentication check
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is authenticated
  const token = localStorage.getItem("adminToken");
  const email = localStorage.getItem("adminEmail");

  if (!token || !email) {
    // Redirect to login if not authenticated
    window.location.href = "login.html";
    return;
  }

  // Display admin email if element exists
  const adminEmailElement = document.getElementById("adminEmail");
  if (adminEmailElement) {
    adminEmailElement.textContent = email;
  }

  // Handle logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Clear stored data
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminEmail");

      // Redirect to login
      window.location.href = "login.html";
    });
  }

  // Function to make authenticated requests
  window.makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminEmail");
        window.location.href = "login.html";
        return;
      }

      return response;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  // Initialize the admin dashboard
  if (typeof initAdminDashboard === "function") {
    initAdminDashboard();
  }
});

// Override the fetch function to automatically add the token to all requests
const originalFetch = window.fetch;
window.fetch = function (url, options = {}) {
  const token = localStorage.getItem("adminToken");

  if (token && url.startsWith(apiurl)) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return originalFetch(url, options);
};
