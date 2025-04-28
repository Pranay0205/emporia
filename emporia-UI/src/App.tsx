import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "@/components/pages/LandingPage";
import LoginPage from "./components/pages/LoginPage";
import { Toaster } from "@/components/ui/toaster";
import RegistrationRouter from "./components/pages/RegistrationRouter";
import { Navbar } from "./components/ui/navbar";
import CategoriesPage from "./components/pages/CategoriesPage";
import MarketPage from "./components/pages/MarketPage";
import ProductPage from "./components/pages/ProductPage";
import CartPage from "./components/pages/CartPage";

import { useEffect, useState } from "react";

function App() {
  const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    const auth = sessionStorage.getItem("isAuthenticated");
    setIsAuth(auth ? Boolean(JSON.parse(auth)) : false);
  }, [isAuth]);

  return (
    <Router>
      <Navbar isAuthenticated={isAuth} setIsAuth={setIsAuth} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage setIsAuth={setIsAuth} />} />
        <Route path="/register" element={<RegistrationRouter />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
