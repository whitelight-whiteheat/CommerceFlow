const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrderService {
  // Create order history entry
  static async createOrderHistory(orderId, status, note = null) {
    return prisma.orderHistory.create({
      data: {
        orderId,
        status,
        note
      }
    });
  }

  // Update order status with history tracking
  static async updateOrderStatus(orderId, status, note = null) {
    return prisma.$transaction(async (prisma) => {
      // Update order status
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          user: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Create history entry
      await this.createOrderHistory(orderId, status, note);

      // Emit order status change event
      this.emitOrderStatusChange(order);

      return order;
    });
  }

  // Emit order status change event
  static async emitOrderStatusChange(order) {
    // TODO: Implement WebSocket notification
    // This will be implemented when we add WebSocket support
    
    // For now, we'll just log the status change
    console.log(`Order ${order.id} status changed to ${order.status}`);
    
    // TODO: Send email notification
    // This will be implemented when we add email service
  }

  // Get order history
  static async getOrderHistory(orderId) {
    return prisma.orderHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get orders that need attention (e.g., pending for too long)
  static async getOrdersNeedingAttention() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneHourAgo
        }
      },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }
}

module.exports = OrderService; 