const token = new URLSearchParams(location.search).get("token")

document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  const btn = document.getElementById("submitBtn")
  const msg = document.getElementById("msg")
  btn.disabled=true
  btn.textContent="updating"
  document.getElementById("err-newPassword").textContent = ""
  btn.disabled = true
  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        newPassword: document.getElementById("newPassword").value,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      msg.textContent = data.message
      setTimeout(() => (location.href = "/login"), 1500)
      return
    }
    if (data.errors?.newPassword) {
      document.getElementById("err-newPassword").textContent = data.errors.newPassword
    } else {
      msg.textContent = data.error || "Something went wrong"
    }
  } catch {
    msg.textContent = "Network error. Try again."
  }
  btn.disabled = false
})