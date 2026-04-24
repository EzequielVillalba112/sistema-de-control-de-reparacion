import { PrismaClient } from "@/app/generated/prisma/client"; 
//postgres adapter
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Crea un pool de conexiones (mejor para producción y evita warnings de conexiones exhaustas)
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);

// Cliente Prisma con adapter (sin Accelerate)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,  // ← esto resuelve el error de tipo y el requirement de accelerateUrl/adapter
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}