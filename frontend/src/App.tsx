import { BrowserRouter, Route, Routes } from "react-router-dom";
import AccountsPage from "../pages/accountPage"
import DashboardPage from "../pages/dashboardPage";
import TransactionPage from "../pages/transactionPage"
import Navbar from "../navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
      </Routes>
    </BrowserRouter>
  );
}