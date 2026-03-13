// PMO System - NextAuth Configuration
// Configures authentication with credentials provider.
// Session includes organizationId and role for multi-tenancy enforcement.
//
// Security Features:
// - JWT strategy with httpOnly session cookies (NextAuth default)
// - CSRF protection via NextAuth's double-submit cookie pattern
// - Password verification with bcrypt (10 rounds)
// - Secure cookie settings in production (Secure, SameSite=Lax)
// - Organization soft-delete check prevents access to deactivated orgs
// - No sensitive data (passwords, internal IDs) in JWT token beyond what's needed

import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db/prisma";

const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email (across all organizations, but unique per org)
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
            deletedAt: null,
          },
          include: {
            role: true,
            organization: true,
          },
        });

        if (!user) {
          // Timing-safe: still return null even if user not found
          // bcrypt.compare with a dummy hash prevents timing attacks
          // 유효한 60자 bcrypt 해시 필요 (30자 미달 시 bcryptjs가 즉시 false 반환하여 timing 보호 무력화)
          const DUMMY_BCRYPT_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
          await bcrypt.compare(credentials.password, DUMMY_BCRYPT_HASH);
          return null;
        }

        // Verify password (bcrypt, 10 rounds)
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        // Check organization is not soft-deleted
        if (user.organization.deletedAt) {
          return null;
        }

        // Return user data for session
        // SECURITY: Only include necessary fields in the session token.
        // organizationId is set here and CANNOT be changed by the client.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organizationId,
          role: user.role.name,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // Refresh token every 1 hour
  },

  // Secure cookie configuration
  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      name: isProduction
        ? "__Host-next-auth.csrf-token"
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: isProduction
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, persist user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.organizationId = (user as any).organizationId;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose organizationId and role in session
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).organizationId = token.organizationId as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },

    // Redirect authenticated users to dashboard after login
    async redirect({ url, baseUrl }) {
      // If callback URL is base URL (root), redirect to dashboard
      if (url === baseUrl || url === `${baseUrl}/`) {
        return baseUrl; // Root now shows dashboard after removing template page
      }
      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // For external URLs, redirect to base URL
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.AUTH_SECRET,

  // Security: Disable debug mode in production
  debug: false,
};
