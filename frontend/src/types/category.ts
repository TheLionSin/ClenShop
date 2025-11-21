export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent_id?: number | null;
}

export interface CategoriesListResponse {
    ok: boolean;
    data: {
        page: number;
        limit: number;
        total: number;
        items: Category[];
    };
}
