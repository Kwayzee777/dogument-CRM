
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  quote_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  dog_name TEXT,
  dog_breed TEXT,
  dog_weight REAL,
  departure_city TEXT,
  destination_city TEXT,
  travel_date DATE,
  flight_cost REAL DEFAULT 0,
  boarding_cost REAL DEFAULT 0,
  medical_cost REAL DEFAULT 0,
  additional_fees REAL DEFAULT 0,
  total_amount REAL DEFAULT 0,
  notes TEXT,
  valid_until DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
