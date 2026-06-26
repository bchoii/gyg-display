import { createServer } from "node:net";
import iconv from "iconv-lite";

console.log(iconv);

const regexp = /Order# (\d+)/gm;

const isString = (value: string | undefined): value is string => {
  return typeof value === "string";
};

const toOrderNumber = (lines: string[]): string[] =>
  lines
    .flatMap((line) => {
      const result = line.matchAll(regexp);
      return [...result][0]?.[1];
    })
    .filter(isString);

const tcpServer = createServer((socket) => {
  console.log("Client connected");

  // let jobBuffer = Buffer.alloc(0);

  socket.on("data", (data) => {
    // jobBuffer = Buffer.concat([jobBuffer, data]);

    console.log("Received data:", data);
    console.log("Received data:", data.toString());
    // const text = iconv.decode(data, "utf8");
    const lines = toOrderNumber(
      data
        .toString()
        .split("\n")
        .map((line) => line.trim()),
    );
    lines.forEach((line) => {
      fetch("http://echo:3000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: line }),
      });
    });
    console.log("Processed data and sent to echo server");
    // Example response: printer OK
    socket.write(Buffer.from([0x00])); // Send ACK to the client

    // socket.end(); // Close the connection after processing data
  });
  socket.on("end", () => {
    console.log("Client disconnected");
  });
  socket.on("error", (err) => {
    console.error(`❌ Socket error:`, err);
  });
});

tcpServer.listen(9100, () => {
  console.log("TCP server is listening on port 9100");
});
