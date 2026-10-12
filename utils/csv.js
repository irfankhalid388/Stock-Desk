function escapecsv(v){
if(v===null || v=== undefined){
    return "";
}
let s= string(v)
 if (/^[=+\-@]/.test(s)) s = "'" + s;   // stops Excel formulas
  if (/[",\n\r]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
// CREATING CSV////////////////////////////////////////////////////
function tocsv(rows,columns){
const header=columns.join(',')
 const lines = rows.map(r => columns.map(c => escapeValue(r[c])).join(','));
  return [header, ...lines].join('\r\n');
}
// exporting///////////////////////////////////////
module.exports={tocsv}
