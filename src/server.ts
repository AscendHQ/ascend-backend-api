import { createServer } from "http";
import app from "./app";
import { config } from "./config/env";

const server = createServer(app);
const { LOCAL_PORT, PORT } = config;

const port = PORT || LOCAL_PORT;
server.listen(port, () => {
  console.log(`server running on *::${port}`);
});
