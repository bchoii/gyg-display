import { Socket } from "node:net";

const client = new Socket();

client.connect(9100, "54.254.236.248", () => {
  console.log("Connected to TCP server");
  // You can send data to the server using client.write()
  // For example: client.write("Hello, Server!");
  client.write(`
                             Order# 0123
                      Employee: Employee .
                            Table: Table 1
`);
  console.log("Sent data to server.");
  client.end(); // Close the connection after sending data
});

client.on("data", (data) => {
  console.log("Received data from server:", data.toString());
  // You can process the received data here
});

client.on("close", () => {
  console.log("Connection closed");
});

client.on("error", (err) => {
  console.error("Error:", err);
});

console.log("Done.");
