// src/types/product.ts

export interface ProductImage {
    id: number;
    url: string;
    is_primary: boolean;
    sort_order: number;
}

// Ответ бэка: ProductResponse (Go) отдаёт tastes как []string,
// поэтому на фронте просто массив строк.
export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    is_active: boolean;
    category_id: number;
    images: ProductImage[];
    tastes: string[]; // <-- НОВОЕ ПОЛЕ
}

export interface ProductsListResponse {
    ok: boolean;
    data: {
        page: number;
        limit: number;
        total: number;
        items: Product[];
    };
}

// Если хочешь типизировать одиночный продукт:
export interface ProductResponse {
    ok: boolean;
    data: Product;
}
