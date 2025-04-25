const url = "https://api.arcdem.site";

document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signupBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  signupBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Basic validation
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await fetch(`${url}/admin/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sign up successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Sign up failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during sign up");
    }
  });
});
