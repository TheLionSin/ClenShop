import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../types/product";
import { fetchAdminProducts } from "../api/client";

export const AdminProductsPage: React.FC = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);

            try {
                const resp = await fetchAdminProducts();
                setProducts(resp.data.items);
            } catch (e: any) {
                const msg = e.message || "Ошибка загрузки";
                setError(msg);

                // если не авторизован — отправляем на логин
                if (msg.toLowerCase().includes("не авторизован")) {
                    navigate("/admin/login");
                }
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [navigate]);

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Верхняя панель админки */}
            <header className="w-full bg-gray-900 text-white">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
                    <div className="font-bold text-lg">Админ-панель · Товары</div>
                    <div className="flex items-center gap-3 text-sm">
                        <button
                            onClick={() => navigate("/")}
                            className="px-3 py-1 rounded-full border border-gray-500 hover:bg-gray-800"
                        >
                            На сайт
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                            Выйти
                        </button>
                    </div>
                </div>
            </header>

            {/* Контент */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Список товаров</h1>
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full"
                        // позже повесим navigate("/admin/products/new")
                        onClick={() => navigate("/admin/products/new")}
                    >
                        + Новый товар
                    </button>
                </div>

                {loading && <div>Загрузка...</div>}

                {error && (
                    <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {products.length === 0 ? (
                            <div className="text-sm text-gray-500">
                                Товаров пока нет. Создайте первый товар.
                            </div>
                        ) : (
                            <div className="overflow-x-auto bg-white shadow-sm rounded-lg">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="px-3 py-2 text-left">ID</th>
                                        <th className="px-3 py-2 text-left">Название</th>
                                        <th className="px-3 py-2 text-left">Цена</th>
                                        <th className="px-3 py-2 text-left">Активен</th>
                                        <th className="px-3 py-2 text-left">Остаток</th>
                                        <th className="px-3 py-2 text-left">Действия</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {products.map((p) => (
                                        <tr key={p.id} className="border-t">
                                            <td className="px-3 py-2">{p.id}</td>
                                            <td className="px-3 py-2 max-w-xs truncate">
                                                {p.name}
                                            </td>
                                            <td className="px-3 py-2">
                                                {new Intl.NumberFormat("ru-RU").format(p.price)} ₸
                                            </td>
                                            <td className="px-3 py-2">
                                                {p.is_active ? (
                                                    <span className="text-green-600">Да</span>
                                                ) : (
                                                    <span className="text-gray-400">Нет</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">{p.stock}</td>
                                            <td className="px-3 py-2 space-x-2">
                                                <button
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}

                                                >
                                                    Редактировать
                                                </button>
                                                {/* сюда позже добавим удаление */}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};
