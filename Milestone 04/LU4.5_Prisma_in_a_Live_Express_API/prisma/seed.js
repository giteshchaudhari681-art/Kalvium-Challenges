const prisma = require('../src/lib/db');

async function main() {
  const [ada, linus] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ada@example.com' },
      update: { name: 'Ada Lovelace' },
      create: { name: 'Ada Lovelace', email: 'ada@example.com' },
    }),
    prisma.user.upsert({
      where: { email: 'linus@example.com' },
      update: { name: 'Linus Torvalds' },
      create: { name: 'Linus Torvalds', email: 'linus@example.com' },
    }),
  ]);

  await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: { name: 'Mechanical Keyboard', price: 89.99, stock: 10 },
      create: { id: 1, name: 'Mechanical Keyboard', price: 89.99, stock: 10 },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: { name: 'Wireless Mouse', price: 39.99, stock: 15 },
      create: { id: 2, name: 'Wireless Mouse', price: 39.99, stock: 15 },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: { name: 'USB-C Hub', price: 49.99, stock: 0 },
      create: { id: 3, name: 'USB-C Hub', price: 49.99, stock: 0 },
    }),
  ]);

  console.log('Seeded users:', [ada.email, linus.email].join(', '));
  console.log('Seeded products: 1, 2, 3');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
