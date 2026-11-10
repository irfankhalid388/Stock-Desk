

const form=document.getElementById("forgotForm")
form.addEventListener("submit",async (e)=>{
    e.preventDefault()
    const btn=document.getElementById("submitBtn")
    const msg= document.getElementById("msg")
    btn.disabled=true
    try{
        const res=await fetch("/api/auth/forgot-password",{
            method:"POST",
             headers: { "Content-Type": "application/json" },
             body:JSON.stringify({email:document.getElementById("email").value})
        })
        const data=await res.json().catch(() => ({}))
         document.getElementById("err-email").textContent = data.errors?.email || ""
msg.textContent = data.errors ? "" : (data.message || data.error || "Something went wrong")
         if (res.ok){
            btn.textContent="link sent"
            return 
         }
    }
    catch{
 msg.textContent = "Network error. Try again."
    }
    btn.disabled=false
})