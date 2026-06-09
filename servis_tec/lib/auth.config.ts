import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { LoginSchema } from "@/lib/zod";
import { prisma } from "./prisma";

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },

      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
          },
        });

        if (!user?.password) return null;

        const match = await compare(password, user.password);
        if (!match) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          rol: user.role ?? "TECHNICIAN",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
};