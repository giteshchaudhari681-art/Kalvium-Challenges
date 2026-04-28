const prisma = require('./lib/db');

async function purchaseItem(req, res) {
  try {
    const userId = Number(req.body.userId);
    const productId = Number(req.body.productId);

    if (!Number.isInteger(userId) || !Number.isInteger(productId)) {
      return res.status(400).json({ error: 'userId and productId must be valid integers' });
    }

    const order = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });

      if (!product) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }

      const stockUpdate = await tx.product.updateMany({
        where: {
          id: productId,
          stock: { gt: 0 },
        },
        data: { stock: { decrement: 1 } },
      });

      if (stockUpdate.count === 0) {
        const error = new Error('Product is out of stock');
        error.statusCode = 400;
        throw error;
      }

      return tx.order.create({
        data: { userId, productId, quantity: 1 },
      });
    });

    res.status(201).json({ order });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

async function getOrdersByUser(req, res) {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'User id must be a valid integer' });
    }

    const orders = await prisma.order.findMany({ where: { userId } });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { purchaseItem, getOrdersByUser };
