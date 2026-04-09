export function buildQueries(row: any) {

  const fullName = `${row.first} ${row.last}`;
  const agency = row.agency;
  const company = row.company;
  console.log()

  return [
    `https://www.google.com/search?q=${encodeURIComponent(`${fullName} ${company}`)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`${agency} ${company} contract`)}`,
    `https://www.google.com/search?q=${encodeURIComponent(`${fullName} ${company} ${agency}`)}`
  ];    
}