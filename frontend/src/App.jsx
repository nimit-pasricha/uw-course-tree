import { useState, useEffect, useCallback } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import axios from "axios";
import { getLayoutedElements } from "./layout";
import {
  Box,
  TextField,
  Button,
  CssBaseline,
  CircularProgress,
  Typography,
} from "@mui/material";

// DO NOT REMOVE. Graph won't work
import "reactflow/dist/style.css";

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dept, setDept] = useState("COMP SCI");
  const [number, setNumber] = useState("537");

  const fetchGraph = useCallback(async (fetchDept, fetchNumber) => {
    try {
      setLoading(true);
      const resp = await axios.get(
        `http://127.0.0.1:5000/api/graph/${fetchDept}/${fetchNumber}`
      );

      console.log("API Response:", resp.data);

      if (resp.data.nodes.length === 0) {
        throw new Error("Course not found or has no prerequisites.");
      }

      const initialNodes = resp.data.nodes;
      const initialEdges = resp.data.edges.map((edge) => {
        return {
          ...edge,
          animated: true,
          type: "smoothstep",
        };
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(initialNodes, initialEdges);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setError(null);
    } catch (err) {
      console.error("Error fetching graph data:", err);
      let errorMsg = err.message;
      if (err.response && err.response.status === 404) {
        errorMsg = `Course ${fetchDept} ${fetchNumber} not found.`;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph(dept, number);
  }, [fetchGraph]);

  const handleSearch = (event) => {
    event.preventDefault(); // Prevent full-page reload
    console.log(`Searching for: ${dept} ${number}`);
    fetchGraph(dept, number);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* Resets browser CSS for consistency */}
      <CssBaseline />
      <Box
        component="form" // Renders this Box as a <form> element
        onSubmit={handleSearch}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          gap: 2, // MUI's spacing unit (2 = 16px)
          alignItems: "center",
        }}
      >
        <TextField
          label="Department"
          variant="outlined"
          size="small"
          placeholder="COMP SCI"
          value={dept}
          onChange={(e) => setDept(e.target.value.toUpperCase())}
          sx={{ width: "150px" }}
        />
        <TextField
          label="Number"
          variant="outlined"
          size="small"
          placeholder="537"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          sx={{ width: "100px" }}
        />
        <Button
          type="submit"
          variant="contained" // Gives it the solid blue look
          disabled={loading} // Disables button while loading
        >
          Search
        </Button>

        {/* Show a loading spinner or an error message */}
        {loading && <CircularProgress size={24} sx={{ marginLeft: 1 }} />}
        {error && (
          <Typography color="error" sx={{ marginLeft: 1 }}>
            {error}
          </Typography>
        )}
      </Box>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView // zoom the graph to fit all nodes
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
