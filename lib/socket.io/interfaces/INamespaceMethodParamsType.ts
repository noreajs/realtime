import NoreaSocket from "./NoreaSocket";
import { Server, Namespace } from "socket.io";

export default interface INamespaceMethodParamsType<UserType> {
  name?: string;
  middlewares?: Array<
    (
      socket: NoreaSocket<UserType>,
      fn: (err?: any) => void
    ) => Promise<void> | void
  >;
  onConnect: (
    io: Server,
    nsp: Namespace,
    socket: NoreaSocket<UserType>
  ) => Promise<void> | void;
  onDisconnect: (
    io: Server,
    nsp: Namespace,
    socket: NoreaSocket<UserType>,
    reason: any
  ) => Promise<void> | void;
}
