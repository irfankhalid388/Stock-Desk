const bcrypt=require("bcrypt")
async function hash(plain) {
    const hashedpassword= await bcrypt.hash(plain,12)
    return hashedpassword
}
async function compare(plain,hashedpassword) {
    const match=await bcrypt.compare(plain,hashedpassword)
    return match
}
module.exports={
    hash,
    compare
};