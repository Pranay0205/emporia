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
import PrivateRoute from "./components/routing/PrivateRoutes";
import TokenManager from "./utils/tokenManager";
import { useEffect, useState } from "react";

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app startup
    const checkAuth = () => {
      try {
        const isAuthenticated = TokenManager.isAuthenticated();
        setIsAuth(isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#1a202c',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar isAuthenticated={isAuth} setIsAuth={setIsAuth} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage setIsAuth={setIsAuth} />} />
        <Route path="/register" element={<RegistrationRouter />} />
        
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/market" element={<MarketPage />} />
        </Route>
        
        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route path="/categories" element={<CategoriesPage />} />
        </Route>
        
        <Route element={<PrivateRoute requiredRole="seller" />}>
          <Route path="/products" element={<ProductPage />} />
        </Route>
        
        <Route element={<PrivateRoute requiredRole="customer" />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/place-order" element={<PlaceOrderPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            textAlign: 'center'
          }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Go Home
            </button>
          </div>
        } />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;