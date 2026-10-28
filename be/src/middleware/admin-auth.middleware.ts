import { NextFunction, Request, Response } from 'express';
import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

function extractToken(request: Request): string | null {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      return token;
    }
  }

  const customHeader = request.headers['x-admin-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }

  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('admin_token=')) {
        return decodeURIComponent(cookie.substring('admin_token='.length));
      }
      if (cookie.startsWith('better-auth.session_token=')) {
        return decodeURIComponent(cookie.substring('better-auth.session_token='.length));
      }
    }
  }

  return null;
}

export const adminAuthMiddleware = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(request);
    if (!token) {
      throw new DomainError('UNAUTHORIZED', {
        messageKey: 'error.unauthorized',
        status: 401,
      });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new DomainError('UNAUTHORIZED', {
        messageKey: 'error.sessionExpired',
        status: 401,
      });
    }

    if (session.user.role !== 'ADMIN') {
      throw new DomainError('FORBIDDEN', {
        messageKey: 'error.forbidden',
        status: 403,
      });
    }

    response.locals.adminUser = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    };

    next();
  } catch (error: unknown) {
    next(error);
  }
};
