import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw Object.assign(new Error('Email already in use'), { statusCode: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    });
    return user;
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    }
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return user;
  },
};
