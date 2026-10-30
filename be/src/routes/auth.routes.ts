import { NextFunction, Request, Response, Router } from 'express';
import { z } from 'zod';
import { success } from '../contracts/api.js';
import { DomainError } from '../contracts/domain-error.js';
import { parseBody } from '../lib/request.js';
import { authService } from '../services/auth.service.js';

const registerSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ và tên'),
  email: z.string().email('Email không đúng định dạng'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  password: z.string().min(4, 'Mật khẩu phải có ít nhất 4 ký tự').optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc số điện thoại'),
  password: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

const googleAuthSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  addressNote: z.string().optional(),
});

function extractCustomerToken(request: Request): string | null {
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      return token;
    }
  }

  const customHeader = request.headers['x-auth-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }

  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('customer_token=')) {
        return decodeURIComponent(cookie.substring('customer_token='.length));
      }
    }
  }

  return null;
}

export const authRouter = Router();

authRouter.post('/register', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const input = parseBody(registerSchema, request.body);

    const result = await authService.register({
      ...input,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    response.status(201).json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

authRouter.post('/login', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const input = parseBody(loginSchema, request.body);

    const result = await authService.login({
      ...input,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

authRouter.post('/google', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const input = parseBody(googleAuthSchema, request.body);

    const result = await authService.loginWithGoogle({
      ...input,
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    response.json(success(result, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

authRouter.get('/me', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const token = extractCustomerToken(request);

    if (!token) {
      throw new DomainError('UNAUTHORIZED', {
        messageKey: 'error.unauthorized',
        status: 401,
      });
    }

    const user = await authService.getMe(token);
    if (!user) {
      throw new DomainError('UNAUTHORIZED', {
        messageKey: 'error.sessionExpired',
        status: 401,
      });
    }

    response.json(success(user, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

authRouter.post('/logout', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const token = extractCustomerToken(request);

    if (token) {
      await authService.logout(token);
    }

    response.json(success({ loggedOut: true }, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

authRouter.patch('/profile', async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const correlationId = response.locals.correlationId as string;
    const token = extractCustomerToken(request);

    if (!token) {
      throw new DomainError('UNAUTHORIZED', {
        messageKey: 'error.unauthorized',
        status: 401,
      });
    }

    const currentUser = await authService.getMe(token);
    if (!currentUser) {
      throw new DomainError('UNAUTHORIZED', {
        messageKey: 'error.sessionExpired',
        status: 401,
      });
    }

    const updates = parseBody(updateProfileSchema, request.body);
    const updated = await authService.updateProfile(currentUser.id, updates);

    response.json(success(updated, correlationId));
  } catch (error: unknown) {
    next(error);
  }
});

