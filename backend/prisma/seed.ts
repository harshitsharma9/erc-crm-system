import { PrismaClient, Role, StockMovementType, ChallanStatus, CustomerStatus, CustomerType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const credentials = {
  password: 'Password123',
  admin: 'admin@company.com',
  sales: 'sales@company.com',
  warehouse: 'warehouse@company.com',
  accounts: 'accounts@company.com',
};

async function main() {
  const password = await bcrypt.hash(credentials.password, 10);

  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const [admin, sales, warehouse, accounts] = await Promise.all([
    prisma.user.create({ data: { name: 'Demo Admin', email: credentials.admin, password, role: Role.ADMIN } }),
    prisma.user.create({ data: { name: 'Demo Sales', email: credentials.sales, password, role: Role.SALES } }),
    prisma.user.create({ data: { name: 'Demo Warehouse', email: credentials.warehouse, password, role: Role.WAREHOUSE } }),
    prisma.user.create({ data: { name: 'Demo Accounts', email: credentials.accounts, password, role: Role.ACCOUNTS } }),
  ]);

  const [accessories, peripherals] = await Promise.all([
    prisma.category.create({ data: { name: 'Computer Accessories', description: 'Everyday office accessories' } }),
    prisma.category.create({ data: { name: 'Peripherals', description: 'Input and output devices' } }),
  ]);

  const [mouse, keyboard, monitor] = await Promise.all([
    prisma.product.create({ data: { name: 'Wireless Mouse', sku: 'MOUSE-001', unitPrice: 400, currentStock: 5, minimumStock: 5, warehouseLocation: 'A-01', categoryId: accessories.id } }),
    prisma.product.create({ data: { name: 'Mechanical Keyboard', sku: 'KEYBOARD-001', unitPrice: 800, currentStock: 14, minimumStock: 5, warehouseLocation: 'A-02', categoryId: peripherals.id } }),
    prisma.product.create({ data: { name: '24-inch Monitor', sku: 'MONITOR-001', unitPrice: 9500, currentStock: 3, minimumStock: 4, warehouseLocation: 'B-01', categoryId: peripherals.id } }),
  ]);

  const [abcTraders, metroStores, northwind] = await Promise.all([
    prisma.customer.create({ data: { customerName: 'Anita Sharma', mobile: '9876543210', email: 'orders@abctraders.example', businessName: 'ABC Traders', gstNumber: '27ABCDE1234F1Z5', customerType: CustomerType.WHOLESALE, status: CustomerStatus.ACTIVE, address: 'Mumbai, Maharashtra', assignedToId: sales.id } }),
    prisma.customer.create({ data: { customerName: 'Ravi Mehta', mobile: '9988776655', businessName: 'Metro Stores', customerType: CustomerType.RETAIL, status: CustomerStatus.LEAD, address: 'Pune, Maharashtra', assignedToId: sales.id } }),
    prisma.customer.create({ data: { customerName: 'Neha Kapoor', mobile: '9123456780', businessName: 'Northwind Distribution', customerType: CustomerType.DISTRIBUTOR, status: CustomerStatus.ACTIVE, address: 'Nashik, Maharashtra', assignedToId: sales.id } }),
  ]);

  await prisma.customerFollowUp.createMany({
    data: [
      { customerId: abcTraders.id, createdById: sales.id, note: 'Confirmed monthly delivery schedule.' },
      { customerId: metroStores.id, createdById: sales.id, note: 'Requested product catalogue and wholesale pricing.' },
      { customerId: northwind.id, createdById: sales.id, note: 'Follow up on distributor territory requirements.' },
    ],
  });

  await prisma.stockMovement.createMany({
    data: [
      { productId: mouse.id, type: StockMovementType.IN, quantity: 13, reason: 'Opening stock', createdById: warehouse.id },
      { productId: mouse.id, type: StockMovementType.OUT, quantity: 5, reason: 'Demo adjustment', createdById: warehouse.id },
      { productId: keyboard.id, type: StockMovementType.IN, quantity: 14, reason: 'Opening stock', createdById: warehouse.id },
      { productId: monitor.id, type: StockMovementType.IN, quantity: 3, reason: 'Opening stock', createdById: warehouse.id },
    ],
  });

  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-000001',
      customerId: abcTraders.id,
      createdById: sales.id,
      status: ChallanStatus.CONFIRMED,
      totalQuantity: 3,
      items: { create: [
        { productId: mouse.id, productName: mouse.name, sku: mouse.sku, unitPrice: mouse.unitPrice, quantity: 3, totalPrice: mouse.unitPrice * 3 },
      ] },
    },
  });

  await prisma.stockMovement.create({
    data: { productId: mouse.id, type: StockMovementType.OUT, quantity: 3, reason: 'Sales Challan CH-000001', createdById: sales.id },
  });

  await prisma.salesChallan.create({
    data: {
      challanNumber: 'CH-000002', customerId: northwind.id, createdById: sales.id,
      status: ChallanStatus.DRAFT, totalQuantity: 3,
      items: { create: [
        { productId: keyboard.id, productName: keyboard.name, sku: keyboard.sku, unitPrice: keyboard.unitPrice, quantity: 2, totalPrice: keyboard.unitPrice * 2 },
        { productId: mouse.id, productName: mouse.name, sku: mouse.sku, unitPrice: mouse.unitPrice, quantity: 1, totalPrice: mouse.unitPrice },
      ] },
    },
  });

  console.log('Seed complete. Demo password for all users:', credentials.password);
  console.log('Users:', credentials.admin, credentials.sales, credentials.warehouse, credentials.accounts);
}

main()
  .catch((error) => { console.error(error); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
