import { useState, useEffect } from "react";

import './App.css'


function App() {
  const [data, setData] = useState([]);  

  useEffect(() => {
    // שליפת רשימת הטבלאות מהשרת
    fetch("https://mm02-production.up.railway.app/get_table?table=transactions")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <>
     <table>
      <thead>
        <tr>
        {data.length > 0 && Object.keys(data[0]).map(col => (
              <th key={col} className="border p-2">{col}</th>
            ))}
        </tr>
      </thead>
     </table>
     
    </>
  )
}

export default App
