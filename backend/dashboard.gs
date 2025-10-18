function buildDashboardSummary_() {
  const orders = listAllOrders_().map(function (entry) {
    return entry.data;
  });
  const products = listProducts_(true);

  const revenue = orders
    .filter(function (order) {
      return order.status === "delivered" || order.status === "received";
    })
    .reduce(function (sum, order) {
      return sum + parseNumber_(order.total);
    }, 0);

  const statusCounts = ORDER_STATUS_FLOW.reduce(function (acc, status) {
    acc[status] = orders.filter(function (order) {
      return order.status === status;
    }).length;
    return acc;
  }, {});

  return {
    metrics: {
      totalOrders: orders.length,
      revenue,
      activeProducts: products.filter(function (product) {
        return product.isActive !== false;
      }).length,
      inventoryCount: products.reduce(function (sum, product) {
        return sum + parseNumber_(product.inventory);
      }, 0)
    },
    statusBreakdown: statusCounts,
    recentOrders: orders
      .sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5)
  };
}
