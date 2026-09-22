const form =document.getElementById("customerForm")
// CLEAR ERRORS////////////////////////////////////////////////////////
async function clearerror(){
    document.querySelectorAll("[id^='err-']").forEach((span)=>{
        span.textContent=""
    })
    const formError=document.getElementById("formError")
    if(formError){formError.textContent=''}
}
// payload//////////////////////////////////////////////
function getFormPayload() {
  return {
    name:document.getElementById("name").value,
    email:document.getElementById("email").value,
    phone:document.getElementById("phone").value,
    address:document.getElementById("address").value,
  };
}
// showerrors///////////////////////////////////////////////////
function showerrors(errors){
    Object.keys(errors).forEach((field)=>{
       const span= document.getElementById(`err-${field}`)
      if(span){
        span.textContent=errors[field]
      }
    })
}
// FORM///////////////////////////////////////////////////////////////
if(form){
form.addEventListener("submit",async(e)=>{
    e.preventDefault()
    clearerror()


    const payload=getFormPayload()
    const customerId=document.getElementById("customerId").value
    const isEditMode=Boolean(customerId)
    const method=isEditMode? "PUT" : "POST"
    const url=isEditMode ? `/api/customers/${customerId}` : "/api/customers";
    const res=await request(method,url,payload)
    if(res.status===422){
         const data = await res.json();
      showerrors(data.errors);
      return;
    }
     if (!res.ok) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} customer`, res.status);
      const formError = document.getElementById("formError");
      if (formError) {
        formError.textContent = "Something went wrong. Please try again.";
      }
      return;
    }
    window.location.href = "/customers";

})    
}
