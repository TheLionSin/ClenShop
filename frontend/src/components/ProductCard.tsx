import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";

const WHATSAPP_PHONE = "77473543030"; // без + (замени если надо)
const TELEGRAM_LINK = "https://t.me/your_telegram_username"; // замени на реальный

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mainImage =
        product.images.find((img) => img.is_primary) || product.images[0];

    const whatsAppText = encodeURIComponent(
        `Здравствуйте! Хочу заказать: ${product.name}`,
    );
    const whatsAppLink = `https://wa.me/${WHATSAPP_PHONE}?text=${whatsAppText}`;

    return (
        <>
            {/* Карточка товара */}
            <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col">
                <Link to={`/product/${product.id}`}>
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
                        to={`/product/${product.id}`}
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
                            {/* WhatsApp */}
                            <a
                                href={whatsAppLink}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-500 bg-green-50 hover:bg-green-100 transition"
                            >
                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
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
                                <div>
                                    <div className="font-semibold">Связаться в WhatsApp</div>
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
