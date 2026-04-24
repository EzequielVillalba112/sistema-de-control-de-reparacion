import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { LoginSchema } from "@/lib/zod";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },

      authorize: async (credentials) => {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true, email: true, name: true, password: true, role: true },
        });

        if (!user?.password) return null;

        const match = await compare(password, user.password);
        

        if (!match) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          rol: user.role ?? 'TECHNICIAN',
        };
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,  // ← fix aquí
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

    async session({ session, token, user }: { session: any; token: any; user?: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);