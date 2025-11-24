import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCategory, fetchProductsByCategory } from "../api/client";
import type { Category } from "../types/category";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";
import { Helmet } from "react-helmet-async";

export const CategoryPage: React.FC = () => {
    const {slug} = useParams<{ slug: string }>();

    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        async function load(currentSlug: string) {
            setLoading(true);
            setError(null);

            try {
                const [catResp, prodResp] = await Promise.all([
                    fetchCategory(currentSlug),
                    fetchProductsByCategory(currentSlug),
                ]);

                setCategory(catResp.data);
                setProducts(prodResp.data.items);
            } catch (e: any) {
                setError(e?.message || "Ошибка загрузки категории");
            } finally {
                setLoading(false);
            }
        }

        load(slug);
    }, [slug]);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6">
                Загрузка категории...
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="text-red-600 mb-4">
                    {error || "Категория не найдена"}
                </div>
                <Link
                    to="/"
                    className="text-sm text-blue-600 underline"
                >
                    ← На главную
                </Link>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{category.name} — купить в CLEN.KZ</title>
                <meta
                    name="description"
                    content={`Категория: ${category.name}. Товаров: ${products.length}. Купить спортивное питание в Казахстане.`}
                />

                {/* OG */}
                <meta property="og:title" content={category.name}/>
                <meta
                    property="og:description"
                    content={`Категория: ${category.name}. Спортивное питание CLEN.KZ.`}
                />
                <meta property="og:type" content="website"/>
                <meta
                    property="og:url"
                    content={`https://clen.kz/category/${category.slug}`}
                />
            </Helmet>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Наверху — назад */}
                <div className="mb-4">
                    <Link
                        to="/"
                        className="text-sm text-blue-600 underline hover:no-underline"
                    >
                        ← Назад к товарам
                    </Link>
                </div>

                {/* Заголовок */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-1">
                        {category.name}
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                        Товаров в категории: {products.length}
                    </p>
                </div>

                {/* Сетка товаров */}
                {products.length === 0 ? (
                    <div className="text-sm text-gray-500 mb-8">
                        В этой категории пока нет товаров.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p}/>
                        ))}
                    </div>
                )}

                {/* Описание категории снизу (HTML) */}
                <section className="mt-4 text-sm text-gray-800 leading-relaxed">
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                        Описание категории
                    </h2>
                    {category.description ? (
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{__html: category.description}}
                        />
                    ) : (
                        <p className="text-gray-500 text-sm">
                            Для этой категории пока нет подробного описания.
                        </p>
                    )}
                </section>
            </div>
        </>
    );
};