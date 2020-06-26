import { Socket } from "socket.io";

export default interface NoreaSocket<UserType> extends Socket {
  user?: UserType;
  [key: string]: any;
}
