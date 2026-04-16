import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Ultra-minimal debug page - bypasses ALL components
export default function DebugSummary() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("DebugSummary: Fetching data for ID:", id);
    fetch(`http://localhost:8081/api/summaries/item/${id}`)
      .then(r => r.json())
      .then(setData)
      .catch(setError);
  }, [id]);

  if (error) {
    return (
      <div style={{padding: '20px', background: 'red', color: 'white'}}>
        <h1>ERROR</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!data) {
    return <div style={{padding: '20px'}}>Loading...</div>;
  }

  // Simply display raw data
  return (
    <div style={{padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap'}}>
      <h1>Debug: Raw Data</h1>
      <div>{JSON.stringify(data, null, 2)}</div>
    </div>
  );
}
