import React from "react";

const WHATSAPP_PHONE = "77075099312";
const TELEGRAM_LINK = "https://t.me/Maxpool69";

export const ContactsPage: React.FC = () => {
    return (
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
                            Телефон: <span className="font-semibold">+7 (707) 509 93 12</span>
                        </p>
                        <p className="text-sm text-gray-700">
                            WhatsApp и Telegram отвечаем быстро, обычно в течение{" "}
                            <span className="font-semibold">5–15 минут</span>.
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
                            href={`https://wa.me/${WHATSAPP_PHONE}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"
                        >
                            {/* Иконка WhatsApp */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M20.52 3.48A11.86 11.86 0 0 0 12 0a12 12 0 1 0 6.15 22.28l.38.22 1.15.67a1.67 1.67 0 0 0 2.46-1.82l-.27-1.79-.06-.43A12 12 0 0 0 24 12a11.86 11.86 0 0 0-3.48-8.52zM12 21.33A9.33 9.33 0 1 1 21.33 12 9.34 9.34 0 0 1 12 21.33z" />
                            </svg>
                            Связаться в WhatsApp
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
                    Работаем по Каскелену и Алматы. Уточнить стоимость и время доставки можно в мессенджерах.
                </p>
                <p className="text-xs text-gray-500">
                    В переписке можно отправить нам список товаров или скрин с сайта — соберём заказ и посчитаем итог.
                </p>
            </div>

            {/* Заглушка под карту / локацию */}
            <div className="bg-gray-100 rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Здесь позже можно будет встроить карту или схему самовывоза.
            </div>
        </div>
    );
};
