import * as XLSX from "xlsx";

async function importForm700() {
  const workbook = XLSX.readFile("data/form700.xlsx");

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];


const rows = XLSX.utils.sheet_to_json<any>(worksheet);




/*const cleanedRows = rawRows.map((row) => ({
  lastName: row["Last Name"],
  firstName: row["First Name"],
  middleName: row["Middle Name"] || null,
  agency: row["Agency"],
  position: row["Position"],
  email: row["Work Email Address"],
  filingType: row["Filing Type"],
  filingYear: row["Filing Year"],
  businessName: row["NAME OF BUSINESS ENTITY"],
  businessDescription: row["GENERAL DESCRIPTION OF\r\nTHIS BUSINESS ACTIVITY"],
  valueRange: row["FAIR MARKET VALUE\r\n(Select from drop down list)"],
  investmentType: row["NATURE OF INVESTMENT \r\n(Select from drop down list. \r\nIf \"other,\" describe)"],
})); */

  /*console.log(rows);*/

for (const row of rows) {
      const response = await fetch("http://localhost:3000/api/form700", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(row),
      });

      const result = await response.json();
      console.log(result);
    }

  }
/*const firstRow = rows[0];

const response = await fetch("http://localhost:3000/api/form700", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(firstRow),
});

const result = await response.json();
console.log(result);
}*/


importForm700(); 