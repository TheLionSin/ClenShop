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

const INSTAGRAM_LINK = "https://www.instagram.com/clen_kz"; // номер без "+"
const TELEGRAM_LINK = "https://t.me/Clen_kz"; // поменяй на свой

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
    const [isContactsBubbleOpen, setIsContactsBubbleOpen] = useState(true);

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
                        <div></div>
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
                                    src="/ava2.jpg"
                                    alt="CLEN.KZ Логотип"
                                    className="h-16 w-auto object-contain"
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
                                href={`${INSTAGRAM_LINK}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg
               bg-gradient-to-tr from-pink-500 via-red-500 to-purple-600
               hover:opacity-90 transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="26"
                                    height="26"
                                    fill="white"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76
    0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.66 0 3 1.34
    3 3v10c0 1.66-1.34 3-3 3H7c-1.66 0-3-1.34-3-3V7c0-1.66
    1.34-3 3-3h10zm-5 3.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5
    0 0 0 12 7.5zm0 7.3A2.8 2.8 0 1 1 14.8 12 2.79 2.79
    0 0 1 12 14.8zM17.35 6.3a1.05 1.05 0 1 0 1.05 1.05
    1.05 1.05 0 0 0-1.05-1.05z"/>
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
                            <span></span>
                            <a
                                href={`${TELEGRAM_LINK}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-green-600 hover:underline"
                            >
                                Написать в Telegram
                            </a>
                            <span>Created by TG @Darkus15</span>
                        </div>
                    </div>
                </footer>
            </div>
        </CategoriesContext.Provider>
    );
};
