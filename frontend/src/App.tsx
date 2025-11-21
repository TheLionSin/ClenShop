import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminCreateProductPage } from "./pages/AdminCreateProductPage";
import { AdminEditProductPage } from "./pages/AdminEditProductPage";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Витрина */}
                <Route path="/" element={<HomePage />} />

                {/* Админка */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/products/new" element={<AdminCreateProductPage />} />
                <Route path="/admin/products/:id/edit" element={<AdminEditProductPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
