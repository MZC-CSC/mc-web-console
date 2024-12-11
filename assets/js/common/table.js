import { TabulatorFull as Tabulator } from 'tabulator-tables';

// var tableCol =[
//   {title:"매수 평균가", field:"avg_buy_price", hozAlign:"left"},
//   {title:"보유수량", field:"balance", hozAlign:"left"},
//   {title:"단위", field:"currency", hozAlign:"left"},
// ]
// var accountsTable = table.createTabulatorTable("accounts-table",dynamicData,tableCol)
export function createTabulatorTable(tableId, tableData,tableColum){
  var table = new Tabulator("#"+tableId, {
    data:tableData,
    layout:"fitColumns",
    columns:tableColum,
  });
  return table
}

// console.log("dynamicData", dynamicData);
// var tharr = ["avg_buy_price",	"avg_buy_price_modified",	"balance",	"currency",	"locked",	"unit_currency"]
// const tableHTML = table.generateCustomHeaderTable(tharr, dynamicData);
// $('#example-table2').html(tableHTML);
export function generateDynamicTable(data) {
  const NoDataHtml = `
  <table class="table card-table table-vcenter">
        <tbody>
          <tr>
              <td>No data available</td>
          </tr>
        </tbody>
  </table>
  `
  const theadTop = `
  <table class="table card-table table-vcenter">
    <thead>
      <tr>
  `
  const theadBottom = `
      </tr>
    </thead>
  `
  const tableTop = `<tbody>`
  const tableBottom = `
    </tbody>
  </table>
  `

  if (!Array.isArray(data) || data.length === 0) {
    return NoDataHtml;
  }
  const headers = Object.keys(data[0]);
  let tableHTML = theadTop
  headers.forEach(header => {
    tableHTML += `<th>${header}</th>`;
  });
  tableHTML += theadBottom

  tableHTML += tableTop
  data.forEach(row => {
    tableHTML += '<tr>';
    headers.forEach(header => {
      tableHTML += `<td>${row[header] !== undefined ? row[header] : 'None'}</td>`;
    });
    tableHTML += '</tr>';
  });

  tableHTML += tableBottom;

  return tableHTML;
}

export function generateCustomHeaderTable(tharr, data) {
const NoDataHtml = `
<table class="table card-table table-vcenter">
      <tbody>
        <tr>
            <td>No data available</td>
        </tr>
      </tbody>
</table>
`
const theadTop = `
<table class="table card-table table-vcenter">
  <thead>
    <tr>
`
const theadBottom = `
    </tr>
  </thead>
`
const tableTop = `<tbody>`
const tableBottom = `
  </tbody>
</table>
`

if (!Array.isArray(data) || data.length === 0) {
  return NoDataHtml;
}
let tableHTML = theadTop
tharr.forEach(header => {
  tableHTML += `<th>${header}</th>`;
});
tableHTML += theadBottom

tableHTML += tableTop
data.forEach(row => {
  tableHTML += '<tr>';
  tharr.forEach(header => {
    tableHTML += `<td>${row[header] !== undefined ? row[header] : 'None'}</td>`;
  });
  tableHTML += '</tr>';
});

tableHTML += tableBottom;

return tableHTML;
}

