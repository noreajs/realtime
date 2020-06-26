import express from "express";
import http from "http";
import SocketIOServer from "../socket.io/SocketIOServer";
import { Socket, Server } from "socket.io";

const app = express();

const httpServer = http.createServer(app);

/**
 * Socket.io server initialization
 */
const socketIoServer = new SocketIOServer({ server: httpServer }).namespace({
  middlewares: [
    async (socket, fn) => {
      console.log("Here a middleware!");
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

app.get("/", function (req, res) {
  if (res.locals.socketServer) {
    /**
     * Get socket.io Server in a request
     */
    const socketIoServer = res.locals.socketServer as Server;
    socketIoServer.clients((err: any, clients: string[]) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.status(200).send(`Hello world! ${clients.length} users online!!`);
      }
    });
  } else {
    res.send("Hello World");
  }
});

httpServer.listen(3000);
