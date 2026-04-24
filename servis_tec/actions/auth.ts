'use server'
import { RegisterSchema } from '@/lib/zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { z } from 'zod'
import { signOut } from '@/lib/auth'

type RegisterResponse =
  | { success: true }
  | { success: false; errors?: Record<string, string[]>; error?: string }

export async function registerAction(
  values: z.infer<typeof RegisterSchema>
): Promise<RegisterResponse> {
  try {
    const parsed = RegisterSchema.safeParse(values)

    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.flatten().fieldErrors,
      }
    }

    const data = parsed.data

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase().trim() },
          { name: data.name.trim() },
        ],
      },
      select: { id: true },
    })

    if (existing) {
      return {
        success: false,
        error: 'El correo o nombre de usuario ya está registrado',
      }
    }

    const rawName = parsed.data.name.trim();

    // Función simple y efectiva
    const formatName = (str: string): string => {
      return str
        .toLowerCase()                    // todo a minúsculas primero
        .split(/\s+/)                     // dividir por uno o más espacios
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const formattedName = formatName(rawName);

    const passwordHash = await bcrypt.hash(data.password, 10)

    await prisma.user.create({
      data: {
        name: formattedName,
        email: data.email.trim().toLowerCase(),
        password: passwordHash,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error en registerAction:', error)
    return {
      success: false,
      error: 'Error al crear la cuenta. Intenta de nuevo más tarde.',
    }
  }
}


export async function logout() {
  await signOut({ redirectTo: "/login" });
}