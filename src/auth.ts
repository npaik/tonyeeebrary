import NextAuth, { NextAuthConfig } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";

export const authConfig = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  adapter: DrizzleAdapter(db),
  callbacks: {
    async session({ session, user }) {
      // Attach the user's ID to the session
      session.user.id = user.id;
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/protected-path"]; // Define your protected paths here
      const isProtected = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/api/auth/signin", nextUrl.origin);
        redirectUrl.searchParams.append("callbackUrl", nextUrl.href);
        return Response.redirect(redirectUrl);
      }

      return true; // Allow access for non-protected routes
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signOut } = NextAuth(authConfig);
