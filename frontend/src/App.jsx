import { useState, useEffect, useCallback } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import axios from "axios";
import { getLayoutedElements } from "./layout";

// DO NOT REMOVE. Graph won't work
import "reactflow/dist/style.css";

const formStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  zIndex: 4, // Make sure it's on top of the graph
  background: "white",
  padding: "10px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
};

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dept, setDept] = useState("COMP SCI");
  const [number, setNumber] = useState("544");

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
      setError("Failed to load course graph.");
    } finally {
      setLoading(false);
    }
  });

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading graph...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
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
