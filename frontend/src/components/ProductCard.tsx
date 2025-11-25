import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";

const INSTAGRAM_LINK = "https://www.instagram.com/clen_kz"; // без + (замени если надо)
const TELEGRAM_LINK = "https://t.me/Maxpool69"; // замени на реальный

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mainImage =
        product.images.find((img) => img.is_primary) || product.images[0];


    const instAppLink = `${INSTAGRAM_LINK}`;

    return (
        <>
            {/* Карточка товара */}
            <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col">
                <Link to={`/product/${product.slug}`}>
                    {mainImage ? (
                        <img
                            src={mainImage.url}
                            alt={product.name}
                            className="w-full h-72 md:h-96 object-contain rounded-lg bg-white"
                        />
                    ) : (
                        <div className="w-full h-40 rounded-md bg-gray-100" />
                    )}
                </Link>

                <div className="mt-3 flex-1 flex flex-col gap-2">
                    {/* Название */}
                    <Link
                        to={`/product/${product.slug}`}
                        className="text-sm font-semibold hover:underline"
                    >
                        {product.name}
                    </Link>

                    {/* Цена */}
                    <div className="text-green-600 font-semibold text-sm">
                        {product.price.toLocaleString("ru-RU")} ₸
                    </div>

                    {/* КНОПКА КУПИТЬ */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-auto bg-green-500 hover:bg-green-600 text-white text-center text-xs py-2 rounded-full"
                    >
                        Купить
                    </button>
                </div>
            </div>

            {/* МОДАЛЬНОЕ ОКНО */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* крестик */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:bg-gray-100 w-8 h-8 rounded-full text-xl"
                        >
                            ×
                        </button>

                        <h2 className="text-lg font-semibold mb-2">
                            Как удобнее связаться?
                        </h2>

                        <p className="text-sm text-gray-600 mb-5">
                            Выберите удобный способ, чтобы оформить заказ.
                        </p>

                        <div className="space-y-4">
                            {/* Instagram */}
                            <a
                                href={instAppLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-500 bg-green-50 hover:bg-green-100 transition"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5zm4.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/>
                                    </svg>

                                </div>
                                <div>
                                    <div className="font-semibold">Связаться в Instagram</div>
                                    <div className="text-xs text-gray-600">Быстрый ответ</div>
                                </div>
                            </a>

                            {/* Telegram */}
                            <a
                                href={TELEGRAM_LINK}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-blue-500 bg-blue-50 hover:bg-blue-100 transition"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        fill="white"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M9.99 15.67l-.39 5.59c.57 0 .81-.25 1.11-.54l2.66-2.58 5.52 4.04c1.01.56 1.72.26 2-.94l3.62-17.03c.32-1.5-.54-2.08-1.52-1.72L.61 9.32c-1.45.57-1.43 1.39-.26 1.76l5.68 1.77 12.88-7.96c.54-.35 1.03-.16.63.19" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="font-semibold">Связаться в Telegram</div>
                                    <div className="text-xs text-gray-600">Удобно и быстро</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
