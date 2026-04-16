import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SummaryViewer from "@/components/summaries/SummaryViewer";

// Simplified test component to isolate the issue
export default function SummaryDetailTest() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const GO_BACKEND_URL = "http://localhost:8081";

  useEffect(() => {
    async function fetchSummary() {
      if (!id) {
        setError("Invalid ID");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${GO_BACKEND_URL}/api/summaries/item/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error: {error}</h2>
        <p>ID: {id}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!summary) {
    return <div>No data loaded</div>;
  }

  // Only render the essential part
  return (
    <div style={{ padding: '20px' }}>
      <h1>{summary.title || 'Untitled'}</h1>
      <SummaryViewer summary_text={summary.summary_text} />
      <pre>{JSON.stringify(summary, null, 2)}</pre>
    </div>
  );
}
