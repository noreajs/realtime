import { NoreaBootstrap } from "@noreajs/core";
import apiRoutes from "./api.routes";
import { SocketIOServer } from "..";

/**
 * Socket.io server initialization
 */
const socketIoServer = new SocketIOServer().namespace<{}>({
  // middlewares: [
  //   async (socket, fn) => {
  //     // update middleware
  //     console.log("Here, there!");
  //     socket.user = "Arnold" as any;
  //     fn();
  //   },
  // ],
  onConnect: (io, namespace, socket) => {
    console.log(`Namespace ${namespace.name}: Socket ${socket.id} connected`);
    if (socket.user)
      console.log(`Namespace ${namespace.name}: user ${socket.user} connected`);
  },
  onDisconnect: (io, namespace, socket, reason: any) => {
    console.log(
      `Namespace ${namespace.name}: Socket ${socket.id} disconnected`,
      reason
    );
  },
});

/**
 * Create a new NoreaJs App
 */
const app = new NoreaBootstrap(apiRoutes, {
  forceHttps: false,
  beforeStart: (app) => {
    // inject socket.io server to every request
    app.use((req, res, next) => {
      // set socket.io server
      res.locals.socketServer = socketIoServer.getServer();
      // continue the request
      next();
    });
  },
  afterStart: (app, server, port) => {
    console.log("@noreajs/realtime test server");
    console.log("The api is running on port", port);

    // attach the socket server to the http/https server instance
    socketIoServer.attach(server);
  },
});

/**
 * Start your app
 */
app.start(3000);
