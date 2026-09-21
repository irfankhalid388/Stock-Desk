document.getElementById("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitbtn=e.target.querySelector("button[type='submit']")
      if(submitbtn){
        submitbtn.disabled=true
      }
try{
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: document.getElementById("email").value,
          password: document.getElementById("password").value
        })
      });

      if (res.ok) {
        window.location.href = "/products";
      } else {
        document.getElementById("errorMsg").textContent = "Login failed";
        if(submitbtn){
          submitbtn.disabled=false
        }
      }
    }
    catch(err){
 document.getElementById("errorMsg").textContent = "Login failed";
    if (submitbtn) submitbtn.disabled = false;
    }
    });
