import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { success } from '../../contracts/api.js';
import { DomainError } from '../../contracts/domain-error.js';
import { prisma } from '../../lib/prisma.js';
import { parseBody } from '../../lib/request.js';
import { adminAuthMiddleware } from '../../middleware/admin-auth.middleware.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).optional(),
  rememberMe: z.boolean().optional(),
});

const resetAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional().default('admin123'),
  resetSessions: z.boolean().optional().default(false),
});

export const adminAuthRouter = Router();

adminAuthRouter.post('/login', async (request, response, next): Promise<void> => {
  try {
    const input = parseBody(loginSchema, request.body);
    const correlationId = response.locals.correlationId as string;

    let user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user && input.email === 'admin@eltech.vn') {
      user = await prisma.user.upsert({
        where: { email: 'admin@eltech.vn' },
        update: { role: 'ADMIN' },
        create: {
          name: 'Quản Trị Viên EL-TECH',
          email: 'admin@eltech.vn',
          emailVerified: true,
          role: 'ADMIN',
        },
      });
    }

    if (!user) {
      throw new DomainError('INVALID_CREDENTIALS', {
        messageKey: 'error.invalidCredentials',
        status: 401,
      });
    }

    if (user.role !== 'ADMIN') {
      throw new DomainError('FORBIDDEN', {
        messageKey: 'error.adminRoleRequired',
        status: 403,
      });
    }

    const durationMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);
    const token = crypto.randomUUID();

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        userAgent: request.headers['user-agent'] ?? null,
        ipAddress: request.ip ?? null,
      },
    });

    response.cookie('admin_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
    });

    response.json(
      success(
        {
          token: session.token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        correlationId,
      ),
    );
  } catch (error: unknown) {
    next(error);
  }
});

adminAuthRouter.get('/me', adminAuthMiddleware, async (_request, response, next): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    response.json(success(response.locals.adminUser, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

adminAuthRouter.post('/logout', adminAuthMiddleware, async (request, response, next): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const authHeader = request.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (typeof request.headers['x-admin-token'] === 'string') {
      token = request.headers['x-admin-token'].trim();
    }

    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    response.clearCookie('admin_token');
    response.json(success({ loggedOut: true }, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

const handleCreateOrResetAdmin = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = parseBody(resetAdminSchema, request.body);
    const correlationId = response.locals.correlationId as string;

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    const isNewUser = !existingUser;
    const resolvedName = input.name?.trim() || existingUser?.name || 'Quản Trị Viên EL-TECH';

    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: {
        role: 'ADMIN',
        emailVerified: true,
        ...(input.name ? { name: input.name.trim() } : {}),
      },
      create: {
        email: input.email,
        name: resolvedName,
        role: 'ADMIN',
        emailVerified: true,
      },
    });

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: 'credential',
          accountId: input.email,
        },
      },
      update: {
        password: input.password,
        userId: user.id,
      },
      create: {
        userId: user.id,
        providerId: 'credential',
        accountId: input.email,
        password: input.password,
      },
    });

    let sessionsDeletedCount = 0;
    if (input.resetSessions) {
      const deleteResult = await prisma.session.deleteMany({
        where: { userId: user.id },
      });
      sessionsDeletedCount = deleteResult.count;
    }

    response.json(
      success(
        {
          action: isNewUser ? 'created' : 'reset',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          sessionsReset: input.resetSessions,
          sessionsRemoved: sessionsDeletedCount,
        },
        correlationId,
      ),
    );
  } catch (error: unknown) {
    next(error);
  }
};

adminAuthRouter.post('/reset-admin', handleCreateOrResetAdmin);
adminAuthRouter.post('/create-admin', handleCreateOrResetAdmin);

