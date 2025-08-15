import { BrowserRouter as Router, Routes, Route } from "react-router";
import Layout from "@/react-app/components/Layout";
import Dashboard from "@/react-app/pages/Dashboard";
import Orders from "@/react-app/pages/Orders";
import Customers from "@/react-app/pages/Customers";
import Inventory from "@/react-app/pages/Inventory";
import Employees from "@/react-app/pages/Employees";
import Quotes from "@/react-app/pages/Quotes";
import Schedule from "@/react-app/pages/Schedule";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/quotes" element={<Quotes />} />
        </Routes>
      </Layout>
    </Router>
  );
}
