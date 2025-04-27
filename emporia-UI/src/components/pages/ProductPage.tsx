import { useEffect, useState } from 'react';

interface Product {
    product_id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    category_id: number;
    seller_id: number;
}

interface Category {
    category_id: number;
    name: string;
    description: string;
}

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const limit = 12; // Products per page

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [selectedCategory, page]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            setCategories(data.categories);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const offset = (page - 1) * limit;
            const baseUrl = 'http://localhost:5000/products';
            const url = selectedCategory
                ? `${baseUrl}/category/${selectedCategory}`
                : `${baseUrl}?limit=${limit}&offset=${offset}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();
            setProducts(data.products);
            setError(null);
        } catch (err) {
            setError('Failed to load products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <div className="text-red-600 p-4">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Category Filter */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Categories</h2>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded ${
                            selectedCategory === null
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.category_id}
                            onClick={() => setSelectedCategory(category.category_id)}
                            className={`px-4 py-2 rounded ${
                                selectedCategory === category.category_id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.product_id}
                                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {product.image && (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-md mb-4"
                                    />
                                )}
                                <h3 className="font-semibold text-lg mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-gray-600 mb-2 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Stock: {product.stock}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {!selectedCategory && (
                        <div className="mt-8 flex justify-center gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2">Page {page}</span>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={products.length < limit}
                                className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}