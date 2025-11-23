// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { ProductPage } from "./pages/ProductPage";
import { CategoryPage } from "./pages/CategoryPage";
import { ContactsPage } from "./pages/ContactsPage";

import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminCreateProductPage } from "./pages/AdminCreateProductPage";
import { AdminEditProductPage } from "./pages/AdminEditProductPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";

import { RequireAdminAuth } from "./components/RequireAdminAuth";
import { MainLayout } from "./layouts/MainLayout";

export const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Публичные страницы — все внутри MainLayout */}
                <Route
                    path="/"
                    element={
                        <MainLayout>
                            <HomePage />
                        </MainLayout>
                    }
                />
                <Route
                    path="/product/:id"
                    element={
                        <MainLayout>
                            <ProductPage />
                        </MainLayout>
                    }
                />
                <Route
                    path="/category/:slug"
                    element={
                        <MainLayout>
                            <CategoryPage />
                        </MainLayout>
                    }
                />
                <Route
                    path="/contacts"
                    element={
                        <MainLayout>
                            <ContactsPage />
                        </MainLayout>
                    }
                />

                {/* Старые пути /auth/... чтобы не ломались */}
                <Route
                    path="/auth/login"
                    element={<AdminLoginPage />} // показываем страницу логина админа
                />
                <Route
                    path="/auth/register"
                    element={
                        // регистрации нет — редиректим на логин админа
                        <Navigate to="/admin/login" replace />
                    }
                />

                {/* логин админа без гарда */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* админские страницы через гард, без MainLayout */}
                <Route
                    path="/admin/products"
                    element={
                        <RequireAdminAuth>
                            <AdminProductsPage />
                        </RequireAdminAuth>
                    }
                />
                <Route
                    path="/admin/products/new"
                    element={
                        <RequireAdminAuth>
                            <AdminCreateProductPage />
                        </RequireAdminAuth>
                    }
                />
                <Route
                    path="/admin/products/:id/edit"
                    element={
                        <RequireAdminAuth>
                            <AdminEditProductPage />
                        </RequireAdminAuth>
                    }
                />
                <Route
                    path="/admin/categories"
                    element={
                        <RequireAdminAuth>
                            <AdminCategoriesPage />
                        </RequireAdminAuth>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
