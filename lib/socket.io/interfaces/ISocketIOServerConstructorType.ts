import NoreaSocket from "./NoreaSocket";

import http from "http";
import https from "https";
import { ServerOptions, Socket } from "socket.io";

export default interface ISocketIOServerConstructorType {
  server?: http.Server | https.Server;
  options?: ServerOptions;
  allowedOrigins?: string[];
  globalMiddlewares?: Array<
    (socket: Socket, fn: (err?: any) => void) => Promise<void> | void
  >;
}
