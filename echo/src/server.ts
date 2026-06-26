import { Hono, type Context } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { WebSocketServer, type RawData } from "ws";
import type { Server } from "http";
import { compress } from "hono/compress";
import { HTTPException } from "hono/http-exception";
import { getConnInfo } from "@hono/node-server/conninfo";
// import EventEmitter from "node:events";
import { type HttpBindings } from "@hono/node-server";

import "ws"; // This import is for module augmentation
import type { ConnInfo } from "hono/conninfo";
import { cors } from "hono/cors";

declare module "ws" {
  interface WebSocket {
    isAlive: boolean;
    ip: string;
    room: string;
  }
}

// import { createNodeWebSocket } from "@hono/node-ws";
// const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const app = new Hono<{ Bindings: HttpBindings }>();
app.use("/*", cors());
const server = serve({ fetch: app.fetch, port: 3000 }, (info) =>
  console.log(`Server is running on http://localhost:${info.port}`),
);
const wss = new WebSocketServer({ server: server as Server });

// const eventEmitter = new EventEmitter();
// eventEmitter.emit("message", message);
// eventEmitter.on("message", (message: string) => ws.send(message));

app.post("*", async (c) => {
  const info: ConnInfo = getConnInfo(c);
  // const ip = info.remote.address;
  // const remoteAddress = c.env.incoming.socket.remoteAddress;
  const ip = c.req.header("X-Forwarded-For");
  // const xRealIp = c.req.header("X-Real-IP");
  const room = c.req.path;
  // const { message } = await c.req.parseBody(); // form
  const payload = await c.req.json(); // json fetch
  // const { message } = await c.req.text(); // text
  console.log(`POST`, { ip, room: room, payload });
  wss.clients.forEach((wsclient) => {
    if (room.startsWith(wsclient.room) || wsclient.room.startsWith(room))
      wsclient.send(JSON.stringify(payload));
  });
  return c.json({ ip, room, payload });
});

// app.get("*", serveStatic({ root: "./public" }));
app.get("*", serveStatic({ path: "./public/index.html" }));

app.onError(function (err: Error | HTTPException, c: Context) {
  if (err instanceof HTTPException) return c.text(err.message, err.status);
  return c.text(err.message, 500);
});

const healthCheck = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 3000);

wss.on("close", () => clearInterval(healthCheck));

wss.on("connection", async function (ws, req) {
  // const ip = req.socket.remoteAddress ?? "";
  const ip = String(req.headers["x-forwarded-for"]);
  // const y = req.rawHeaders;
  const room = req.url ?? "/";
  console.log("New connection", { ip, room });
  ws.isAlive = true;
  ws.ip = ip;
  ws.room = room;

  ws.on("error", console.error);

  ws.on("pong", function () {
    this.isAlive = true;
  });

  // ws.on("message", (message: RawData) => ws.send(String(message)));

  ws.on("close", function () {
    console.log("Connection closed");
    this.terminate();
  });

  // for (let index = 0; index < 3; index++) {
  //   ws.send(`${index}`);
  //   await new Promise((r) => setTimeout(r, 1000));
  // }
  // ws.send("Done.");
});

for (const event of ["uncaughtException", "exit", "SIGINT", "SIGTERM"]) {
  process.on(event, () => console.log(event));
}
