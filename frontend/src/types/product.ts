export interface ProductImage {
    id: number;
    url: string;
    is_primary: boolean;
    sort_order: number;
}

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
