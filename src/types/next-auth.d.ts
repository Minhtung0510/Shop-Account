import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      balance: number;
      rank: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role?: string;
    balance?: number;
    rank?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    balance: number;
    rank: string;
  }
}
