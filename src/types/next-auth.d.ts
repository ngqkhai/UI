import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    accessToken?: string;
  }
  
  interface Session {
    user: User & {
      id: string;
      accessToken?: string;
    };
  }
}