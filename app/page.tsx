import Link from "next/link";
import { Button } from "@/components/design-system/Button";
import { ProductCard } from "@/components/design-system/ProductCard";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";
import { getCollections, getCollectionByHandle } from "@/lib/shopify";
import { Star, Sparkles, Heart } from "lucide-react";

export default async function Home() {
  const collections = await getCollections();
  const firstCollection = collections[0]
    ? await getCollectionByHandle(collections[0].handle)
    : null;
  const featuredProducts = firstCollection?.products.nodes.slice(0, 4).map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    image: p.featuredImage?.url ?? null,
    price: p.priceRange.minVariantPrice.amount,
    currencyCode: p.priceRange.minVariantPrice.currencyCode,
  })) ?? [];

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

  const firstCollectionHandle = firstCollection?.handle ?? "frontpage";
  const firstCollectionTitle = firstCollection?.title ?? "All";

  return (
    <div className="w-full">
      <section className="relative bg-gradient-to-b from-[#FFE6ED] to-background py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full border border-border">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm">Handmade with love</span>
              </div>
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
                  <Link href={`/collections/${firstCollectionHandle}`}>
                    Shop Now
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1662994985065-a5d3e39d25c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                  alt="Cozy candles"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">
            {firstCollection ? firstCollectionTitle : "Featured Products"}
          </h2>
          <p className="text-muted-foreground">Our most loved products</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {featuredProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href={`/collections/${firstCollectionHandle}`}>
                View All Products
              </Link>
            </Button>
          </div>
        )}
      </section>

      {collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-2">Browse Collections</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {collections.map((c) => (
              <Button key={c.id} variant="secondary" asChild>
                <Link href={`/collections/${c.handle}`}>{c.title}</Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gradient-to-b from-background to-[#FFF4E6] py-20 px-4 sm:px-6 lg:px-8">
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
