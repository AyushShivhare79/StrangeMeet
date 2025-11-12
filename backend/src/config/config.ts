import dotenv from 'dotenv'

dotenv.config()

interface Config {
  port: number
  nodeEnv: string
  clientSideUrl: string
  databaseUrl: string
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientSideUrl: process.env.CLIENT_SIDE_URL!,
  databaseUrl: process.env.DATABASE_URL!
}

export default config
