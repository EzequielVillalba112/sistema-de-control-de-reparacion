'use server'
import { RegisterSchema } from '@/lib/zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { z } from 'zod'
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";


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

export async function loginUser(
  email: string,
  password: string
) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      error: "El usuario no existe",
    };
  }

  if (!user.password) {
    return {
      success: false,
      error: "El usuario no tiene una contraseña",
    };
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password
  );

  if (!validPassword) {
    return {
      success: false,
      error: "La contraseña es incorrecta",
    };
  }

  //Creacion del token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    }
  );

  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

//Obtener el usuario actual desde el token
export async function getCurrentUser() {
  const token = (await cookies())
    .get("token")
    ?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    return payload;
  } catch {
    return null;
  }
}

export async function logout() {
  (await cookies()).delete("token");
}