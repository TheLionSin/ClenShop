import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    fetchAdminProducts,
    deleteProduct,
} from "../api/client";
import type { Product } from "../types/product";

export const AdminProductsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            window.history.replaceState({}, ""); // очистка истории
        }
    }, [location]);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    async function load() {
        try {
            const resp = await fetchAdminProducts();
            setProducts(resp.data.items);
        } catch (e: any) {
            setError(e.message || "Ошибка загрузки");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleDelete(id: number) {
        if (!confirm("Удалить товар?")) return;

        await deleteProduct(id);
        load();
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {successMessage && (
                <div className="max-w-6xl mx-auto mt-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded">
                    {successMessage}
                </div>
            )}

            {/* ====== ВЕРХНЯЯ ПАНЕЛЬ АДМИНКИ ====== */}
            <header className="w-full bg-gray-900 text-white">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                    <div className="font-bold text-lg">Админ-панель · Товары</div>

                    <div className="flex gap-3 text-sm">
                        <button
                            onClick={() => navigate("/admin/products")}
                            className="px-3 py-1 rounded-full border border-gray-500 bg-white/10"
                        >
                            Товары
                        </button>

                        <button
                            onClick={() => navigate("/admin/categories")}
                            className="px-3 py-1 rounded-full border border-gray-500 hover:bg-gray-800"
                        >
                            Категории
                        </button>

                        <button
                            onClick={() => navigate("/")}
                            className="px-3 py-1 rounded-full border border-gray-500 hover:bg-gray-800"
                        >
                            На сайт
                        </button>

                        <button
                            onClick={() => {
                                localStorage.removeItem("access_token");
                                localStorage.removeItem("refresh_token");
                                navigate("/admin/login");
                            }}
                            className="px-3 py-1 rounded-full border border-red-400 text-red-200 hover:bg-red-600 hover:text-white"
                        >
                            Выйти
                        </button>

                    </div>
                </div>
            </header>

            {/* ====== ОСНОВНОЙ КОНТЕНТ ====== */}
            <main className="max-w-6xl mx-auto px-4 py-6">

                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Товары</h1>

                    <button
                        onClick={() => navigate("/admin/products/new")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm"
                    >
                        + Новый товар
                    </button>
                </div>

                {loading && <div>Загрузка...</div>}
                {error && <div className="text-red-500">{error}</div>}

                {!loading && !error && (
                    <table className="w-full bg-white shadow rounded border">
                        <thead className="bg-gray-100 text-sm">
                        <tr>
                            <th className="px-3 py-2 border">ID</th>
                            <th className="px-3 py-2 border">Название</th>
                            <th className="px-3 py-2 border">Цена</th>
                            <th className="px-3 py-2 border">Категория</th>
                            <th className="px-3 py-2 border">Статус</th>
                            <th className="px-3 py-2 border">Действия</th>
                        </tr>
                        </thead>

                        <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="text-sm">
                                <td className="px-3 py-2 border">{p.id}</td>
                                <td className="px-3 py-2 border">{p.name}</td>
                                <td className="px-3 py-2 border">{p.price} ₸</td>
                                <td className="px-3 py-2 border">{p.category_id}</td>
                                <td className="px-3 py-2 border">
                                    {p.is_active ? (
                                        <span className="text-green-600 font-medium">Активен</span>
                                    ) : (
                                        <span className="text-gray-400">Скрыт</span>
                                    )}
                                </td>

                                <td className="px-3 py-2 border">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                                        >
                                            Редактировать
                                        </button>

                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {products.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center py-6 text-gray-500"
                                >
                                    Нет товаров. Добавьте первый 🙂
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    );
};
