import React, { useEffect, useState } from "react";
import { fetchProducts } from "../api/client";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";

export const HomePage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const resp = await fetchProducts();
                setProducts(resp.data.items);
            } catch (e: any) {
                setError(e.message || "Ошибка загрузки");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Верхняя синяя полоска */}
            <div className="w-full bg-blue-700 text-white text-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-2">
                    <div>Магазин спортивного питания</div>
                    <div>Инфо: +7 (747) 354 30 30</div>
                </div>
            </div>

            {/* Хедер */}
            <header className="w-full bg-white shadow">
                <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 gap-4">

                    {/* Логотип */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                            W
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="font-bold text-lg">MYSHOP.KZ</span>
                            <span className="text-xs text-gray-500">спортивное питание</span>
                        </div>
                    </div>

                    {/* Поиск */}
                    <div className="flex-1 max-w-xl">
                        <input
                            type="text"
                            placeholder="Поиск по товарам..."
                            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Корзина */}
                    <button className="flex items-center gap-2 text-sm border border-gray-300 rounded-full px-3 py-2 hover:bg-gray-100">
                        <span className="material-icons">shopping_cart</span>
                        <span>0</span>
                    </button>
                </div>
            </header>

            {/* Контент */}
            <main className="flex-1">

                {/* Баннер */}
                <section className="w-full bg-gray-900 text-white">
                    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-4">
                        <div className="flex flex-col justify-center gap-4">
                            <h1 className="text-2xl md:text-3xl font-bold">
                                Ваш мини-магазин спортивного питания
                            </h1>
                            <p className="text-sm md:text-base text-gray-200">
                                Здесь будет красивый баннер, акции и главное предложение.
                                Потом заменим на реальные картинки.
                            </p>
                            <div className="flex gap-3">
                                <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                                    Перейти к товарам
                                </button>
                                <button className="border border-white text-white text-sm px-4 py-2 rounded-full hover:bg-white hover:text-gray-900">
                                    Связаться в WhatsApp
                                </button>
                            </div>
                        </div>
                        <div className="h-40 md:h-56 bg-gray-700 rounded-lg" />
                    </div>
                </section>

                {/* Лидеры продаж */}
                <section className="max-w-6xl mx-auto px-4 py-8">
                    <h2 className="text-xl font-bold mb-4">Лидеры продаж</h2>

                    {loading && <div>Загрузка товаров...</div>}
                    {error && <div className="text-red-600 text-sm">{error}</div>}

                    {!loading && !error && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}

                            {products.length === 0 && (
                                <div className="text-sm text-gray-500">
                                    Пока нет товаров. Добавь их в админке 🙂
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* Футер */}
            <footer className="w-full bg-white border-t">
                <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-gray-500 flex justify-between">
                    <span>© {new Date().getFullYear()} MYSHOP.KZ</span>
                    <span>Сделано на Go + React</span>
                </div>
            </footer>
        </div>
    );
};
