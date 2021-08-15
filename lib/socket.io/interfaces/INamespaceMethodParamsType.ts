import NoreaSocket from "./NoreaSocket";
import { Server, Namespace } from "socket.io";

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
