const productDemoData = {
    id: "cake-001",

    name: {
        en: "Classic Chocolate Celebration Cake",
        ar: "كعكة الشوكولاتة الكلاسيكية للاحتفال",
    },

    slug: "classic-chocolate-celebration-cake",

    description: {
        en: "A rich chocolate cake layered with smooth chocolate cream and finished with delicate chocolate decoration. A perfect choice for birthdays, celebrations, and special moments.",
        ar: "كعكة شوكولاتة غنية بطبقات من كريمة الشوكولاتة الناعمة ومزينة بلمسات شوكولاتة أنيقة. خيار مثالي لأعياد الميلاد والاحتفالات والمناسبات الخاصة.",
    },

    images: [
        {
            url: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=1200&auto=format&fit=crop&q=85",
            fileId: "demo-1",
        },
        {
            url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&auto=format&fit=crop&q=85",
            fileId: "demo-2",
        },
        {
            url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=1200&auto=format&fit=crop&q=85",
            fileId: "demo-3",
        },
        {
            url: "https://images.unsplash.com/photo-1530648672449-81f6c723e2f1?w=1200&auto=format&fit=crop&q=85",
            fileId: "demo-4",
        },
    ],

    category: {
        _id: "category-001",
        name: {
            en: "Chocolate Cakes",
            ar: "كعكات الشوكولاتة",
        },
        slug: "chocolate-cakes",
    },

    flavor: "chocolate",
    weightSize: "medium",

    price: "12.500",
    discountPercentage: 15,
    discountedPrice: "10.625",

    stock: 12,

    isCustomAvailable: false,
    isFeatured: true,
    isActive: true,

    avgRating: 4.8,
    numReviews: 42,
    salesCount: 126,

    servings: "8-12",

    tags: ["birthday", "chocolate", "celebration"],
};

export default productDemoData;
