const banner = (id, w) => `https://images.unsplash.com/photo-${id}?q=85&w=${w}&auto=format&fit=crop`;

export  function hero_image () {
    const heroSlides = [
        {
            theme: "hero-slide-sand",
            eyebrow: "Top Rated",
            title: "The pairs everyone keeps buying",
            text: "Rated 4.5 and above by GoCart shoppers.",
            cta: "Shop Best Sellers",
            to: "/products?sort=rating",
            image: banner("1549298916-f52d724204b4", 1200),
            alt: "Tan Nike Air Force 1 sneakers on mustard fabric",
        },
        {
            theme: "hero-slide-sky",
            eyebrow: "Everyday Classics",
            title: "One pair. Every outfit.",
            text: "Canvas high-tops and low-profile skate silhouettes from Rs. 4,499.",
            cta: "Shop by price",
            to: "/products?sort=price-low",
            image: banner("1607522370275-f14206abe5d3", 1200),
            alt: "Red canvas high-top sneaker on a blue background",
        },
        {
            theme: "hero-slide-blush",
            eyebrow: "Women's Collection",
            title: "Pastels that do the talking",
            text: "Air Force 1 Shadow, Dunk High and Ultraboost in soft new colourways.",
            cta: "Shop Women",
            to: "/products?category=Women",
            image: banner("1595950653106-6c9ebd614d3a", 1200),
            alt: "Nike Air Force 1 Shadow in pastel blue, pink and yellow",
        },
        {
            theme: "hero-slide-navy",
            eyebrow: "Men's Collection",
            title: "Court legends, back in rotation",
            text: "Retro Jordans and Air Force 1s built to outlast the hype.",
            cta: "Shop Men",
            to: "/products?category=Men",
            image: banner("1578116922645-3976907a7671", 1200),
            alt: "Air Jordan 1 Retro High in royal blue and black",
        },
    ];

    return heroSlides;
}



export  function categoryCard() {
    const categoryCards = [
        {
            label: "Men",
            note: "Jordans, Air Force 1, runners",
            to: "/products?category=Men",
            image: banner("1552346154-21d32810aba3", 600),
            alt: "Air Jordan 1 in red, black and white",
        },
        {
            label: "Women",
            note: "Shadows, Dunks, Ultraboost",
            to: "/products?category=Women",
            image: banner("1600185365483-26d7a4cc7519", 600),
            alt: "Nike Air Max sneaker in coral and white",
        },
        {
            label: "New Arrivals",
            note: "Freshly landed this month",
            to: "/products",
            image: banner("1512374382149-233c42b6a83b", 600),
            alt: "White Nike Air Force 1 Mid sneakers",
        },
        {
            label: "Best Sellers",
            note: "Highest rated on GoCart",
            to: "/products?sort=rating",
            image: banner("1584735175315-9d5df23860e6", 600),
            alt: "Nike Dunk High in pastel colours",
        },
    ];
    
    return categoryCards;
}