import z from "zod";

// Customer schema and type
export const CustomerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip_code: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

// Inventory item schema and type
export const InventoryItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.number().nullable(),
  sku: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().min(0, "Quantity must be non-negative").default(0),
  unit_price: z.number().min(0, "Price must be non-negative").optional(),
  sku: z.string().optional(),
});

// Order schema and type
export const OrderSchema = z.object({
  id: z.number(),
  customer_id: z.number().nullable(),
  order_number: z.string(),
  status: z.string(),
  pickup_address: z.string().nullable(),
  delivery_address: z.string().nullable(),
  pickup_date: z.string().nullable(),
  delivery_date: z.string().nullable(),
  dog_name: z.string().nullable(),
  dog_breed: z.string().nullable(),
  dog_weight: z.number().nullable(),
  special_instructions: z.string().nullable(),
  total_amount: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateOrderSchema = z.object({
  customer_id: z.number().nullable().optional(),
  order_number: z.string().min(1, "Order number is required"),
  status: z.enum(["pending", "confirmed", "in_transit", "delivered", "cancelled"]).default("pending"),
  pickup_address: z.string().optional(),
  delivery_address: z.string().optional(),
  pickup_date: z.string().optional(),
  delivery_date: z.string().optional(),
  dog_name: z.string().optional(),
  dog_breed: z.string().optional(),
  dog_weight: z.number().min(0, "Weight must be positive").optional(),
  special_instructions: z.string().optional(),
  total_amount: z.number().min(0, "Amount must be non-negative").optional(),
});

// Employee schema and type
export const EmployeeSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  role: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.string().optional(),
  is_active: z.boolean().default(true),
});

// Quote schema and type
export const QuoteSchema = z.object({
  id: z.number(),
  customer_id: z.number().nullable(),
  quote_number: z.string(),
  status: z.string(),
  dog_name: z.string().nullable(),
  dog_breed: z.string().nullable(),
  dog_weight: z.number().nullable(),
  departure_city: z.string().nullable(),
  destination_city: z.string().nullable(),
  travel_date: z.string().nullable(),
  flight_cost: z.number(),
  boarding_cost: z.number(),
  medical_cost: z.number(),
  additional_fees: z.number(),
  total_amount: z.number(),
  notes: z.string().nullable(),
  valid_until: z.string().nullable(),
  order_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateQuoteSchema = z.object({
  customer_id: z.number().nullable().optional(),
  quote_number: z.string().min(1, "Quote number is required"),
  status: z.enum(["draft", "sent", "accepted", "declined", "expired"]).default("draft"),
  dog_name: z.string().optional(),
  dog_breed: z.string().optional(),
  dog_weight: z.number().min(0, "Weight must be positive").optional(),
  departure_city: z.string().optional(),
  destination_city: z.string().optional(),
  travel_date: z.string().optional(),
  flight_cost: z.number().min(0, "Cost must be non-negative").default(0),
  boarding_cost: z.number().min(0, "Cost must be non-negative").default(0),
  medical_cost: z.number().min(0, "Cost must be non-negative").default(0),
  additional_fees: z.number().min(0, "Fees must be non-negative").default(0),
  notes: z.string().optional(),
  valid_until: z.string().optional(),
});

// Derived types
export type Customer = z.infer<typeof CustomerSchema>;
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type CreateEmployee = z.infer<typeof CreateEmployeeSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type CreateQuote = z.infer<typeof CreateQuoteSchema>;

// Schedule schema and type
export const ScheduleSchema = z.object({
  id: z.number(),
  employee_id: z.number().nullable(),
  order_id: z.number().nullable(),
  schedule_type: z.string(),
  scheduled_date: z.string(),
  scheduled_time: z.string().nullable(),
  address: z.string().nullable(),
  status: z.string(),
  notes: z.string().nullable(),
  completed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateScheduleSchema = z.object({
  employee_id: z.number().nullable().optional(),
  order_id: z.number().nullable().optional(),
  schedule_type: z.enum(["pickup", "delivery", "appointment"]).default("pickup"),
  scheduled_date: z.string().min(1, "Date is required"),
  scheduled_time: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
  notes: z.string().optional(),
});

export type Schedule = z.infer<typeof ScheduleSchema>;
export type CreateSchedule = z.infer<typeof CreateScheduleSchema>;
