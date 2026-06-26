import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

const unique = (value: any, index: number, self: any[]): boolean =>
  self.indexOf(value) == index;

export function App2() {
  const [codes, setCodes] = useState<string[]>([]);
  const [audio] = useState(new window.Audio("/chime.mp3"));

  useEffect(() => {
    const ws = new WebSocket("wss://echo.54.254.236.248.sslip.io");

    ws.onmessage = (event) => {
      const message = event.data;
      console.log("Received message:", message);
      audio.play();
      const { orderNumber } = JSON.parse(message);
      flushSync(() => {
        setCodes((prev) => prev.filter((p) => p != orderNumber));
      });
      flushSync(() => {
        setCodes((prev) => [orderNumber, ...prev].slice(0, 8));
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div style={{ display: "grid" }}>
      <div style={{ height: "50px" }}></div>
      <div
        style={{
          fontSize: "100px",
          height: "120px",
        }}
      >
        READY FOR PICK UP
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          margin: "auto",
          // maxWidth: "200px",
        }}
      >
        {codes.map((code) => (
          <div
            key={code}
            className="fadein"
            style={{
              display: "grid",
              placeContent: "center",
              background: "#f5f5f5",
              color: "#121614",
              fontSize: "50px",
              height: "80px",
              border: "1px solid black",
              minWidth: "200px",
              borderRadius: "2px",
              padding: "10px",
              margin: "10px",
            }}
          >
            {code}
          </div>
        ))}
      </div>
    </div>
  );
}
