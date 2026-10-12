const msg = document.getElementById("msg")
const form = document.getElementById("pwForm")
const showBtn = document.getElementById("showPwBtn")

// 1. load the user's info (/api/auth/me returns the user object directly)
;(async () => {
  try {
     await window.authReady 
    const res = await request("GET", "/api/auth/me")
    if (!res.ok) {
      msg.textContent = "Could not load your profile."
      return
    }
    const user = await res.json()
    document.getElementById("pName").textContent = user.name
    document.getElementById("pEmail").textContent = user.email
    document.getElementById("pRole").textContent = user.role
  } catch {
    msg.textContent = "Could not load your profile."
  }
})()

// 2. show and hide the change-password form
showBtn.addEventListener("click", () => {
  form.hidden = false
  showBtn.hidden = true
})

document.getElementById("pwCancel").addEventListener("click", () => {
  form.reset()
  clearFieldErrors()
  msg.textContent = ""
  form.hidden = true
  showBtn.hidden = false
})

// 3. submit the password change
form.addEventListener("submit", async (e) => {
  e.preventDefault()
  const btn = document.getElementById("pwSubmit")
  clearFieldErrors()
  msg.textContent = ""
  btn.disabled = true

  try {
    const res = await request("POST", "/api/auth/change-password", {
      currentPassword: document.getElementById("currentPassword").value,
      newPassword: document.getElementById("newPassword").value,
    })
    const data = await readJson(res)

    if (res.ok) {
      msg.textContent = data.message || "Password updated. Please log in again."
      setTimeout(() => (location.href = "/login"), 1500)
      return // button stays disabled
    }

    // errors that match a field (err-currentPassword, err-newPassword) show there,
    // anything else goes to the general message
    const leftover = showFieldErrors(data.errors)
    if (!data.errors || leftover.length) {
      msg.textContent = leftover[0] || data.error || messageFor(res.status, data)
    }
  } catch {
    msg.textContent = "Network error. Try again."
  }
  btn.disabled = false // only reached on failure, so the user can retry
})