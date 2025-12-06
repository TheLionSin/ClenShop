// src/pages/ProductPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProduct } from "../api/client";
import type { Product, ProductImage } from "../types/product";
import { Helmet } from "react-helmet-async";

const INSTAGRAM_LINK = "https://www.instagram.com/clen_kz";
const TELEGRAM_LINK = "https://t.me/Clen_kz";

export const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [activeImage, setActiveImage] = useState<ProductImage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [previewImage, setPreviewImage] = useState<ProductImage | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // грузим товар по slug
    useEffect(() => {
        if (!slug) return;

        async function load() {
            try {
                setLoading(true);
                setError(null);
                const resp = await fetchProduct(slug!);
                setProduct(resp.data as Product);
            } catch (e: any) {
                setError(e.message || "Ошибка загрузки товара");
                setProduct(null);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [slug]);

    // когда товар загрузился / сменился — выбираем главное изображение
    useEffect(() => {
        if (!product) {
            setActiveImage(null);
            return;
        }

        const imgs = product.images || [];
        const main =
            imgs.find((img) => img.is_primary) || imgs[0] || null;

        setActiveImage(main);
    }, [product]);

    // ---- ранние return'ы уже после всех хуков ----

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6">
                Загрузка товара...
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="text-red-600 mb-4">
                    {error || "Товар не найден"}
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

    // здесь product уже точно есть
    const images = product.images || [];
    const mainImage: ProductImage | undefined =
        activeImage ||
        images.find((img) => img.is_primary) ||
        images[0];

    const inStock = product.stock > 0 && product.is_active;

    return (
        <>
            <Helmet>
                <title>{product.name} — купить в CLEN.KZ</title>
                <meta
                    name="description"
                    content={product.description
                        .replace(/<[^>]+>/g, "")
                        .slice(0, 150)}
                />

                <meta property="og:title" content={product.name} />
                <meta
                    property="og:description"
                    content={product.description
                        .replace(/<[^>]+>/g, "")
                        .slice(0, 150)}
                />
                <meta
                    property="og:image"
                    content={mainImage ? mainImage.url : ""}
                />
                <meta property="og:type" content="product" />
                <meta
                    property="og:url"
                    content={`https://clen.kz/product/${product.slug}`}
                />
            </Helmet>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Наверху — ссылка назад */}
                <div className="mb-4">
                    <Link
                        to="/"
                        className="text-sm text-blue-600 underline hover:no-underline"
                    >
                        ← Назад к товарам
                    </Link>
                </div>

                {/* Верхний блок: фото + инфо */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Левая колонка — фото и миниатюры */}
                    <div className="space-y-3">

                        {/* Большое изображение */}
                        {mainImage ? (
                            <img
                                src={mainImage.url}
                                alt={product.name}
                                className="w-full h-80 md:h-[420px] object-contain rounded-lg bg-white cursor-zoom-in"
                                onClick={() => {
                                    setPreviewImage(mainImage);
                                    setIsPreviewOpen(true);
                                }}
                            />
                        ) : (
                            <div className="w-full h-80 md:h-[420px] rounded-lg bg-gray-200" />
                        )}


                        {/* Миниатюры — только если больше одной фотки */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {images.map((img) => {
                                    const isActive =
                                        mainImage && mainImage.id === img.id;

                                    return (
                                        <button
                                            key={img.id}
                                            type="button"
                                            onClick={() => setActiveImage(img)}
                                            className={`border rounded bg-white flex-shrink-0 ${
                                                isActive
                                                    ? "border-green-500 ring-2 ring-green-400"
                                                    : "border-gray-200"
                                            }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt=""
                                                className="h-16 w-16 md:h-20 md:w-20 object-contain p-1"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Правая колонка — инфо */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl font-bold">
                            {product.name}
                        </h1>

                        <div className="text-sm">
                            {inStock ? (
                                <span className="text-green-600 font-semibold">
                                    В наличии
                                </span>
                            ) : (
                                <span className="text-red-600 font-semibold">
                                    Нет в наличии
                                </span>
                            )}
                        </div>

                        <div className="text-2xl text-green-600 font-semibold">
                            {product.price.toLocaleString("ru-RU")} ₸
                        </div>

                        {/* Кнопка Купить → модалка */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-full w-full md:w-auto"
                        >
                            Купить
                        </button>
                    </div>
                </div>

                {/* Описание */}
                <section className="mt-8 product-description text-sm text-gray-800 leading-relaxed">
                    <h2 className="text-lg font-semibold mb-3 border-b pb-2">
                        Описание
                    </h2>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: product.description,
                        }}
                    />
                </section>
            </div>

            {/* 👉 Модалка предпросмотра картинки */}
            {previewImage && isPreviewOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4 cursor-zoom-out"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Кнопка закрытия */}
                        <button
                            onClick={() => setIsPreviewOpen(false)}
                            className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 w-9 h-9 rounded-full flex items-center justify-center text-2xl leading-none"
                        >
                            ×
                        </button>

                        {/* Большое фото */}
                        <img
                            src={previewImage.url}
                            alt={product.name}
                            className="max-w-full max-h-[90vh] object-contain rounded-xl cursor-default"
                        />

                        {/* Подсказка снизу */}
                        <div className="absolute bottom-3 left-0 w-full text-center text-white/70 text-xs select-none pointer-events-none">
                            Нажмите вне изображения, чтобы закрыть
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно контактов */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-7 relative"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Кнопка закрыть */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100"
                        >
                            ×
                        </button>

                        <h2 className="text-lg md:text-xl font-semibold mb-2">
                            Как удобнее связаться?
                        </h2>
                        <p className="text-sm text-gray-600 mb-5">
                            Выберите удобный способ, чтобы обсудить заказ
                            этого товара.
                        </p>

                        <div className="space-y-3">
                            {/* Instagram */}
                            <a
                                href={INSTAGRAM_LINK}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-500 bg-green-50 hover:bg-green-100 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5zm4.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">
                                        Связаться в Instagram
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        Быстрый ответ по товару и наличию
                                    </span>
                                </div>
                            </a>

                            {/* Telegram */}
                            <a
                                href={TELEGRAM_LINK}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        fill="white"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M9.992 15.674l-.396 5.588c.568 0 .813-.246 1.11-.543l2.664-2.575 5.521 4.043c1.013.558 1.729.264 1.999-.937l3.621-17.03.001-.001c.32-1.496-.54-2.081-1.52-1.719L.613 9.32c-1.453.568-1.431 1.385-.262 1.763l5.68 1.772L18.94 5.255c.54-.353 1.034-.157.627.195" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">
                                        Связаться в Telegram
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        Удобно, если больше нравится Telegram
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
