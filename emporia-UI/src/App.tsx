import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "@/components/pages/LandingPage";
import LoginPage from "./components/pages/LoginPage";
import { Toaster } from "@/components/ui/toaster";
import RegistrationRouter from "./components/pages/RegistrationRouter";
import { Navbar } from "./components/ui/navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationRouter />} />
        {/* Add more routes here as needed */}
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
