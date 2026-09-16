async function next(conn) {
    let nextnumber=1
    const [rows]=await conn.query(`SELECT invoice_no FROM invoices ORDER BY id DESC LIMIT 1 FOR UPDATE`)
    if(rows.length>0){
        const lastinvoice=rows[0].invoice_no
        const lastnumber=parseInt(lastinvoice.split("-")[1],10)
         nextnumber=lastnumber+1
    }
    const padded=String(nextnumber).padStart(4,'0')
    return  `INV-${padded}`
}
module.exports={next}