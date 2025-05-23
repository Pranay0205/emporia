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
import PlaceOrderPage from "./components/pages/PlaceOrderPage";
import OrderHistoryPage from "./components/pages/OrderHistoryPage";

import { useEffect, useState } from "react";
import PrivateRoute from "./components/routing/PrivateRoutes";

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
        <Route element={<PrivateRoute />}>
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/place-order" element={<PlaceOrderPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
        </Route>
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
