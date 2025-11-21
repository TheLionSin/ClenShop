import React, { useState, useEffect } from "react";
import { createProduct, fetchCategories } from "../api/client";
import type { Category } from "../types/category";

export const AdminCreateProductPage: React.FC = () => {
    // --------- поля формы ---------
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [isActive, setIsActive] = useState(true);
    const [categoryId, setCategoryId] = useState("");

    // --------- категории ---------
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const productCategories = categories.filter(cat => cat.parent_id != null);

    // --------- статус формы ---------
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    // --------- slugify функция ---------
    function slugify(value: string): string {
        return value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")              // пробелы → "-"
            .replace(/[^a-z0-9а-яё\-]/g, "");   // убрать лишние символы
    }

    // --------- загрузка категорий ---------
    useEffect(() => {
        async function load() {
            try {
                const resp = await fetchCategories();
                setCategories(resp.data.items);
            } catch (e: any) {
                setCategoriesError(e.message || "Ошибка загрузки категорий");
            } finally {
                setCategoriesLoading(false);
            }
        }
        load();
    }, []);

    // --------- отправка формы ---------
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setMessage("");

        try {
            await createProduct({
                name,
                slug,
                description,
                price: Number(price),
                stock: Number(stock),
                is_active: isActive,
                category_id: Number(categoryId),
                images: [] // пока без картинок
            });

            setMessage("Товар успешно создан!");
            setName("");
            setSlug("");
            setSlugTouched(false);
            setDescription("");
            setPrice("");
            setStock("0");
            setCategoryId("");
        } catch (err: any) {
            setMessage("Ошибка: " + (err.message || "Что-то пошло не так"));
        }

        setSubmitting(false);
    }

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Создать товар</h1>

            {message && (
                <div className="mb-4 p-2 text-sm bg-blue-100 border border-blue-300 rounded">
                    {message}
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Название */}
                <div>
                    <label className="block text-sm font-medium">Название</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={name}
                        onChange={(e) => {
                            const v = e.target.value;
                            setName(v);
                            if (!slugTouched) {
                                setSlug(slugify(v));
                            }
                        }}
                        required
                    />
                </div>

                {/* Slug */}
                <div>
                    <label className="block text-sm font-medium">Slug</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setSlugTouched(true);
                        }}
                        required
                    />
                </div>

                {/* Описание */}
                <div>
                    <label className="block text-sm font-medium">Описание</label>
                    <textarea
                        className="w-full border p-2 rounded"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                {/* Категория */}
                <div>
                    <label className="block text-sm font-medium">Категория</label>

                    {categoriesLoading ? (
                        <div className="text-gray-500 text-sm">Загрузка...</div>
                    ) : categoriesError ? (
                        <div className="text-red-600 text-sm">{categoriesError}</div>
                    ) : (
                        <select
                            className="w-full border p-2 rounded"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Выберите категорию</option>
                            {productCategories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Цена */}
                <div>
                    <label className="block text-sm font-medium">Цена</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>

                {/* Кол-во */}
                <div>
                    <label className="block text-sm font-medium">Количество</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                    />
                </div>

                {/* Активен ли товар */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <label className="text-sm">Товар активен</label>
                </div>

                {/* Кнопка */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    {submitting ? "Создание..." : "Создать товар"}
                </button>
            </form>
        </div>
    );
};
