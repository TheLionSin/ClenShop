import React from "react";
import { Helmet } from "react-helmet-async";

const INSTAGRAM_LINK = "https://www.instagram.com/clen_kz";
const TELEGRAM_LINK = "https://t.me/Clen_kz";

export const ContactsPage: React.FC = () => {
    return (

        <>
            <Helmet>
                <title>Контакты CLEN.KZ — спортивное питание Каскелен / Алматы</title>
                <meta
                    name="description"
                    content="Контакты магазина спортивного питания CLEN.KZ. Instagram, Telegram, доставка по Алматы и Каскелену."
                />

                {/* OG */}
                <meta property="og:title" content="Контакты CLEN.KZ" />
                <meta
                    property="og:description"
                    content="Instagram, Telegram, доставка, режим работы магазина CLEN.KZ."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://clen.kz/contacts" />
            </Helmet>

        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">
                Контакты магазина CLEN.KZ
            </h1>

            {/* верхний блок: слева инфа, справа «написать» */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Левая колонка */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-2">Как с нами связаться</h2>
                        <p className="text-sm text-gray-700 mb-1">
                            Телефон: <span className="font-semibold"></span>
                        </p>
                        <p className="text-sm text-gray-700">
                            Instagram и Telegram отвечаем быстро, обычно в течение{" "}
                            <span className="font-semibold">10–15 минут</span>.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-2">Режим работы</h2>
                        <p className="text-sm text-gray-700">
                            Пн–Вс: <span className="font-semibold">10:00 – 21:00</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Заказы на сайте и в мессенджерах принимаем 24/7, обработка — в рабочее время.
                        </p>
                    </div>
                </div>

                {/* Правая колонка – кнопки мессенджеров */}
                <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col justify-center gap-4">
                    <p className="text-sm text-gray-700">
                        Выберите удобный способ связи — напишем, подберём комплекс по целям и ответим на вопросы.
                    </p>

                    <div className="flex flex-col gap-3">
                        <a
                            href={`${INSTAGRAM_LINK}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"
                        >
                            {/* Иконка Instagram */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34 3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66 1.34-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5zm4.75-2.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/>
                            </svg>

                            Связаться в Instagram
                        </a>

                        <a
                            href={TELEGRAM_LINK}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
                        >
                            {/* Иконка Telegram */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M9.99 15.67l-.4 5.59c.57 0 .81-.25 1.11-.54l2.66-2.57 5.52 4.04c1.01.56 1.73.26 2-.94l3.62-17.03c.32-1.5-.54-2.08-1.52-1.72L.61 9.32C-.84 9.89-.82 10.7.37 11.08l5.69 1.77 13-7.6c.54-.35 1.03-.16.63.19L9.99 15.67z" />
                            </svg>
                            Связаться в Telegram
                        </a>
                    </div>
                </div>
            </div>

            {/* Доп инфа / доставка */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                <h2 className="text-lg font-semibold mb-2">Доставка и самовывоз</h2>
                <p className="text-sm text-gray-700 mb-1">
                    Работаем по Алматы. Уточнить стоимость и время доставки можно в мессенджерах.
                </p>
                <p className="text-xs text-gray-500">
                    В переписке можно отправить нам список товаров или скрин с сайта — соберём заказ и посчитаем итог.
                </p>
            </div>

            {/* Заглушка под карту / локацию */}
            <div className="bg-gray-100 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                {/*Здесь позже можно будет встроить карту или схему самовывоза.*/}
            </div>
        </div>
        </>
    );
};