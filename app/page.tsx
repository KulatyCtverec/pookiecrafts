import Link from "next/link";
import { Button } from "@/components/design-system/Button";
import { ProductCard } from "@/components/design-system/ProductCard";
import { HeroCarousel } from "@/components/design-system/HeroCarousel";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";
import { getCollections, getCollectionByHandle } from "@/lib/shopify";
import { Star, Heart } from "lucide-react";

export default async function Home() {
  const collections = await getCollections();
  const collectionDetailsFirst4 = await Promise.all(
    collections.slice(0, 4).map((c) => getCollectionByHandle(c.handle))
  );

  const bestsellerProducts =
    collectionDetailsFirst4.flatMap((col) => {
      const first = col?.products.nodes[0];
      if (!first) return [];
      return [
        {
          id: first.id,
          handle: first.handle,
          title: first.title,
          image: first.featuredImage?.url ?? null,
          price: first.priceRange.minVariantPrice.amount,
          currencyCode: first.priceRange.minVariantPrice.currencyCode,
        },
      ];
    }) ?? [];

  const carouselImagesRaw = bestsellerProducts
    .map((p) => (p.image ? { url: p.image, alt: p.title } : null))
    .filter(Boolean) as { url: string; alt: string }[];
  const carouselImages =
    carouselImagesRaw.length > 0
      ? carouselImagesRaw
      : [
        {
          url: "https://images.unsplash.com/photo-1662994985065-a5d3e39d25c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
          alt: "Cozy candles",
        },
      ];

  const browseCards = collections.map((c) => ({
    id: c.id,
    title: c.title,
    handle: c.handle,
    image: c.image?.url ?? null,
  }));

  const reviews = [
    {
      name: "Emily R.",
      text: "The candles smell absolutely divine! Best purchase ever.",
      rating: 5,
    },
    {
      name: "Sarah M.",
      text: "Beautiful notebooks, perfect quality. I love them!",
      rating: 5,
    },
    {
      name: "Jessica L.",
      text: "Such cute packaging and amazing scents. Highly recommend!",
      rating: 5,
    },
  ];

  return (
    <div className="w-full">
      <section className="relative bg-linear-to-b from-[#FFE6ED] to-background py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl">
                Cozy Vibes, <br />
                Handmade with Love
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Discover our collection of handcrafted candles and notebooks,
                made to bring warmth and joy to your everyday moments.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <a href="#bestsellers">Shop Now</a>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <HeroCarousel images={carouselImages} />
            </div>
          </div>
        </div>
      </section>

      <section
        id="bestsellers"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">Bestsellers</h2>
          <p className="text-muted-foreground">Our most loved products</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {browseCards.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-2">Browse Collections</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {browseCards.map((card) => (
              <Link
                key={card.id}
                href={`/collections/${card.handle}`}
                className="group block bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/5] overflow-hidden bg-muted relative">
                  <ImageWithFallback
                    src={card.image ?? ""}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!card.image && (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4">
                      {card.title}
                    </div>
                  )}
                </div>
                <div className="p-5 text-center">
                  <span className="text-lg font-semibold group-hover:text-accent transition-colors">
                    {card.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-linear-to-b from-background to-[#FFF4E6] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Heart className="w-12 h-12 text-accent mx-auto" />
          <h2 className="text-4xl">Made with Love & Care</h2>
          <p className="text-lg text-muted-foreground">
            Every candle is hand-poured and every notebook is carefully bound by
            hand. We believe in creating products that bring joy and comfort to
            your daily life. Our small-batch approach ensures quality and
            attention to detail in every piece.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/about">Read Our Story</Link>
          </Button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground">Join our happy community!</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-card rounded-3xl p-8 shadow-sm border border-border"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                &quot;{review.text}&quot;
              </p>
              <p className="font-semibold">{review.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
