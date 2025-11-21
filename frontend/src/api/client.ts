// src/api/client.ts
import type { ProductsListResponse } from "../types/product";
import type { CategoriesListResponse } from "../types/category";

const API_BASE_URL = "http://localhost:8080";

export async function fetchProducts(): Promise<ProductsListResponse> {
    const res = await fetch(`${API_BASE_URL}/products`);

    if (!res.ok) {
        throw new Error(`Ошибка загрузки товаров: ${res.status}`);
    }

    return (await res.json()) as ProductsListResponse;
}

export async function fetchAdminProducts(): Promise<ProductsListResponse> {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        throw new Error("Не авторизован");
    }

    const res = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (res.status === 401 || res.status === 403) {
        throw new Error("Доступ запрещён");
    }

    if (!res.ok) {
        throw new Error(`Ошибка загрузки товаров админки: ${res.status}`);
    }

    return (await res.json()) as ProductsListResponse;
}

export async function fetchCategories(): Promise<CategoriesListResponse> {
    const res = await fetch(`${API_BASE_URL}/categories`);

    if (!res.ok) {
        throw new Error(`Ошибка загрузки категорий: ${res.status}`);
    }

    return (await res.json()) as CategoriesListResponse;
}

export async function createProduct(body: any) {
    const token = localStorage.getItem("access_token");

    const res = await fetch(`${API_BASE_URL}/admin/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Ошибка создания товара: ${res.status}`);
    }

    return await res.json();
}

export async function fetchProduct(id: number) {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);

    if (res.status === 404) {
        throw new Error("Товар не найден");
    }

    if (!res.ok) {
        throw new Error(`Ошибка загрузки товара: ${res.status}`);
    }

    return await res.json(); // формат: { ok: true, data: {...product} }
}

export async function updateProduct(id: number, body: any) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("Не авторизован");
    }

    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
    // у imgbb url лежит в data.data.url
    return data.data.url as string;
}
