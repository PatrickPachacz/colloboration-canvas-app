import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPos, setPrevPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      ctxRef.current = canvas.getContext("2d");
    }

    // Receive drawing data from other users
    socket.on("draw", ({ x, y, prevX, prevY }) => {
      drawOnCanvas(x, y, prevX, prevY);
    });

    socket.on("clear", () => {
      clearCanvas();
    });

    return () => {
      socket.off("draw");
      socket.off("clear");
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setPrevPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setPrevPos(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !prevPos) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Emit drawing event with previous position
    socket.emit("draw", { x, y, prevX: prevPos.x, prevY: prevPos.y });

    // Draw locally
    drawOnCanvas(x, y, prevPos.x, prevPos.y);

    setPrevPos({ x, y });
  };

  const drawOnCanvas = (x: number, y: number, prevX: number, prevY: number) => {
    if (ctxRef.current) {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(prevX, prevY);
      ctxRef.current.lineTo(x, y);
      ctxRef.current.strokeStyle = "black";
      ctxRef.current.lineWidth = 3;
      ctxRef.current.stroke();
      ctxRef.current.closePath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleClear = () => {
    socket.emit("clear");
    clearCanvas();
  };

  return (
    <div className="App">
      <h1>Real-Time Collaborative Drawing</h1>
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <button onClick={handleClear}>Clear Canvas</button>
    </div>
  );
}

export default App;
