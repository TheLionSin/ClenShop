// src/layouts/MainLayout.tsx
import React,
{
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../api/client";
import type { Category } from "../types/category";

// --------- контекст с категориями ---------
interface CategoriesContextValue {
    categories: Category[];
    loadingCategories: boolean;
    errorCategories: string | null;
}

const WHATSAPP_PHONE = "77075099312"; // номер без "+"
const TELEGRAM_LINK = "https://t.me/Maxpool69"; // поменяй на свой

const CategoriesContext = createContext<CategoriesContextValue | undefined>(
    undefined,
);

export const useCategories = (): CategoriesContextValue => {
    const ctx = useContext(CategoriesContext);
    if (!ctx) {
        throw new Error("useCategories должен вызываться внутри MainLayout");
    }
    return ctx;
};

// --------- layout ---------
interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const navigate = useNavigate();

    const [searchValue, setSearchValue] = useState("");
    const [isContactsBubbleOpen, setIsContactsBubbleOpen] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
    const [desktopMenuTimeoutId, setDesktopMenuTimeoutId] =
        useState<number | null>(null);

    useEffect(() => {
        fetchCategories()
            .then((resp) => setCategories(resp.data.items))
            .catch((e: any) =>
                setErrorCategories(e?.message || "Ошибка загрузки категорий"),
            )
            .finally(() => setLoadingCategories(false));
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchValue.trim();

        if (trimmed) {
            navigate(`/?q=${encodeURIComponent(trimmed)}`);
        } else {
            navigate("/");
        }
    };

    const parentCategories = useMemo(
        () => categories.filter((c) => !c.parent_id),
        [categories],
    );
    const childCategories = useMemo(
        () => categories.filter((c) => !!c.parent_id),
        [categories],
    );
    const groupedByParent = useMemo(
        () =>
            parentCategories.map((parent) => ({
                parent,
                children: childCategories.filter(
                    (child) => child.parent_id === parent.id,
                ),
            })),
        [parentCategories, childCategories],
    );

    const openDesktopMenu = () => {
        if (desktopMenuTimeoutId !== null) {
            window.clearTimeout(desktopMenuTimeoutId);
            setDesktopMenuTimeoutId(null);
        }
        setIsDesktopMenuOpen(true);
    };

    const closeDesktopMenuWithDelay = () => {
        const id = window.setTimeout(() => {
            setIsDesktopMenuOpen(false);
            setDesktopMenuTimeoutId(null);
        }, 180);
        setDesktopMenuTimeoutId(id);
    };

    const handleCategoryClick = (slug: string) => {
        navigate(`/category/${slug}`);
        setIsMobileMenuOpen(false);
        setIsDesktopMenuOpen(false);
    };

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            setIsMobileMenuOpen(false);
        }
    };

    const ctxValue: CategoriesContextValue = {
        categories,
        loadingCategories,
        errorCategories,
    };

    return (
        <CategoriesContext.Provider value={ctxValue}>
            <div className="min-h-screen flex flex-col bg-gray-50">
                {/* верхняя синяя полоса */}
                <div className="w-full bg-blue-700 text-white text-xs md:text-sm">
                    <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-2">
                        <div>Магазин спортивного питания</div>
                        <div>Инфо: +7 (707) 509 93 12</div>
                    </div>
                </div>

                {/* хедер */}
                <header className="w-full bg-white shadow">
                    <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between gap-4">
                        {/* левая часть: бургер + логотипы/баннер */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="md:hidden p-2 rounded-md border border-gray-200"
                                onClick={() => setIsMobileMenuOpen((v) => !v)}
                                aria-label="Открыть меню"
                            >
                                <span className="block w-5 h-0.5 bg-gray-800 mb-1" />
                                <span className="block w-5 h-0.5 bg-gray-800 mb-1" />
                                <span className="block w-5 h-0.5 bg-gray-800" />
                            </button>

                            {/* Группа логотипов. Увеличил gap-4 для лучшего разделения. */}
                            <Link to="/" className="flex items-center gap-1">
                                {/* 1. Основной круглый логотип (Маскот) */}
                                <img
                                    src="/logo.png"
                                    alt="CLEN.KZ Логотип"
                                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover bg-white"
                                />

                                <img
                                    src="/clen.kz.png"
                                    alt="CLEN.KZ Спортивное питание"
                                    className="h-16 md:h-24 w-auto object-contain"
                                />
                            </Link>
                        </div>

                        {/* поиск — десктоп */}
                        <div className="flex-1 max-w-xl hidden md:block">
                            <form onSubmit={handleSearchSubmit}>
                                <input
                                    type="text"
                                    placeholder="Поиск по товарам..."
                                    className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                />
                            </form>
                        </div>

                        {/* навигация + корзина */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-700">
                                {/* МЕНЮ с выпадашкой */}
                                <div
                                    className="relative"
                                    onMouseEnter={openDesktopMenu}
                                    onMouseLeave={closeDesktopMenuWithDelay}
                                >
                                    <button
                                        type="button"
                                        className="px-3 py-1 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 hover:text-green-600 transition-colors text-[13px]"
                                    >
                                        МЕНЮ
                                    </button>

                                    {isDesktopMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-[420px] bg-white border rounded-xl shadow-lg z-20 p-4">
                                            {loadingCategories && (
                                                <div className="text-xs text-gray-500">
                                                    Загрузка категорий...
                                                </div>
                                            )}

                                            {errorCategories && (
                                                <div className="text-xs text-red-500">
                                                    {errorCategories}
                                                </div>
                                            )}

                                            {!loadingCategories &&
                                                !errorCategories &&
                                                groupedByParent.map(
                                                    ({ parent, children }) =>
                                                        children.length === 0 ? null : (
                                                            <div
                                                                key={parent.id}
                                                                className="mb-3 last:mb-0"
                                                            >
                                                                <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                                                                    {parent.name}
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-1 text-sm">
                                                                    {children.map((child) => (
                                                                        <button
                                                                            key={child.id}
                                                                            type="button"
                                                                            className="text-left px-1 py-0.5 rounded hover:bg-green-50 hover:text-green-700"
                                                                            onClick={() =>
                                                                                handleCategoryClick(child.slug)
                                                                            }
                                                                        >
                                                                            {child.name}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ),
                                                )}

                                            {!loadingCategories &&
                                                !errorCategories &&
                                                groupedByParent.every(
                                                    (g) => g.children.length === 0,
                                                ) && (
                                                    <div className="text-xs text-gray-500">
                                                        Категории пока не добавлены.
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>

                                {/* КОНТАКТЫ → страница /contacts */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/contacts")}
                                    className="px-3 py-1 rounded-full border border-transparent hover:border-gray-200 hover:bg-gray-50 hover:text-green-600 transition-colors text-[13px]"
                                >
                                    КОНТАКТЫ
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* поиск — мобилка */}
                    <div className="px-4 pb-3 md:hidden">
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Поиск по товарам..."
                                className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </form>
                    </div>

                    {/* мобильное меню */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
                            <div className="max-w-6xl mx-auto px-4 py-4 space-y-5">
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                                        Категории
                                    </h3>

                                    {loadingCategories && (
                                        <div className="text-sm text-gray-500">
                                            Загрузка категорий...
                                        </div>
                                    )}
                                    {errorCategories && (
                                        <div className="text-xs text-red-500">
                                            {errorCategories}
                                        </div>
                                    )}

                                    {!loadingCategories &&
                                        !errorCategories &&
                                        groupedByParent.map(({ parent, children }) =>
                                            children.length === 0 ? null : (
                                                <div key={parent.id} className="mb-4">
                                                    <div className="font-semibold text-gray-900 mb-1">
                                                        {parent.name}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                                                        {children.map((child) => (
                                                            <button
                                                                key={child.id}
                                                                type="button"
                                                                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-green-50 hover:text-green-700 transition-colors"
                                                                onClick={() =>
                                                                    handleCategoryClick(child.slug)
                                                                }
                                                            >
                                                                {child.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                </div>

                                <div className="pt-3 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection("categories-section")}
                                        className="block w-full text-left py-1"
                                    >
                                        Меню
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            navigate("/contacts");
                                        }}
                                        className="block w-full text-left py-1"
                                    >
                                        Контакты
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* контент страниц */}
                <main className="flex-1">{children}</main>

                {/* плавающая кнопка контактов */}
                <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
                    {isContactsBubbleOpen && (
                        <>
                            <a
                                href={`https://wa.me/${WHATSAPP_PHONE}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-green-500 hover:bg-green-600 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="26"
                                    height="26"
                                    fill="white"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.52 3.48A11.86 11.86 0 0 0 12 0a12 12 0 1 0 6.15 22.28l.38.22 1.15.67a1.67 1.67 0 0 0 2.46-1.82l-.27-1.79-.06-.43A12 12 0 0 0 24 12a11.86 11.86 0 0 0-3.48-8.52zM12 21.33A9.33 9.33 0 1 1 21.33 12 9.34 9.34 0 0 1 12 21.33zm5-6.83c-.27-.14-1.64-.81-1.9-.9s-.44-.14-.62.14-.71.9-.87 1.08-.32.2-.6.07a7.66 7.66 0 0 1-2.25-1.39 8.44 8.44 0 0 1-1.56-1.94c-.16-.27 0-.42.12-.55s.27-.32.41-.48a1.83 1.83 0 0 0 .27-.45.5.5 0 0 0 0-.48c-.08-.14-.62-1.49-.85-2s-.45-.43-.62-.44h-.53a1 1 0 0 0-.7.33 2.88 2.88 0 0 0-.9 2.12 5 5 0 0 0 1.09 2.64A11.41 11.41 0 0 0 12 17.2a9.7 9.7 0 0 0 3.24.61 2.77 2.77 0 0 0 1.94-.84 2.24 2.24 0 0 0 .48-1.58c-.06-.14-.24-.2-.4-.29z" />
                                </svg>
                            </a>

                            <a
                                href={TELEGRAM_LINK}
                                target="_blank"
                                rel="noreferrer"
                                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="26"
                                    height="26"
                                    fill="white"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M9.992 15.674l-.396 5.588c.568 0 .813-.246 1.11-.543l2.664-2.575 5.521 4.043c1.013.558 1.729.264 1.999-.937l3.621-17.03.001-.001c.32-1.496-.54-2.081-1.52-1.719L.613 9.32c-1.453.568-1.431 1.385-.262 1.763l5.68 1.772L18.94 5.255c.54-.353 1.034-.157.627.195" />
                                </svg>
                            </a>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsContactsBubbleOpen((v) => !v)}
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
                    >
                        <span className="text-white text-2xl">
                            {isContactsBubbleOpen ? "×" : "✉"}
                        </span>
                    </button>
                </div>

                {/* футер */}
                <footer id="contacts-section" className="w-full bg-white border-t mt-4">
                    <div className="max-w-6xl mx-auto px-4 py-4 text-xs md:text-sm text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <span>© {new Date().getFullYear()} CLEN.KZ</span>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <span>Телефон: +7 (707) 509 93 12</span>
                            <a
                                href={`https://wa.me/${WHATSAPP_PHONE}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-green-600 hover:underline"
                            >
                                Написать в WhatsApp
                            </a>
                            <span>Created by TG @Darkus15</span>
                        </div>
                    </div>
                </footer>
            </div>
        </CategoriesContext.Provider>
    );
};
