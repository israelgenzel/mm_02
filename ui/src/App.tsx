import { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

import './App.css'


function App() {
  const [data, setData] = useState<any[]>([]);  
  const paginationModel = { page: 0, pageSize: 5 };
  const columns = data.length > 0 ? Object.keys(data[0]).map((col) => ({
    field: col,
    headerName: col,
    width: 150,
  })) : [];
  useEffect(() => {
    // שליפת רשימת הטבלאות מהשרת
    fetch("https://mm02-production.up.railway.app/get_table?table=transactions")
   //fetch("http://localhost:3000/get_table?table=transactions")
      .then(res => res.json())
      .then(setData);
      console.log("============");
  }, []);

  return (
    <>
    <Paper sx={{ height: "90%", width: "100%" }}>
        <DataGrid
          rows={data.map((row, index) => ({ id: index, ...row }))}
          columns={columns}
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          checkboxSelection
          sx={{ border: 0 }}
        />
      </Paper>



     {/* <Table className="w-full border-collapse border">
      <thead>
        <tr>
        {data.length > 0 && Object.keys(data[0]).map(col => (
              <th key={col} className="border p-6">{col}</th>
            ))}
        </tr>

      </thead>
      <tbody>
      {data.map((row, index) => (
            <tr key={index} className="border">
              {Object.values(row).map((value: any, i) => (
                <td key={i} className="border p-2">{value}</td>
              ))}
            </tr>
          ))}
      </tbody>
     </Table> */}
     
    </>
  )
}

export default App
