import * as form from '../common/formatter';
import * as http from '../common/http';
import * as table from '../common/table';

http.get("/api/upbit/accountsget")
  .then(data => {
      var tableCol =[
        {title:"단위", field:"currency", hozAlign:"left"},
        {title:"매수 평균가", field:"avg_buy_price", hozAlign:"left"},
        {title:"보유수량", field:"balance", hozAlign:"left"},
      ]
      var accountsTable = table.createTabulatorTable("accounts-table",data,tableCol)
  })
  .catch(error => {
      console.error("Error fetching data:", error);
  });

  $('#id1').html(form.krwwon.format(1000000000));