import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

export async function getOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  });
}

export async function getOrderById(id) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
}
