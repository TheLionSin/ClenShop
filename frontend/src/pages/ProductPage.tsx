// src/pages/ProductPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProduct } from "../api/client";
import type { Product, ProductImage } from "../types/product";
import { Helmet } from "react-helmet-async";

const WHATSAPP_PHONE = "77473543030"; // номер без +
const TELEGRAM_LINK = "https://t.me/Maxpool69"; // ← поменяй на реальный

export const ProductPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!slug) return;

        async function load() {
            try {
                const resp = await fetchProduct(slug!);
                setProduct(resp.data as Product);
            } catch (e: any) {
                setError(e.message || "Ошибка загрузки товара");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [slug]);

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

    const images = product.images || [];
    const mainImage: ProductImage | undefined =
        images.find((img) => img.is_primary) || images[0];

    const inStock = product.stock > 0 && product.is_active;
    const whatsAppText = encodeURIComponent(
        `Здравствуйте! Хочу заказать: ${product.name}`,
    );
    const whatsAppLink = `https://wa.me/${WHATSAPP_PHONE}?text=${whatsAppText}`;

    return (
        <>

            <Helmet>
                <title>{product.name} — купить в CLEN.KZ</title>
                <meta
                    name="description"
                    content={product.description.replace(/<[^>]+>/g, "").slice(0, 150)}
                />

                <meta property="og:title" content={product.name} />
                <meta
                    property="og:description"
                    content={product.description.replace(/<[^>]+>/g, "").slice(0, 150)}
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
                    {/* Фото */}
                    <div className="space-y-3">
                        {mainImage ? (
                            <img
                                src={mainImage.url}
                                alt={product.name}
                                className="w-full h-80 md:h-[420px] object-contain rounded-lg bg-white"
                            />
                        ) : (
                            <div className="w-full h-80 md:h-[420px] rounded-lg bg-gray-200" />
                        )}

                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img) => (
                                    <img
                                        key={img.id}
                                        src={img.url}
                                        alt=""
                                        className="h-16 w-full object-contain rounded border bg-white"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Инфо */}
                    <div className="flex flex-col gap-4">
                        <h1 className="text-2xl font-bold">{product.name}</h1>

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
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </section>
            </div>

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
                            Выберите удобный способ, чтобы обсудить заказ этого товара.
                        </p>

                        <div className="space-y-3">
                            {/* WhatsApp */}
                            <a
                                href={whatsAppLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-500 bg-green-50 hover:bg-green-100 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                    {/* WhatsApp SVG */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        fill="white"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M20.52 3.48A11.86 11.86 0 0 0 12 0a12 12 0 1 0 6.15 22.28l.38.22 1.15.67a1.67 1.67 0 0 0 2.46-1.82l-.27-1.79-.06-.43A12 12 0 0 0 24 12a11.86 11.86 0 0 0-3.48-8.52zM12 21.33A9.33 9.33 0 1 1 21.33 12 9.34 9.34 0 0 1 12 21.33zm5-6.83c-.27-.14-1.64-.81-1.9-.9s-.44-.14-.62.14-.71.9-.87 1.08-.32.2-.6.07a7.66 7.66 0 0 1-2.25-1.39 8.44 8.44 0 0 1-1.56-1.94c-.16-.27 0-.42.12-.55s.27-.32.41-.48a1.83 1.83 0 0 0 .27-.45.5.5 0 0 0 0-.48c-.08-.14-.62-1.49-.85-2s-.45-.43-.62-.44h-.53a1 1 0 0 0-.7.33 2.88 2.88 0 0 0-.9 2.12 5 5 0 0 0 1.09 2.64A11.41 11.41 0 0 0 12 17.2a9.7 9.7 0 0 0 3.24.61 2.77 2.77 0 0 0 1.94-.84 2.24 2.24 0 0 0 .48-1.58c-.06-.14-.24-.2-.4-.29z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-900">
                                        Связаться в WhatsApp
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
                                    {/* Telegram SVG */}
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
