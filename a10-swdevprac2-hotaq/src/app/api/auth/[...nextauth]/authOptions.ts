import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import getUserProfile from "@/libs/getUserProfile";
import userLogIn from "@/libs/userLogIn";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "alice@eventplanner.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const logInResult = await userLogIn(
          credentials.email,
          credentials.password
        );

        try {
          const profileResult = await getUserProfile(logInResult.token);

          return {
            id: profileResult.data._id,
            _id: profileResult.data._id,
            name: profileResult.data.name,
            email: profileResult.data.email,
            role: profileResult.data.role,
            token: logInResult.token,
          };
        } catch {
          return {
            id: logInResult._id,
            _id: logInResult._id,
            name: logInResult.name,
            email: logInResult.email,
            role: "",
            token: logInResult.token,
          };
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id;
        token.role = user.role;
        token.accessToken = user.token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          _id: token._id,
          role: token.role,
          token: token.accessToken,
        };
      }

      return session;
    },
  },
};
