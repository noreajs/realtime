import express from "express";
import http from "http";
import SocketIOServer from "../socket.io/SocketIOServer";
import { Socket, Server } from "socket.io";

const app = express();

const httpServer = http.createServer(app);

/**
 * Socket.io server initialization
 */
const socketIoServer = new SocketIOServer({
  server: httpServer,
  options: {
    cors: {
      origin: "*",
      allowedHeaders: ["x-token"],
      credentials: false,
    },
  },
}).namespace({
  name: "/main",
  middlewares: [
    async (socket, fn) => {

      console.log("Here a middleware!", (socket.handshake.headers as any)["x-token"]);
      // always call fn at the end of a middleware
      fn();
    },
  ],
  onConnect: (io, namespace, socket) => {
    console.log(`Namespace ${namespace.name}: Socket ${socket.id} connected`);
  },
  onDisconnect: (io, namespace, socket, reason: any) => {
    console.log(
      `Namespace ${namespace.name}: Socket ${socket.id} disconnected`,
      reason
    );
  },
});

/**
 * Inject socket.io server to every request
 */
app.use((req, res, next) => {
  // set socket.io server
  res.locals.socketServer = socketIoServer.getServer();
  // continue the request
  next();
});

app.get("/", async function (req, res) {
  if (res.locals.socketServer) {
    /**
     * Get socket.io Server in a request
     */
    const socketIoServer = res.locals.socketServer as Server;

    const clientsCount = await socketIoServer.allSockets();
    return res
      .status(200)
      .send(`Hello world! ${clientsCount.size} users online!!`);
  } else {
    res.send("Hello World");
  }
});

httpServer.listen(3030);

console.log("Runing on ", 3030);
