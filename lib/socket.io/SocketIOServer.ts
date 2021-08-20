import {
  ISocketIOServerConstructorType,
  INamespaceMethodParamsType,
} from "./interfaces";
import { Server, Socket, ServerOptions, Namespace } from "socket.io";
import http from "http";
import https from "https";

export default class SocketIOServer {
  static readonly DEFAULT_NAMESPACE_NAME = "/";
  private socketServer: Server;
  private namespaces?: {
    [key: string]: Namespace;
  };
  private globalMiddlewares?: Array<
    (socket: Socket, fn: (err?: any) => void) => Promise<void> | void
  >;

  constructor(params?: ISocketIOServerConstructorType) {
    // create a socket.io server
    this.socketServer = params?.server
      ? new Server(params.server, params.options)
      : new Server(params?.options);

    // global middlewares
    this.globalMiddlewares = params?.globalMiddlewares;
  }

  /**
   * Attach the socket server to the http or https server instance
   * @param server HTTP or HTTPS server
   * @param opts socket server options
   */
  attach(
    server: http.Server | https.Server,
    opts?: ServerOptions
  ): SocketIOServer {
    this.socketServer.attach(server, opts);
    return this;
  }

  /**
   * Get the socket.io server
   */
  getServer() {
    return this.socketServer;
  }

  /**
   * Get socket.io server
   * @returns SocketIOServer.socketServer
   */
  io() {
    return this.socketServer;
  }

  /**
   * Get initiated namespaces
   */
  getNamespaces() {
    return this.namespaces;
  }

  /**
   * Get a namespace by his path
   * @param path path of the namespace
   */
  getNamespace(path?: string) {
    if (this.namespaces) {
      return this.namespaces[path ?? SocketIOServer.DEFAULT_NAMESPACE_NAME];
    } else {
      return undefined;
    }
  }

  /**
   * Get room's sockets in a room
   * @param nsp namespace name
   * @param room targeted room
   */
  async getRoomSockets(nsp: string, room: string): Promise<Set<string>> {
    return this.socketServer.of(nsp).adapter.sockets(new Set([room]));
  }

  async emitToRoom(
    nsp: string,
    room: string,
    event: string | symbol,
    ...args: any[]
  ): Promise<number> {
    const sockets = await this.getRoomSockets(room, nsp);
    for (const socketId of sockets) {
      this.socketServer.to(socketId).emit(event, ...args);
    }
    return sockets.size;
  }

  /**
   * Initialize a namespace
   * @param params parameters
   */
  namespace<UserType>(params: INamespaceMethodParamsType<UserType>) {
    // namespace path
    const path = params.name ?? SocketIOServer.DEFAULT_NAMESPACE_NAME;

    // namespace name must start by /
    if (!path.startsWith(SocketIOServer.DEFAULT_NAMESPACE_NAME)) {
      throw Error("The namespace name is a path and must start with /");
    }

    // check if the namespace with this name is already defined
    if (this.namespaces && Object.keys(this.namespaces).includes(path)) {
      throw Error(`Namespace ${path} has already been defined.`);
    }

    // init namespace
    this.socketServer.of(path);

    // inject global middlewares
    if (this.globalMiddlewares) {
      for (const middleware of this.globalMiddlewares) {
        this.socketServer.of(path).use(middleware);
      }
    }

    // inject middlewares
    if (params.middlewares) {
      for (const middleware of params.middlewares) {
        this.socketServer.of(path).use(middleware);
      }
    }

    /**
     * Inject adapter injection
     */
    params.adapter?.(this.socketServer.of(path).adapter);

    /**
     * Room events
     * -------------------
     */
    // room was created
    this.socketServer.of(path).adapter.on("create-room", (room: string) => {
      params.onCreateRoom?.(room);
    });

    // room was deleted
    this.socketServer.of(path).adapter.on("delete-room", (room: string) => {
      params.onDeleteRoom?.(room);
    });

    // room was joined
    this.socketServer
      .of(path)
      .adapter.on("join-room", (room: string, id: string) => {
        params.onJoinRoom?.(room, id);
      });

    // room was leaved
    this.socketServer
      .of(path)
      .adapter.on("leave-room", (room: string, id: string) => {
        params.onLeaveRoom?.(room, id);
      });

    /**
     * Connection & disconnection
     */
    this.socketServer.of(path).on("connection", (socket: Socket) => {
      // on connect
      params.onConnect?.(this.socketServer, this.socketServer.of(path), socket);

      // on disconnecting
      socket.on("disconnecting", (reason) => {
        // inject current socket rooms
        (socket as any).disconnectingRooms = socket.rooms;

        params.onDisconnecting?.(
          this.socketServer,
          this.socketServer.of(path),
          socket,
          reason
        );
      });

      // on disconnect
      socket.on("disconnect", (reason) => {
        params.onDisconnect?.(
          this.socketServer,
          this.socketServer.of(path),
          socket,
          reason
        );
      });
    });

    // set the namespace
    if (this.namespaces) {
      this.namespaces[path] = this.socketServer.of(path);
    } else {
      this.namespaces = {};
      this.namespaces[path] = this.socketServer.of(path);
    }

    // return the socket io
    return this;
  }
}
