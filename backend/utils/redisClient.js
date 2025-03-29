import dotenv from "dotenv";
import { Redis } from "ioredis";

dotenv.config({ path: "./backend/config/config.env" });

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;
const REDIS_PASS = process.env.REDIS_PASS || "";

const client = new Redis({
  port: REDIS_PORT, // Redis port
  host: REDIS_HOST, // Redis host
  password: REDIS_PASS,
  /* username: "default", // needs Redis >= 6
    password: "my-top-secret",
    db: 0, // Defaults to 0 */
});
client.on("error", (error) => {
  console.log("Error connecting to Redis", error);
});
client.on("ready", () => {
  console.log("Redis is up and running");
});

client.on("end", () => {
  console.log("Disconnected from Redis");
});

export default client;
