const url = "http://127.0.0.1:5000";
let shouldRedirect = false; 

const signup = async (event) => {
  event.preventDefault(); // Prevent form from submitting traditionally

  const signupBtn = document.getElementById("signupBtn");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  const warningModal = document.getElementById("warningModal");
  const warningMessage = document.getElementById("warningMessage");
  const closeWarningBtn = document.getElementById("closeWarningBtn");

  // Basic validation
  if (!username || !email || !password || !confirmPassword) {
    warningMessage.textContent = "Please fill in all fields.";
    warningModal.classList.remove("hidden");
    return;
  }

  if (password !== confirmPassword) {
    warningMessage.textContent = "Passwords do not match.";
    warningModal.classList.remove("hidden");
    return;
  }

  // Password strength validation
  if (password.length < 8) {
    warningMessage.textContent = "Passwords must be 8 characters long.";
    warningModal.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch(`${url}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    console.log(
      JSON.stringify({
        username,
        email,
        password,
      })
    );

    const data = await response.json();

    if (response.ok) {
      warningMessage.textContent =
        "Your sign-up was successful. Please await account approval from the administrator via email.";
      closeWarningBtn.textContent = "Okay";
      warningModal.classList.remove("hidden");
      shouldRedirect = true;
    } else {
      warningMessage.textContent = data.response || "Sign up failed.";
      warningModal.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Error:", error);
    warningMessage.textContent = error || "An error occurred during sign up";
    warningModal.classList.remove("hidden");
  }
};

const closeWarning = async () => {
  document.getElementById("warningModal").classList.add("hidden");

  if (shouldRedirect) {
    window.location.href = "login.html";
  }
};
