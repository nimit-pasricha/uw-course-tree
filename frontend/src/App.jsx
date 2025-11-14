import { useState, useEffect } from "react";
import Reactflow, { Minimap, Controls, Background } from "reactflow";
import axios from "axios";

import "reactflow/dist/style.css";

const API_URL = "http://127.0.0.1:5000/api/graph/COMP%20SCI/537";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getGraphData = async () => {
      try {
        setLoading(true);
        const resp = await axios.get(API_URL);

        console.log("API Response:", response.data);

        setNodes(response.data.nodes);
        setEdges(response.data.edges);
        setError(null);
      } catch (err) {
        console.error("Error fetching graph data:", err);
        setError("Failed to load course graph.");
      } finally {
        setLoading(false);
      }
    };

    getGraphData();
  }, []);
}
