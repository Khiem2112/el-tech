import crypto from 'node:crypto';
import { DomainError } from '../contracts/domain-error.js';
import { prisma } from '../lib/prisma.js';

export type AuthUserDto = {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'customer' | 'admin';
  address?: string;
  addressNote?: string;
  createdAt: string;
};

export type AuthResponseDto = {
  token: string;
  user: AuthUserDto;
};

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) {
    return false;
  }
  const hash = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return crypto.timingSafeEqual(hash, keyBuffer);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/[\s.-]/g, '');
}

export const authService = {
  async register(input: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<AuthResponseDto> {
    const email = normalizeEmail(input.email);
    const phone = normalizePhone(input.phone);
    const name = input.name.trim();

    if (!email || !email.includes('@')) {
      throw new DomainError('INVALID_EMAIL', {
        messageKey: 'error.invalidEmail',
        status: 400,
      });
    }

    if (!phone || phone.length < 9) {
      throw new DomainError('INVALID_PHONE', {
        messageKey: 'error.invalidPhone',
        status: 400,
      });
    }

    if (!name) {
      throw new DomainError('INVALID_NAME', {
        messageKey: 'error.invalidName',
        status: 400,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new DomainError('EMAIL_ALREADY_EXISTS', {
        messageKey: 'error.emailAlreadyExists',
        status: 409,
      });
    }

    const durationMs = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);
    const token = crypto.randomUUID();

    const hashedPassword = input.password ? hashPassword(input.password) : undefined;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          emailVerified: true,
          role: 'CUSTOMER',
        },
      });

      if (hashedPassword) {
        await tx.account.create({
          data: {
            userId: user.id,
            providerId: 'credential',
            accountId: email,
            password: hashedPassword,
          },
        });
      }

      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          name,
          email,
          phone,
          emailVerifiedAt: new Date(),
          phoneVerifiedAt: new Date(),
        },
      });

      const session = await tx.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent: input.userAgent ?? null,
          ipAddress: input.ipAddress ?? null,
        },
      });

      return { user, customer, session };
    });

    return {
      token: result.session.token,
      user: {
        id: result.user.id,
        customerId: result.customer.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.customer.phone,
        avatar: result.user.image ?? undefined,
        role: 'customer',
        createdAt: result.user.createdAt.toISOString(),
      },
    };
  },

  async login(input: {
    identifier: string;
    password?: string;
    rememberMe?: boolean;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<AuthResponseDto> {
    const rawIdentifier = input.identifier.trim();
    if (!rawIdentifier) {
      throw new DomainError('INVALID_CREDENTIALS', {
        messageKey: 'error.invalidCredentials',
        status: 401,
      });
    }

    let user = null;
    let customer = null;

    if (rawIdentifier.includes('@')) {
      const email = normalizeEmail(rawIdentifier);
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          accounts: true,
          customer: true,
        },
      });
      customer = user?.customer ?? null;
    } else {
      const phone = normalizePhone(rawIdentifier);
      const foundCustomer = await prisma.customer.findFirst({
        where: { phone, isActive: true },
        include: {
          user: {
            include: {
              accounts: true,
              customer: true,
            },
          },
        },
      });
      if (foundCustomer?.user) {
        user = foundCustomer.user;
        customer = foundCustomer;
      }
    }

    if (!user) {
      throw new DomainError('INVALID_CREDENTIALS', {
        messageKey: 'error.invalidCredentials',
        status: 401,
      });
    }

    const credentialAccount = user.accounts.find((acc) => acc.providerId === 'credential');
    if (credentialAccount?.password) {
      if (!input.password || !verifyPassword(input.password, credentialAccount.password)) {
        throw new DomainError('INVALID_CREDENTIALS', {
          messageKey: 'error.invalidCredentials',
          status: 401,
        });
      }
    }

    const durationMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);
    const token = crypto.randomUUID();

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    });

    return {
      token: session.token,
      user: {
        id: user.id,
        customerId: customer?.id ?? user.id,
        name: user.name,
        email: user.email,
        phone: customer?.phone ?? '',
        avatar: user.image ?? undefined,
        role: user.role === 'ADMIN' ? 'admin' : 'customer',
        createdAt: user.createdAt.toISOString(),
      },
    };
  },

  async loginWithGoogle(input: {
    email: string;
    name?: string;
    avatar?: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<AuthResponseDto> {
    const email = normalizeEmail(input.email);
    const name = input.name?.trim() || 'Khách Hàng Google';
    const avatar = input.avatar ?? null;

    const durationMs = 30 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);
    const token = crypto.randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email },
        include: { customer: true, accounts: true },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            name,
            email,
            emailVerified: true,
            image: avatar,
            role: 'CUSTOMER',
          },
          include: { customer: true, accounts: true },
        });
      }

      const hasGoogleAccount = user.accounts.some((acc) => acc.providerId === 'google');
      if (!hasGoogleAccount) {
        await tx.account.create({
          data: {
            userId: user.id,
            providerId: 'google',
            accountId: email,
          },
        });
      }

      let customer = user.customer;
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: '0988234567',
            emailVerifiedAt: new Date(),
            phoneVerifiedAt: new Date(),
          },
        });
      }

      const session = await tx.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent: input.userAgent ?? null,
          ipAddress: input.ipAddress ?? null,
        },
      });

      return { user, customer, session };
    });

    return {
      token: result.session.token,
      user: {
        id: result.user.id,
        customerId: result.customer.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.customer.phone,
        avatar: result.user.image ?? undefined,
        role: result.user.role === 'ADMIN' ? 'admin' : 'customer',
        createdAt: result.user.createdAt.toISOString(),
      },
    };
  },

  async getMe(token: string): Promise<AuthUserDto | null> {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const { user } = session;
    const customer = user.customer;

    return {
      id: user.id,
      customerId: customer?.id ?? user.id,
      name: user.name,
      email: user.email,
      phone: customer?.phone ?? '',
      avatar: user.image ?? undefined,
      role: user.role === 'ADMIN' ? 'admin' : 'customer',
      createdAt: user.createdAt.toISOString(),
    };
  },

  async logout(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    });
  },

  async updateProfile(
    userId: string,
    updates: {
      name?: string;
      phone?: string;
      address?: string;
      addressNote?: string;
    },
  ): Promise<AuthUserDto> {
    const updated = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { id: userId },
        include: { customer: true },
      });

      if (!user) {
        throw new DomainError('USER_NOT_FOUND', {
          messageKey: 'error.userNotFound',
          status: 404,
        });
      }

      if (updates.name && updates.name.trim()) {
        user = await tx.user.update({
          where: { id: userId },
          data: { name: updates.name.trim() },
          include: { customer: true },
        });
      }

      let customer = user.customer;
      if (customer) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            ...(updates.name ? { name: updates.name.trim() } : {}),
            ...(updates.phone ? { phone: normalizePhone(updates.phone) } : {}),
          },
        });
      }

      return { user, customer };
    });

    return {
      id: updated.user.id,
      customerId: updated.customer?.id ?? updated.user.id,
      name: updated.user.name,
      email: updated.user.email,
      phone: updated.customer?.phone ?? '',
      avatar: updated.user.image ?? undefined,
      role: updated.user.role === 'ADMIN' ? 'admin' : 'customer',
      address: updates.address,
      addressNote: updates.addressNote,
      createdAt: updated.user.createdAt.toISOString(),
    };
  },
};
