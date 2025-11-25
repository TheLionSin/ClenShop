// src/components/AdminHeader.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type AdminHeaderActive = "products" | "categories" | "none";

interface AdminHeaderProps {
    title: string;              // текст после "Админ-панель · ..."
    active: AdminHeaderActive;  // что подсвечивать: 'products' | 'categories' | 'none'
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, active }) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const go = (path: string) => {
        navigate(path);
        setMenuOpen(false);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/admin/login");
        setMenuOpen(false);
    };

    const btnBase =
        "px-3 py-1 rounded-full border text-xs sm:text-sm transition-colors";
    const btnActive = "bg-white/10 border-gray-300";
    const btnDefault = "border-gray-500 hover:bg-gray-800";

    return (
        <header className="w-full bg-gray-900 text-white">
            <div className="w-full flex items-center justify-between gap-3 px-4 py-3">
                {/* Логотип + заголовок */}
                <div className="flex items-center gap-3 min-w-0">
                    <img
                        src="/Clen.jpg"
                        alt="CLEN.KZ logo"
                        className="h-10 w-auto object-contain max-w-[160px]"
                    />

                    <div className="font-bold text-base md:text-lg truncate">
                        Админ-панель · {title}
                    </div>
                </div>

                {/* Кнопки (desktop) */}
                <div className="hidden sm:flex flex-wrap gap-2">
                    <button
                        onClick={() => go("/admin/products")}
                        className={`${btnBase} ${
                            active === "products" ? btnActive : btnDefault
                        }`}
                    >
                        Товары
                    </button>

                    <button
                        onClick={() => go("/admin/categories")}
                        className={`${btnBase} ${
                            active === "categories" ? btnActive : btnDefault
                        }`}
                    >
                        Категории
                    </button>

                    <button
                        onClick={() => go("/")}
                        className={`${btnBase} ${btnDefault}`}
                    >
                        На сайт
                    </button>

                    <button
                        onClick={logout}
                        className="px-3 py-1 rounded-full border border-red-400 text-red-200 hover:bg-red-600 hover:text-white text-xs sm:text-sm"
                    >
                        Выйти
                    </button>
                </div>

                {/* Бургер (mobile) */}
                <button
                    type="button"
                    className="sm:hidden flex flex-col justify-center items-center w-9 h-9 border border-gray-500 rounded-md"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Открыть меню"
                >
                    <span className="block w-4 h-0.5 bg-white mb-1" />
                    <span className="block w-4 h-0.5 bg-white mb-1" />
                    <span className="block w-4 h-0.5 bg-white" />
                </button>
            </div>

            {/* Выпадающее меню (mobile) */}
            {menuOpen && (
                <div className="sm:hidden border-t border-gray-800 px-4 pb-3 pt-2 space-y-2 text-sm">
                    <button
                        onClick={() => go("/admin/products")}
                        className="block w-full text-left py-1 px-2 rounded hover:bg-gray-800"
                    >
                        Товары
                    </button>
                    <button
                        onClick={() => go("/admin/categories")}
                        className="block w-full text-left py-1 px-2 rounded hover:bg-gray-800"
                    >
                        Категории
                    </button>
                    <button
                        onClick={() => go("/")}
                        className="block w-full text-left py-1 px-2 rounded hover:bg-gray-800"
                    >
                        На сайт
                    </button>
                    <button
                        onClick={logout}
                        className="block w-full text-left py-1 px-2 rounded text-red-300 hover:bg-red-600 hover:text-white"
                    >
                        Выйти
                    </button>
                </div>
            )}
        </header>
    );
};
