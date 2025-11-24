// src/api/client.ts
import type { ProductsListResponse } from "../types/product";
import type { CategoriesListResponse, Category } from "../types/category";

// Базовый префикс для всех API-запросов.
// Nginx проксирует /api/* → backend:8080/*
const API_BASE_PATH = "/api";

// ====== вспомогательные функции для токенов ======

function getAccessToken(): string | null {
    return localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
}

function saveTokens(access: string, refresh: string) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
}

function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

// один общий флаг, чтобы не делать несколько refresh параллельно
let refreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
    const rt = getRefreshToken();
    if (!rt) return null;

    // если уже идёт refresh – просто ждём его
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const res = await fetch(`${API_BASE_PATH}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: rt }),
            });

            if (!res.ok) {
                clearTokens();
                return null;
            }

            const data = await res.json();
            // ожидаем формат: { ok: true, data: { access_token, refresh_token } }
            const pair = data.data as { access_token: string; refresh_token: string };
            saveTokens(pair.access_token, pair.refresh_token);
            return pair.access_token;
        } catch {
            clearTokens();
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

/**
 * Обёртка над fetch для админских запросов:
 *  - добавляет Bearer access_token
 *  - при 401 пытается сделать refresh и повторяет запрос
 */
async function authorizedFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    let token = getAccessToken();
    if (!token) {
        throw new Error("Не авторизован");
    }

    const makeRequest = (access: string) => {
        const headers: HeadersInit = {
            ...(options.headers || {}),
            Authorization: `Bearer ${access}`,
        };

        return fetch(`${API_BASE_PATH}${path}`, {
            ...options,
            headers,
        });
    };

    // первый запрос
    let res = await makeRequest(token);

    if (res.status !== 401) {
        return res;
    }

    // пробуем обновить токены
    const newToken = await refreshTokens();
    if (!newToken) {
        throw new Error("Не авторизован");
    }

    // повторяем запрос с новым access_token
    res = await makeRequest(newToken);
    return res;
}

// ====== публичные ручки (без авторизации) ======

export async function fetchProducts(params?: { q?: string }): Promise<ProductsListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.q) {
        searchParams.set("q", params.q);
    }

    const query = searchParams.toString();
    const url = `${API_BASE_PATH}/products${query ? `?${query}` : ""}`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Ошибка загрузки товаров: ${res.status}`);
    }

    return (await res.json()) as ProductsListResponse;
}

export async function fetchProduct(id: number) {
    const res = await fetch(`${API_BASE_PATH}/products/${id}`);

    if (res.status === 404) {
        throw new Error("Товар не найден");
    }

    if (!res.ok) {
        throw new Error(`Ошибка загрузки товара: ${res.status}`);
    }

    return await res.json(); // { ok: true, data: {...} }
}

export async function fetchCategories(): Promise<CategoriesListResponse> {
    const res = await fetch(`${API_BASE_PATH}/categories`);

    if (!res.ok) {
        throw new Error(`Ошибка загрузки категорий: ${res.status}`);
    }

    return (await res.json()) as CategoriesListResponse;
}

// ответ для одной категории
export interface CategoryResponse {
    ok: boolean;
    data: Category;
}

// GET /categories/:slug
export async function fetchCategory(slug: string): Promise<CategoryResponse> {
    const res = await fetch(`${API_BASE_PATH}/categories/${slug}`);

    if (res.status === 404) {
        throw new Error("Категория не найдена");
    }

    if (!res.ok) {
        throw new Error(`Ошибка загрузки категории: ${res.status}`);
    }

    return (await res.json()) as CategoryResponse;
}

// GET /products?category_slug=protein
export async function fetchProductsByCategory(
    slug: string
): Promise<ProductsListResponse> {
    const url = new URL(`${API_BASE_PATH}/products`, window.location.origin);
    url.searchParams.set("category_slug", slug);

    const res = await fetch(url.toString());

    if (!res.ok) {
        throw new Error(`Ошибка загрузки товаров: ${res.status}`);
    }

    return (await res.json()) as ProductsListResponse;
}

// ====== регистрация пользователя ======

export async function registerUser(body: {
    name: string;
    email: string;
    password: string;
}) {
    const res = await fetch(`${API_BASE_PATH}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg =
            data.error ||
            (data.errors ? "Ошибка валидации" : `Ошибка регистрации: ${res.status}`);
        throw new Error(msg);
    }

    // ожидаем формат: { ok: true, data: { id, name, email } }
    return data;
}

// ====== админские товары (через authorizedFetch) ======

export async function fetchAdminProducts(): Promise<ProductsListResponse> {
    const res = await authorizedFetch("/admin/products");

    if (res.status === 401 || res.status === 403) {
        throw new Error("Доступ запрещён");
    }

    if (!res.ok) {
        throw new Error(`Ошибка загрузки товаров админки: ${res.status}`);
    }

    return (await res.json()) as ProductsListResponse;
}

export async function createProduct(body: any) {
    const res = await authorizedFetch("/admin/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Ошибка создания товара: ${res.status}`);
    }

    return await res.json();
}

export async function updateProduct(id: number, body: any) {
    const res = await authorizedFetch(`/admin/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (res.status === 401 || res.status === 403) {
        throw new Error("Доступ запрещён");
    }

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Ошибка обновления товара: ${res.status}`);
    }

    return await res.json();
}

export async function deleteProduct(id: number) {
    const res = await authorizedFetch(`/admin/products/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Ошибка удаления товара: ${res.status}`);
    }

    return await res.json();
}

// ====== загрузка картинок на imgbb (как было) ======

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY as string | undefined;

export async function uploadImageToImgBB(file: File): Promise<string> {
    if (!IMGBB_API_KEY) {
        throw new Error("IMGBB API key не задан (VITE_IMGBB_API_KEY)");
    }

    const form = new FormData();
    form.append("key", IMGBB_API_KEY);
    form.append("image", file);

    const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        throw new Error(`Ошибка загрузки изображения: ${res.status}`);
    }

    const data = await res.json();
    return data.data.url as string;
}

// ====== админские категории (также через authorizedFetch) ======

export async function createCategory(body: any) {
    const res = await authorizedFetch("/admin/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Ошибка создания категории: ${res.status}`);
    }

    return await res.json();
}

export async function updateCategory(id: number, body: any) {
    const res = await authorizedFetch(`/admin/categories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Ошибка обновления категории: ${res.status}`);
    }

    return await res.json();
}

export async function deleteCategory(id: number) {
    const res = await authorizedFetch(`/admin/categories/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Ошибка удаления категории: ${res.status}`);
    }

    return await res.json();
}
