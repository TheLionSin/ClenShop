import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchCategories,
    updateProduct,
    uploadImageToImgBB,
    fetchAdminProduct,
} from "../api/client";
import type { Category } from "../types/category";
import type { Product, ProductImage } from "../types/product";
import { AdminHeader } from "../components/AdminHeader";

export const AdminEditProductPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // поля товара
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [isActive, setIsActive] = useState(true);
    const [categoryId, setCategoryId] = useState("");

    // --- ВКУСЫ ---
    const [tastes, setTastes] = useState<string[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // категории
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // изображения
    const [images, setImages] = useState<ProductImage[]>([]);
    const [imageUploading, setImageUploading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    // статус
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    function slugify(value: string): string {
        return value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9а-яё\-]/g, "");
    }

    // загрузка товара + категорий
    useEffect(() => {
        if (!id) {
            navigate("/admin/products");
            return;
        }

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const [prodResp, catsResp] = await Promise.all([
                    fetchAdminProduct(Number(id)),
                    fetchCategories(),
                ]);

                const prod: Product = prodResp.data;

                setName(prod.name);
                setSlug(prod.slug);
                setDescription(prod.description);
                setPrice(String(prod.price));
                setStock(String(prod.stock));
                setIsActive(prod.is_active);
                setCategoryId(String(prod.category_id));
                setImages(prod.images || []);
                setTastes(prod.tastes || []); // <-- ВКУСЫ

                setCategories(catsResp.data.items);
            } catch (e: any) {
                setError(e.message || "Ошибка загрузки товара");
            } finally {
                setLoading(false);
                setCategoriesLoading(false);
            }
        }

        load();
    }, [id, navigate]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!id) return;

        setSaving(true);
        setError(null);
        setMessage("");

        try {
            const imagesPayload = images.map((img, index) => ({
                url: img.url,
                is_primary: img.is_primary ?? index === 0,
                sort_order: index,
            }));

            const tastesPayload = tastes
                .map((t) => t.trim())
                .filter((t) => t.length > 0);

            await updateProduct(Number(id), {
                name,
                slug,
                description,
                price: Number(price),
                stock: Number(stock),
                is_active: isActive,
                category_id: Number(categoryId),
                images: imagesPayload,
                tastes: tastesPayload, // <-- ВКУСЫ
            });

            navigate("/admin/products", {
                state: { message: `Товар "${name}" успешно обновлён` },
            });
        } catch (e: any) {
            setError(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    }

    function wrapSelection(tag: string) {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const value = description;

        const before = value.slice(0, start);
        const selected = value.slice(start, end);
        const after = value.slice(end);

        const open = `<${tag}>`;
        const close = `</${tag}>`;

        const newValue = before + open + selected + close + after;
        setDescription(newValue);

        const cursorPos = (before + open + selected + close).length;
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(cursorPos, cursorPos);
        }, 0);
    }

    function insertAtCursor(text: string) {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const value = description;

        const before = value.slice(0, start);
        const after = value.slice(end);

        const newValue = before + text + after;
        setDescription(newValue);

        const pos = before.length + text.length;
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(pos, pos);
        }, 0);
    }

    function wrapAsList() {
        const el = textareaRef.current;
        if (!el) return;

        const start = el.selectionStart;
        const end = el.selectionEnd;
        const value = description;

        const before = value.slice(0, start);
        const selected = value.slice(start, end) || "Элемент списка";
        const after = value.slice(end);

        const lines = selected
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        const li = lines.map((line) => `<li>${line}</li>`).join("");
        const wrapped = `<ul>${li}</ul>`;

        const newValue = before + wrapped + after;
        setDescription(newValue);

        const cursorPos = (before + wrapped).length;
        setTimeout(() => {
            el.focus();
            el.setSelectionRange(cursorPos, cursorPos);
        }, 0);
    }

    const productCategories = categories.filter(
        (cat) => cat.parent_id != null,
    );

    // --- ВКУСЫ: обработчики ---
    const handleAddTaste = () => {
        setTastes((prev) => [...prev, ""]);
    };

    const handleTasteChange = (index: number, value: string) => {
        setTastes((prev) => prev.map((t, i) => (i === index ? value : t)));
    };

    const handleRemoveTaste = (index: number) => {
        setTastes((prev) => prev.filter((_, i) => i !== index));
    };

    // --- работа с изображениями ---
    function handleAddImageClick() {
        fileInputRef.current?.click();
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError(null);
        setImageUploading(true);

        try {
            const url = await uploadImageToImgBB(file);

            setImages((prev) => {
                const newImg: ProductImage = {
                    id: Date.now(),
                    url,
                    is_primary: prev.length === 0,
                    sort_order: prev.length,
                };
                return [...prev, newImg];
            });
        } catch (err: any) {
            setImageError(err.message || "Ошибка загрузки изображения");
        } finally {
            setImageUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    function handleMakePrimary(idx: number) {
        setImages((prev) =>
            prev.map((img, i) => ({
                ...img,
                is_primary: i === idx,
            })),
        );
    }

    function handleRemoveImage(idx: number) {
        setImages((prev) => prev.filter((_, i) => i !== idx));
    }

    return (
        <div className="min-h-screen bg-[url('/bg2.jpg')] bg-cover bg-center bg-fixed">
            <div className="min-h-screen bg-slate-900/70">
                <AdminHeader
                    title={`Редактировать товар${id ? ` #${id}` : ""}`}
                    active="products"
                />

                <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                    <button
                        onClick={() => navigate("/admin/products")}
                        className="text-sm text-blue-200 underline"
                    >
                        ← Назад к списку товаров
                    </button>

                    {loading ? (
                        <div className="bg-white/95 rounded-lg shadow p-4">
                            Загрузка товара...
                        </div>
                    ) : error ? (
                        <div className="bg-white/95 rounded-lg shadow p-4">
                            <div className="mb-3 p-2 text-sm bg-red-100 border border-red-300 rounded">
                                {error}
                            </div>
                            <button
                                className="text-sm text-blue-600 underline"
                                onClick={() => navigate("/admin/products")}
                            >
                                Назад к списку
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/95 rounded-lg shadow p-4">
                            <h1 className="text-2xl font-bold mb-4">
                                Редактировать товар #{id}
                            </h1>

                            {message && (
                                <div className="mb-3 p-2 text-sm bg-green-100 border border-green-300 rounded">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="mb-3 p-2 text-sm bg-red-100 border border-red-300 rounded">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                {/* Название */}
                                <div>
                                    <label className="block text-sm font-medium">
                                        Название
                                    </label>
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
                                    <label className="block text-sm font-medium">
                                        Slug
                                    </label>
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
                                    <label className="block text-sm font-medium mb-1">
                                        Описание
                                    </label>

                                    <div className="flex flex-wrap gap-2 mb-2 text-sm">
                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                            onClick={() => wrapSelection("h1")}
                                        >
                                            H1
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                            onClick={() => wrapSelection("h2")}
                                        >
                                            H2
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                            onClick={() => wrapSelection("h3")}
                                        >
                                            H3
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                            onClick={() => wrapSelection("h4")}
                                        >
                                            H4
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                            onClick={() => wrapSelection("h5")}
                                        >
                                            H5
                                        </button>

                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100 font-semibold"
                                            onClick={() => wrapSelection("strong")}
                                        >
                                            Жирный
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100 italic"
                                            onClick={() => wrapSelection("em")}
                                        >
                                            Курсив
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100 underline"
                                            onClick={() => wrapSelection("u")}
                                        >
                                            Подчеркнутый
                                        </button>

                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                            onClick={wrapAsList}
                                        >
                                            Список
                                        </button>

                                        <button
                                            type="button"
                                            className="px-2 py-1 border rounded hover:bg-gray-100"
                                            onClick={() => insertAtCursor("<br />")}
                                        >
                                            Перенос строки
                                        </button>
                                    </div>

                                    <textarea
                                        ref={textareaRef}
                                        className="w-full border p-2 rounded min-h-[160px]"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                    />
                                </div>

                                {/* ВКУСЫ */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Вкусы (ароматы)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Оставь пусто, если у товара один вкус.
                                    </p>

                                    {tastes.length === 0 && (
                                        <button
                                            type="button"
                                            onClick={handleAddTaste}
                                            className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50"
                                        >
                                            + Добавить вкус
                                        </button>
                                    )}

                                    {tastes.length > 0 && (
                                        <div className="space-y-2">
                                            {tastes.map((t, index) => (
                                                <div
                                                    key={index}
                                                    className="flex gap-2 items-center"
                                                >
                                                    <input
                                                        type="text"
                                                        className="flex-1 border p-2 rounded text-sm"
                                                        value={t}
                                                        placeholder="Например: Шоколад"
                                                        onChange={(e) =>
                                                            handleTasteChange(
                                                                index,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <button
                                                        type="button"
                                                        className="text-xs text-red-600 underline"
                                                        onClick={() =>
                                                            handleRemoveTaste(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={handleAddTaste}
                                                className="text-xs px-3 py-1 border rounded-full hover:bg-gray-50"
                                            >
                                                + Добавить ещё
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Категория */}
                                <div>
                                    <label className="block text-sm font-medium">
                                        Категория
                                    </label>

                                    {categoriesLoading ? (
                                        <div className="text-gray-500 text-sm">
                                            Загрузка категорий...
                                        </div>
                                    ) : (
                                        <select
                                            className="w-full border p-2 rounded"
                                            value={categoryId}
                                            onChange={(e) =>
                                                setCategoryId(e.target.value)
                                            }
                                            required
                                        >
                                            <option value="">
                                                Выберите категорию
                                            </option>
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
                                    <label className="block text-sm font-medium">
                                        Цена
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border p-2 rounded"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Остаток */}
                                <div>
                                    <label className="block text-sm font-medium">
                                        Количество
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border p-2 rounded"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                    />
                                </div>

                                {/* Активен */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) =>
                                            setIsActive(e.target.checked)
                                        }
                                    />
                                    <span className="text-sm">
                                        Товар активен
                                    </span>
                                </div>

                                {/* Фотографии */}
                                <div className="border rounded p-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">
                                            Фотографии товара
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleAddImageClick}
                                            disabled={imageUploading}
                                            className="text-sm bg-gray-800 text-white px-3 py-1 rounded-full hover:bg-gray-900 disabled:opacity-60"
                                        >
                                            {imageUploading
                                                ? "Загрузка..."
                                                : "+ Добавить фото"}
                                        </button>
                                    </div>

                                    {imageError && (
                                        <div className="text-sm text-red-600">
                                            {imageError}
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />

                                    {images.length === 0 ? (
                                        <div className="text-xs text-gray-500">
                                            Пока нет фотографий. Добавьте хотя бы
                                            одно изображение товара.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {images.map((img, index) => (
                                                <div
                                                    key={img.id ?? index}
                                                    className="border rounded overflow-hidden bg-white flex flex-col"
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt=""
                                                        className="w-full h-24 object-cover"
                                                    />
                                                    <div className="p-2 flex flex-col gap-1 text-xs">
                                                        {img.is_primary && (
                                                            <span className="text-green-600 font-semibold">
                                                                Главная
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="text-blue-600 underline"
                                                            onClick={() =>
                                                                handleMakePrimary(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            Сделать главной
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="text-red-600 underline"
                                                            onClick={() =>
                                                                handleRemoveImage(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Сохранить */}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                >
                                    {saving
                                        ? "Сохранение..."
                                        : "Сохранить изменения"}
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
