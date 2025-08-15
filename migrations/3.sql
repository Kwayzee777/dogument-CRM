
CREATE TABLE schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER,
  order_id INTEGER,
  schedule_type TEXT DEFAULT 'pickup',
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT,
  address TEXT,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
