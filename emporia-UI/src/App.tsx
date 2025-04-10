import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "@/components/pages/LandingPage";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "./components/ui/navbar";

function App() {
  return (
    <>
      <Navbar/>
      <div className="app-container">
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
          </Routes>
          <Toaster />
        </Router>
      </div>
    </>
  );
}

export default App;