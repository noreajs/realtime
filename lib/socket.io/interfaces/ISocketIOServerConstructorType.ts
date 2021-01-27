import NoreaSocket from "./NoreaSocket";

import http from "http";
import https from "https";
import { ServerOptions, Socket } from "socket.io";

export default interface ISocketIOServerConstructorType {
  /**
   * http or https server
   */
  server?: http.Server | https.Server;

  /**
   * Socket.io server options
   */
  options?: Partial<ServerOptions>;

  /**
   * Global middelwares to be applied to each connection whatever the namespace
   */
  globalMiddlewares?: Array<
    (socket: Socket, fn: (err?: any) => void) => Promise<void> | void
  >;
}
