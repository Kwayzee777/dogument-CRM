import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { 
  CreateCustomerSchema,
  CreateInventoryItemSchema,
  CreateOrderSchema,
  CreateEmployeeSchema,
  CreateQuoteSchema,
  CreateScheduleSchema
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("*", async (c, next) => {
  await next();
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
});

app.options("*", (c) => c.text("", 200));

// Customers API
app.get("/api/customers", async (c) => {
  const db = c.env.DB;
  const customers = await db.prepare("SELECT * FROM customers ORDER BY created_at DESC").all();
  return c.json(customers.results);
});

app.post("/api/customers", zValidator("json", CreateCustomerSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  
  const result = await db.prepare(`
    INSERT INTO customers (name, email, phone, address, city, state, zip_code, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    data.name,
    data.email || null,
    data.phone || null,
    data.address || null,
    data.city || null,
    data.state || null,
    data.zip_code || null
  ).run();

  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(customer);
});

app.put("/api/customers/:id", zValidator("json", CreateCustomerSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");

  await db.prepare(`
    UPDATE customers 
    SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.name,
    data.email || null,
    data.phone || null,
    data.address || null,
    data.city || null,
    data.state || null,
    data.zip_code || null,
    id
  ).run();

  const customer = await db.prepare("SELECT * FROM customers WHERE id = ?").bind(id).first();
  return c.json(customer);
});

app.delete("/api/customers/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM customers WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Inventory API
app.get("/api/inventory", async (c) => {
  const db = c.env.DB;
  const items = await db.prepare("SELECT * FROM inventory_items ORDER BY created_at DESC").all();
  return c.json(items.results);
});

app.post("/api/inventory", zValidator("json", CreateInventoryItemSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  const result = await db.prepare(`
    INSERT INTO inventory_items (name, description, category, quantity, unit_price, sku, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    data.name,
    data.description || null,
    data.category || null,
    data.quantity,
    data.unit_price || null,
    data.sku || null
  ).run();

  const item = await db.prepare("SELECT * FROM inventory_items WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(item);
});

app.put("/api/inventory/:id", zValidator("json", CreateInventoryItemSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");

  await db.prepare(`
    UPDATE inventory_items 
    SET name = ?, description = ?, category = ?, quantity = ?, unit_price = ?, sku = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.name,
    data.description || null,
    data.category || null,
    data.quantity,
    data.unit_price || null,
    data.sku || null,
    id
  ).run();

  const item = await db.prepare("SELECT * FROM inventory_items WHERE id = ?").bind(id).first();
  return c.json(item);
});

app.delete("/api/inventory/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM inventory_items WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Orders API
app.get("/api/orders", async (c) => {
  const db = c.env.DB;
  const orders = await db.prepare(`
    SELECT o.*, c.name as customer_name 
    FROM orders o 
    LEFT JOIN customers c ON o.customer_id = c.id 
    ORDER BY o.created_at DESC
  `).all();
  return c.json(orders.results);
});

app.post("/api/orders", zValidator("json", CreateOrderSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  const result = await db.prepare(`
    INSERT INTO orders (customer_id, order_number, status, pickup_address, delivery_address, pickup_date, delivery_date, dog_name, dog_breed, dog_weight, special_instructions, total_amount, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    data.customer_id || null,
    data.order_number,
    data.status,
    data.pickup_address || null,
    data.delivery_address || null,
    data.pickup_date || null,
    data.delivery_date || null,
    data.dog_name || null,
    data.dog_breed || null,
    data.dog_weight || null,
    data.special_instructions || null,
    data.total_amount || null
  ).run();

  const order = await db.prepare(`
    SELECT o.*, c.name as customer_name 
    FROM orders o 
    LEFT JOIN customers c ON o.customer_id = c.id 
    WHERE o.id = ?
  `).bind(result.meta.last_row_id).first();
  return c.json(order);
});

app.put("/api/orders/:id", zValidator("json", CreateOrderSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");

  await db.prepare(`
    UPDATE orders 
    SET customer_id = ?, order_number = ?, status = ?, pickup_address = ?, delivery_address = ?, pickup_date = ?, delivery_date = ?, dog_name = ?, dog_breed = ?, dog_weight = ?, special_instructions = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.customer_id || null,
    data.order_number,
    data.status,
    data.pickup_address || null,
    data.delivery_address || null,
    data.pickup_date || null,
    data.delivery_date || null,
    data.dog_name || null,
    data.dog_breed || null,
    data.dog_weight || null,
    data.special_instructions || null,
    data.total_amount || null,
    id
  ).run();

  const order = await db.prepare(`
    SELECT o.*, c.name as customer_name 
    FROM orders o 
    LEFT JOIN customers c ON o.customer_id = c.id 
    WHERE o.id = ?
  `).bind(id).first();
  return c.json(order);
});

app.delete("/api/orders/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Employees API
app.get("/api/employees", async (c) => {
  const db = c.env.DB;
  const employees = await db.prepare("SELECT * FROM employees ORDER BY created_at DESC").all();
  return c.json(employees.results);
});

app.post("/api/employees", zValidator("json", CreateEmployeeSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  const result = await db.prepare(`
    INSERT INTO employees (name, email, phone, role, is_active, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    data.name,
    data.email || null,
    data.phone || null,
    data.role || null,
    data.is_active ? 1 : 0
  ).run();

  const employee = await db.prepare("SELECT * FROM employees WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(employee);
});

app.put("/api/employees/:id", zValidator("json", CreateEmployeeSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");

  await db.prepare(`
    UPDATE employees 
    SET name = ?, email = ?, phone = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.name,
    data.email || null,
    data.phone || null,
    data.role || null,
    data.is_active ? 1 : 0,
    id
  ).run();

  const employee = await db.prepare("SELECT * FROM employees WHERE id = ?").bind(id).first();
  return c.json(employee);
});

app.delete("/api/employees/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM employees WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Quotes API
app.get("/api/quotes", async (c) => {
  const db = c.env.DB;
  const quotes = await db.prepare(`
    SELECT q.*, c.name as customer_name 
    FROM quotes q 
    LEFT JOIN customers c ON q.customer_id = c.id 
    ORDER BY q.created_at DESC
  `).all();
  return c.json(quotes.results);
});

app.post("/api/quotes", zValidator("json", CreateQuoteSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");
  
  // Calculate total amount
  const totalAmount = data.flight_cost + data.boarding_cost + data.medical_cost + data.additional_fees;

  const result = await db.prepare(`
    INSERT INTO quotes (customer_id, quote_number, status, dog_name, dog_breed, dog_weight, departure_city, destination_city, travel_date, flight_cost, boarding_cost, medical_cost, additional_fees, total_amount, notes, valid_until, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    data.customer_id || null,
    data.quote_number,
    data.status,
    data.dog_name || null,
    data.dog_breed || null,
    data.dog_weight || null,
    data.departure_city || null,
    data.destination_city || null,
    data.travel_date || null,
    data.flight_cost,
    data.boarding_cost,
    data.medical_cost,
    data.additional_fees,
    totalAmount,
    data.notes || null,
    data.valid_until || null
  ).run();

  const quote = await db.prepare(`
    SELECT q.*, c.name as customer_name 
    FROM quotes q 
    LEFT JOIN customers c ON q.customer_id = c.id 
    WHERE q.id = ?
  `).bind(result.meta.last_row_id).first();
  return c.json(quote);
});

app.put("/api/quotes/:id", zValidator("json", CreateQuoteSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");

  // Get current quote to check previous status
  const currentQuote = await db.prepare("SELECT * FROM quotes WHERE id = ?").bind(id).first();
  
  // Calculate total amount
  const totalAmount = data.flight_cost + data.boarding_cost + data.medical_cost + data.additional_fees;

  // Update the quote
  await db.prepare(`
    UPDATE quotes 
    SET customer_id = ?, quote_number = ?, status = ?, dog_name = ?, dog_breed = ?, dog_weight = ?, departure_city = ?, destination_city = ?, travel_date = ?, flight_cost = ?, boarding_cost = ?, medical_cost = ?, additional_fees = ?, total_amount = ?, notes = ?, valid_until = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.customer_id || null,
    data.quote_number,
    data.status,
    data.dog_name || null,
    data.dog_breed || null,
    data.dog_weight || null,
    data.departure_city || null,
    data.destination_city || null,
    data.travel_date || null,
    data.flight_cost,
    data.boarding_cost,
    data.medical_cost,
    data.additional_fees,
    totalAmount,
    data.notes || null,
    data.valid_until || null,
    id
  ).run();

  // If status changed to accepted and no order exists yet, create an order
  if (data.status === 'accepted' && currentQuote?.status !== 'accepted' && !currentQuote?.order_id) {
    // Generate order number based on quote number
    const orderNumber = data.quote_number.replace('DPT-', 'ORD-');
    
    // Create the order
    const orderResult = await db.prepare(`
      INSERT INTO orders (customer_id, order_number, status, pickup_address, delivery_address, pickup_date, delivery_date, dog_name, dog_breed, dog_weight, special_instructions, total_amount, updated_at)
      VALUES (?, ?, 'confirmed', ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      data.customer_id || null,
      orderNumber,
      data.departure_city || null, // pickup address
      data.destination_city || null, // delivery address  
      data.travel_date || null, // pickup date
      data.travel_date || null, // delivery date
      data.dog_name || null,
      data.dog_breed || null,
      data.dog_weight || null,
      data.notes || null, // special instructions
      totalAmount
    ).run();

    // Update quote with order_id reference
    await db.prepare(`
      UPDATE quotes SET order_id = ? WHERE id = ?
    `).bind(orderResult.meta.last_row_id, id).run();
  }

  const quote = await db.prepare(`
    SELECT q.*, c.name as customer_name 
    FROM quotes q 
    LEFT JOIN customers c ON q.customer_id = c.id 
    WHERE q.id = ?
  `).bind(id).first();
  return c.json(quote);
});

app.delete("/api/quotes/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM quotes WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Schedules API
app.get("/api/schedules", async (c) => {
  const db = c.env.DB;
  const schedules = await db.prepare(`
    SELECT s.*, e.name as employee_name, o.order_number 
    FROM schedules s 
    LEFT JOIN employees e ON s.employee_id = e.id 
    LEFT JOIN orders o ON s.order_id = o.id 
    ORDER BY s.scheduled_date DESC, s.scheduled_time ASC
  `).all();
  return c.json(schedules.results);
});

app.post("/api/schedules", zValidator("json", CreateScheduleSchema), async (c) => {
  const db = c.env.DB;
  const data = c.req.valid("json");

  const result = await db.prepare(`
    INSERT INTO schedules (employee_id, order_id, schedule_type, scheduled_date, scheduled_time, address, status, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    data.employee_id || null,
    data.order_id || null,
    data.schedule_type,
    data.scheduled_date,
    data.scheduled_time || null,
    data.address || null,
    data.status,
    data.notes || null
  ).run();

  const schedule = await db.prepare(`
    SELECT s.*, e.name as employee_name, o.order_number 
    FROM schedules s 
    LEFT JOIN employees e ON s.employee_id = e.id 
    LEFT JOIN orders o ON s.order_id = o.id 
    WHERE s.id = ?
  `).bind(result.meta.last_row_id).first();
  return c.json(schedule);
});

app.put("/api/schedules/:id", zValidator("json", CreateScheduleSchema), async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const data = c.req.valid("json");

  await db.prepare(`
    UPDATE schedules 
    SET employee_id = ?, order_id = ?, schedule_type = ?, scheduled_date = ?, scheduled_time = ?, address = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    data.employee_id || null,
    data.order_id || null,
    data.schedule_type,
    data.scheduled_date,
    data.scheduled_time || null,
    data.address || null,
    data.status,
    data.notes || null,
    id
  ).run();

  const schedule = await db.prepare(`
    SELECT s.*, e.name as employee_name, o.order_number 
    FROM schedules s 
    LEFT JOIN employees e ON s.employee_id = e.id 
    LEFT JOIN orders o ON s.order_id = o.id 
    WHERE s.id = ?
  `).bind(id).first();
  return c.json(schedule);
});

app.delete("/api/schedules/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  await db.prepare("DELETE FROM schedules WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

export default app;
