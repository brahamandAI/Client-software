import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getUserFromRequest } from './auth';

/**
 * Get authenticated user from either JWT token (Flutter app) or NextAuth session (web)
 */
export async function getAuthUser(request: NextRequest) {
  // Try JWT token first (for Flutter app)
  let user = await getUserFromRequest(request);
  
  // If no JWT, try NextAuth session (for web)
  if (!user) {
    const session = await getServerSession(authOptions);
    user = session?.user ? {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      stationId: session.user.stationId,
    } : null;
  }
  
  return user;
}
