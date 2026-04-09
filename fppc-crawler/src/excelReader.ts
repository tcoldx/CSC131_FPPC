import ExcelJS from "exceljs";

export async function getRow() {
  const workbook = new ExcelJS.Workbook();
  console.log("Reading Excel file...");
  await workbook.xlsx.readFile("./data/County of Sonoma_2021 (COI).xlsx");

  const sheet = workbook.worksheets[0]; // first sheet updated in new ExcelJS versions
  if (!sheet) throw new Error("No worksheet found");

  console.log("Worksheets in workbook:", workbook.worksheets.map(s => s.name));

  // header row values for comparison
  const header = sheet.getRow(1);
  const headerValues = [
    header.getCell(1).text.trim(),
    header.getCell(2).text.trim(),
    header.getCell(4).text.trim(),
    header.getCell(12).text.trim(),
  ];

  let row;
  for (let i = 2; i <= sheet.rowCount; i++) {
    const r = sheet.getRow(i);
    const last = r.getCell(1).text.trim();
    const first = r.getCell(2).text.trim();
    const agency = r.getCell(4).text.trim();
    const company = r.getCell(12).text.trim();

    // Skip row if it matches header exactly or is completely empty
    if (
      last === headerValues[0] &&
      first === headerValues[1] &&
      agency === headerValues[2] &&
      company === headerValues[3]
    ) continue;

    if (last || first || company) { // first real row
      row = r;
      break;
    }
  }

  if (!row) throw new Error("No data found in Excel sheet");

  return {
    last: row.getCell(1).text.trim() || "N/A",
    first: row.getCell(2).text.trim() || "N/A",
    agency: row.getCell(4).text.trim() || "N/A",
    company: row.getCell(12).text.trim() || "N/A",
  };
}