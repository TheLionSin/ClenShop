import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchProducts } from "../api/client";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";
import { useCategories } from "../layouts/MainLayout";
import { Helmet } from "react-helmet-async";

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // читаем ?q= из адресной строки
    const searchQuery = useMemo(
        () => new URLSearchParams(location.search).get("q") || "",
        [location.search],
    );

    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [errorProducts, setErrorProducts] = useState<string | null>(null);

    // категории берём из layout
    const { categories, loadingCategories, errorCategories } = useCategories();

    // загрузка товаров с учётом q
    useEffect(() => {
        setLoadingProducts(true);

        fetchProducts(searchQuery ? { q: searchQuery } : undefined)
            .then((resp) => setProducts(resp.data.items))
            .catch((e: any) =>
                setErrorProducts(e?.message || "Ошибка загрузки товаров"),
            )
            .finally(() => setLoadingProducts(false));
    }, [searchQuery]);

    // подкатегории (parent_id != null)
    const childCategories = useMemo(
        () => categories.filter((c) => !!c.parent_id),
        [categories],
    );

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleCategoryClick = (slug: string) => {
        navigate(`/category/${slug}`);
    };

    return (
        <>

            <Helmet>
                <title>CLEN.KZ — магазин спортивного питания в Казахстане</title>
                <meta
                    name="description"
                    content="Спортивное питание CLEN.KZ: протеин, креатин, аминокислоты, витамины. Доставка по Алматы и Каскелену."
                />

                <meta property="og:type" content="website" />
                <meta property="og:title" content="CLEN.KZ — спортивное питание" />
                <meta
                    property="og:description"
                    content="Магазин спортивного питания CLEN.KZ. Оригинальные продукты и быстрая доставка."
                />
                <meta
                    property="og:image"
                    content="https://clen.kz/preview.jpg" // когда сделаешь картинку
                />
                <meta property="og:url" content="https://clen.kz/" />
            </Helmet>

            {/* Баннер */}
            <section className="w-full bg-gray-900 text-white">
                <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-4">
                    <div className="flex flex-col justify-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold">
                            Магазин спортивного питания CLEN.KZ
                        </h1>
                        <p className="text-sm md:text-base text-gray-200">
                            Оригинальные продукты, быстрые ответы в Telegram/Instagram и удобная
                            доставка. Здесь позже появится полноценный баннер с акциями.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => scrollToSection("categories-section")}
                                className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full"
                            >
                                Перейти к меню
                            </button>
                            <a
                                href="https://t.me/Clen_kz"
                                target="_blank"
                                rel="noreferrer"
                                className="border border-white text-white text-sm px-4 py-2 rounded-full hover:bg-white hover:text-gray-900"
                            >
                                Связаться в Telegram
                            </a>
                        </div>
                    </div>
                    <div className="h-40 md:h-56 bg-gray-700 rounded-lg">
                        <img
                            src="/banner2.jpg"
                            alt="Акции CLEN.KZ"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Популярные категории (подкатегории) */}
            <section
                id="categories-section"
                className="max-w-6xl mx-auto px-4 pt-8 pb-4"
            >
                <h2 className="text-xl font-bold mb-4">Популярные категории</h2>

                {loadingCategories && (
                    <div className="text-sm text-gray-500">Загрузка категорий...</div>
                )}
                {errorCategories && (
                    <div className="text-sm text-red-500">{errorCategories}</div>
                )}

                {!loadingCategories && !errorCategories && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {childCategories.map((cat) => {
                            const img = (cat as any).image_url; // если в типе Category нет поля — можно так

                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryClick(cat.slug)}
                                    className="group relative overflow-hidden rounded-lg bg-white border shadow-sm flex flex-col"
                                >
                                    <div className="h-24 md:h-32 w-full flex items-center justify-center bg-gray-100">
                                        {img ? (
                                            <div className="w-[90%] h-[90%] bg-white rounded-md shadow-sm overflow-hidden">
                                                <img
                                                    src={img}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                            </div>

                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Фото категории
                                            </span>
                                        )}
                                    </div>

                                    <div className="px-3 py-2 text-center text-xs md:text-sm font-semibold text-gray-800 group-hover:text-green-600">
                                        {cat.name}
                                    </div>
                                </button>
                            );
                        })}

                        {childCategories.length === 0 && (
                            <div className="text-sm text-gray-500">
                                Пока нет подкатегорий. Добавь их в админке 🙂
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Лидеры продаж */}
            <section className="max-w-6xl mx-auto px-4 py-4 md:py-8">
                <h2 className="text-xl font-bold mb-4">Лидеры продаж</h2>

                {loadingProducts && <div>Загрузка товаров...</div>}
                {errorProducts && (
                    <div className="text-red-600 text-sm">{errorProducts}</div>
                )}

                {!loadingProducts && !errorProducts && (
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
        </>
    );
};
