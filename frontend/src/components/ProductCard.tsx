import React from "react";
import type { Product } from "../types/product";

const WHATSAPP_PHONE = "77075099312"; // потом заменишь на свой номер

interface Props {
    product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
    const mainImage =
        product.images && product.images.length > 0
            ? product.images[0].url
            : null;

    const priceText = new Intl.NumberFormat("ru-RU").format(product.price);

    const waText = encodeURIComponent(
        `Здравствуйте! Хочу заказать товар "${product.name}" (ID: ${product.id})`
    );
    const waLink = `https://wa.me/${WHATSAPP_PHONE}?text=${waText}`;

    return (
        <div className="bg-white shadow-sm rounded-lg p-3 text-sm flex flex-col gap-2">
            {mainImage ? (
                <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                />
            ) : (
                <div className="w-full h-32 bg-gray-200 rounded-md mb-2" />
            )}

            <div className="font-semibold line-clamp-2">{product.name}</div>

            <div className="text-green-600 font-bold text-base">{priceText} ₸</div>

            <button
                onClick={() => window.open(waLink, "_blank")}
                className="mt-auto bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-2 rounded-full"
            >
                Написать в WhatsApp
            </button>
        </div>
    );
};
