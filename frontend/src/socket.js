import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // connect to backend WS

export default socket;
