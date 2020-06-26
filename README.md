# Norea.js Realtime
This package is a set of tools intended to facilitate the integration of real time in node.js applications. It is part of the [Norea.js](https://github.com/noreajs/core) framework but can also be used in any other application.



## Features

* **Socket.io** : Start a server socket and use it throughout the application



## Installation

After initializing your Node.js project installed the package as follows:

```powershell
npm install @noreajs/realtime --save
```

**Note for typescript developers**: The package already has his types definitions.



## Socket.io

Socket.IO enables real-time bidirectional event-based communication.

**Express application example** (Typescript)

```typescript
import express from "express";
import http from "http";
import SocketIOServer from "@noreajs/realtime";
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
```

**Norea.js example** (Typescript)

```typescript
import { NoreaBootstrap } from "@noreajs/core";
import apiRoutes from "./api.routes";
import { SocketIOServer } from "..";

/**
 * Socket.io server initialization
 */
const socketIoServer = new SocketIOServer().namespace({
  middlewares: [
    async (socket, fn) => {
      // update middleware
      console.log("Here is a global middleware!");
      fn();
    },
  ],
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
 * Create a new Norea.js App
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
```