import { Socket } from "socket.io";

export default interface NoreaSocket<UserType> extends Socket {
  user?: UserType;
  disconnectingRooms?: Set<string>;
  [key: string]: any;
}
