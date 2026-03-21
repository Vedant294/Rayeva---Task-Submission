import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CategoryGenerator from "./pages/CategoryGenerator";
import ProposalGenerator from "./pages/ProposalGenerator";
import ImpactGenerator from "./pages/ImpactGenerator";
import LogsViewer from "./pages/LogsViewer";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/category" element={<CategoryGenerator />} />
            <Route path="/proposal" element={<ProposalGenerator />} />
            <Route path="/impact" element={<ImpactGenerator />} />
            <Route path="/logs" element={<LogsViewer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
