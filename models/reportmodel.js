const db=require("../config/db")
async function getreport(from,to) {
    const sql=
    `select 
coalesce(sum(ii.unit_price*ii.quantity),0) as revenue,
coalesce(sum(p.cost_price*ii.quantity),0)as cost,
count(distinct i.id) as invoice_count
from invoice i 
join invoice_items ii on ii.invoice_id=i.id
join products p on p.id=ii.product_id
where 
i.created_at between? and ?and i.status!='cancelled' `
const rows=await db.query(sql,[from,to])
const {revenue,cost,invoice_count}=rows[0]
const profit=revenue-cost
return{
    revenue:Number(revenue),
    cost:Number(cost),
    profit:Number(profit),
    invoice_count
} 
}
// GET TOP PRODUCTS////////////////////////////////////////////////////////////
async function gettopproducts(from,to,limit=5){
    const sql=`select p.id,
p.name ,
sum(ii.unit_price*ii.quantity) as revenue
from invoice_items ii
join invocies i on i.id=ii.invoice_id
join products p on p.id=ii.product_id
where i.created_at between ? and ? and 
i.status!='cancelled'
group by p.id
order by revenue desc
limit ?`
const rows=await db.query(sql,[from,to,limit])
return rows;
}

// SALE PER PERSON ///////////////////////////////////////////////////////////////////////
async function saleperperson(from,to){
    const sql=`select u.id as user_name,
 u.name as user_name,
count(distinct i.id) as invoice_count,
sum(ii.unit_price*ii.quantity) as revenue
from invoices i 
join invoice_items ii on ii.invoice_id=i.id
join users u on u.id=i.user_id
where i.created_at between ? and ? and 
i.status!='cancelled'
group by u.id 
order by revenue desc`
const rows=await db.query(sql,[from,to,])
return rows
}
module.exports={getreport,gettopproducts,saleperperson}
