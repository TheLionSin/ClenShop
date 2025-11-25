import React, { useEffect, useState, useRef } from "react";
import type { Category } from "../types/category";
import { uploadImageToImgBB } from "../api/client";
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../api/client";
import { AdminHeader } from "../components/AdminHeader";

export const AdminCategoriesPage: React.FC = () => {

    const [imageUrl, setImageUrl] = useState("");
    const [imageUploading, setImageUploading] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // форма
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState<string>("");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // 🔽 ref для textarea с описанием
    const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

    // === мини HTML-редактор ===
    function wrapSelection(tag: string) {
        const el = descriptionRef.current;
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
        const el = descriptionRef.current;
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
        const el = descriptionRef.current;
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
    // === конец html-редактора ===

    function handleImageButtonClick() {
        fileInputRef.current?.click();
    }

    async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError(null);
        setImageUploading(true);

        try {
            const url = await uploadImageToImgBB(file);
            setImageUrl(url);
        } catch (err: any) {
            setImageError(err.message || "Ошибка загрузки изображения");
        } finally {
            setImageUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    function slugify(value: string): string {
        return value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9а-яё\-]/g, "");
    }

    async function loadCategories() {
        try {
            setLoading(true);
            setError(null);
            const resp = await fetchCategories();
            setCategories(resp.data.items);
        } catch (e: any) {
            setError(e.message || "Ошибка загрузки категорий");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCategories();
    }, []);

    function resetForm() {
        setName("");
        setSlug("");
        setSlugTouched(false);
        setDescription("");
        setParentId("");
        setEditingId(null);
        setImageUrl("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        setError(null);

        const body = {
            name,
            slug,
            description,
            parent_id: parentId ? Number(parentId) : null,
            image_url: imageUrl || "",
        };

        try {
            if (editingId === null) {
                await createCategory(body);
                setMessage("Категория создана");
            } else {
                await updateCategory(editingId, body);
                setMessage("Категория обновлена");
            }

            resetForm();
            await loadCategories();
        } catch (e: any) {
            setError(e.message || "Ошибка сохранения");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!window.confirm("Точно удалить категорию?")) return;

        try {
            await deleteCategory(id);
            await loadCategories();
        } catch (e: any) {
            alert(e.message || "Ошибка удаления");
        }
    }

    function startEdit(cat: Category) {
        setEditingId(cat.id);
        setName(cat.name);
        setSlug(cat.slug);
        setSlugTouched(true);
        setDescription(cat.description || "");
        setImageUrl(cat.image_url || "");
        setParentId(cat.parent_id ? String(cat.parent_id) : "");
        setMessage("");
    }

    // только корневые для выбора родителя
    const rootCategories = categories.filter((c) => !c.parent_id);

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
            <AdminHeader title="Категории" active="categories" />

            <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
                {/* 👇 ГЛАВНОЕ ИСПРАВЛЕНИЕ ЗДЕСЬ:
                   Добавил `min-w-0`. Без этого таблица разрывает CSS Grid на мобильных устройствах,
                   и появляется горизонтальная прокрутка всей страницы.
                */}
                <section className="md:col-span-2 min-w-0">
                    <h2 className="text-lg font-bold mb-3">Список категорий</h2>

                    {loading && <div>Загрузка...</div>}

                    {error && (
                        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-200">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left whitespace-nowrap">ID</th>
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Название</th>
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Slug</th>
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Родитель</th>
                                    <th className="px-3 py-2 text-left whitespace-nowrap">Действия</th>
                                </tr>
                                </thead>
                                <tbody>
                                {categories.map((cat) => {
                                    const parent = categories.find(
                                        (c) => c.id === cat.parent_id,
                                    );
                                    return (
                                        <tr key={cat.id} className="border-t">
                                            <td className="px-3 py-2">{cat.id}</td>
                                            <td className="px-3 py-2">{cat.name}</td>
                                            <td className="px-3 py-2">{cat.slug}</td>
                                            <td className="px-3 py-2">
                                                {parent ? parent.name : "—"}
                                            </td>
                                            <td className="px-3 py-2 space-x-2 whitespace-nowrap">
                                                <button
                                                    className="text-blue-600 hover:underline"
                                                    onClick={() => startEdit(cat)}
                                                >
                                                    Редактировать
                                                </button>
                                                <button
                                                    className="text-red-600 hover:underline"
                                                    onClick={() => handleDelete(cat.id)}
                                                >
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {categories.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-3 py-3 text-center text-gray-500"
                                        >
                                            Категорий пока нет
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Форма создания/редактирования */}
                <section className="min-w-0">
                    <h2 className="text-lg font-bold mb-3">
                        {editingId ? "Редактировать категорию" : "Создать категорию"}
                    </h2>

                    {message && (
                        <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                            {message}
                        </div>
                    )}

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Название
                            </label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded text-sm"
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

                        <div>
                            <label className="block text-sm font-medium mb-1">Slug</label>
                            <input
                                type="text"
                                className="w-full border p-2 rounded text-sm"
                                value={slug}
                                onChange={(e) => {
                                    setSlug(e.target.value);
                                    setSlugTouched(true);
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Родительская категория
                            </label>
                            <select
                                className="w-full border p-2 rounded text-sm"
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                            >
                                <option value="">Нет (корневая)</option>
                                {rootCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Описание */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Описание (опционально)
                            </label>

                            <div className="flex flex-wrap gap-2 mb-2 text-xs">
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
                                ref={descriptionRef}
                                className="w-full border p-2 rounded text-sm min-h-[120px]"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Фото категории */}
                        <div className="border rounded p-3 space-y-3 mt-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">Фото категории</span>
                                <button
                                    type="button"
                                    onClick={handleImageButtonClick}
                                    disabled={imageUploading}
                                    className="text-sm bg-gray-800 text-white px-3 py-1 rounded-full hover:bg-gray-900 disabled:opacity-60"
                                >
                                    {imageUploading ? "Загрузка..." : "+ Загрузить фото"}
                                </button>
                            </div>

                            {imageError && (
                                <div className="text-sm text-red-600">{imageError}</div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageFileChange}
                            />

                            {imageUrl ? (
                                <div className="flex items-center gap-3">
                                    <img
                                        src={imageUrl}
                                        alt="Категория"
                                        className="w-24 h-24 object-contain rounded border bg-white"
                                    />
                                    <span className="text-xs text-gray-500 break-all">
                                        {imageUrl}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500">
                                    Фото пока нет. Загрузите изображение категории.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                            >
                                {saving
                                    ? "Сохранение..."
                                    : editingId
                                        ? "Сохранить изменения"
                                        : "Создать"}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="border border-gray-400 px-4 py-2 rounded text-sm"
                                >
                                    Отмена
                                </button>
                            )}
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};