const url = "http://127.0.0.1:5000";

const login = async (event) => {
  event.preventDefault();

  const loginBtn = document.getElementById("loginBtn");
  const emailOrUsernameInput = document.getElementById("emailOrUsername");
  const passwordInput = document.getElementById("password");

  const warningModal = document.getElementById("warningModal");
  const warningMessage = document.getElementById("warningMessage");
  const closeWarningBtn = document.getElementById("closeWarningBtn");

  const emailOrUsername = emailOrUsernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Basic validation
  if (!emailOrUsername || !password) {
    warningMessage.textContent = "Please fill in all fields.";
    warningModal.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch(`${url}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailOrUsername,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store the token in localStorage
      localStorage.setItem("adminToken", data.token);

      // Redirect to admin page
      window.location.href = "admin.html";
    } else {
      warningMessage.textContent = data.response || "Log in failed.";
      warningModal.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error:", error);
    warningMessage.textContent = error || "An error occurred during sign up";
    warningModal.classList.remove("hidden");
  }

  // Allow form submission with Enter key
  passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loginBtn.click();
    }
  });
};

const closeWarning = async () => {
  document.getElementById("warningModal").classList.add("hidden");
};
