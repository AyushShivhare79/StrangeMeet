import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  clientSideUrl: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  clientSideUrl: process.env.CLIENT_SIDE_URL || "http://localhost:5173",
};

export default config;
