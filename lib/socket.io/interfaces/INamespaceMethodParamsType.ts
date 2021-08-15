import { Namespace, Server } from "socket.io";
import NoreaSocket from "./NoreaSocket";

export default interface INamespaceMethodParamsType<UserType> {
  /**
   * Namespace name. It is a path string and always start by /
   */
  name?: string;

  /**
   * Middlewares to be applied on every connection
   */
  middlewares?: Array<
    (
      socket: NoreaSocket<UserType>,
      fn: (err?: any) => void
    ) => Promise<void> | void
  >;

  /**
   * This method is called when a room is created
   * @param room created room
   */
  onCreateRoom?: (room: string) => Promise<void> | void;

  /**
   * This method is called when a room is deleted
   * @param room deleted room
   */
  onDeleteRoom?: (room: string) => Promise<void> | void;

  /**
   * This method is called when a client join a room
   * @param room joined room
   * @param id socket id of the client
   */
  onJoinRoom?: (room: string, id: string) => Promise<void> | void;

  /**
   * This method is called when a client leave a room
   * @param room leaved room
   * @param id socket id of the client
   */
  onLeaveRoom?: (room: string, id: string) => Promise<void> | void;

  /**
   * This method is called after each connection
   *
   * @param io - Socket.io Server
   * @param nsp - Namespace
   * @param socket - Socket instance
   */
  onConnect?: (
    io: Server,
    nsp: Namespace,
    socket: NoreaSocket<UserType>
  ) => Promise<void> | void;

  /**
   * This method is called before each deconnection
   *
   * @param io - Socket.io Server
   * @param nsp - Namespace
   * @param socket - Socket instance
   * @param reason - reason of deconnection
   */
  onDisconnecting?: (
    io: Server,
    nsp: Namespace,
    socket: NoreaSocket<UserType>,
    reason: any
  ) => Promise<void> | void;

  /**
   * This method is called after each deconnection
   *
   * @param io - Socket.io Server
   * @param nsp - Namespace
   * @param socket - Socket instance
   * @param reason - reason of deconnection
   */
  onDisconnect?: (
    io: Server,
    nsp: Namespace,
    socket: NoreaSocket<UserType>,
    reason: any
  ) => Promise<void> | void;
}
