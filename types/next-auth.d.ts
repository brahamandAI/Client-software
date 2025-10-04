import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      stationId?: string;
    };
  }

  interface User {
    role: string;
    stationId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    stationId?: string;
  }
}
