const fs = require('fs');
const path = 'd:/HotelBooking/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace customer phone text-primary with text-secondary
content = content.replace(
  /<p className="text-\[9px\] font-bold text-primary">\{book\.customerPhone \|\| ''\}<\/p>/g,
  '<p className="text-[9px] font-bold text-secondary">{book.customerPhone || ""}</p>'
);

// Replace ledger ref id colors
content = content.replace(
  /<span className="text-\[10px\] font-black bg-primary\/10 px-2 py-1 rounded text-primary">\s*#\{book\.id\.substring\(0, 8\)\.toUpperCase\(\)\}\s*<\/span>/g,
  '<span className="text-[10px] font-black bg-secondary/10 px-2 py-1 rounded text-secondary">\n                                 #{book.id.substring(0, 8).toUpperCase()}\n                               </span>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated AdminDashboard.jsx');
