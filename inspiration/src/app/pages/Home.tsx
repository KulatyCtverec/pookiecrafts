'use client';
import Link from 'next/link';
import React from 'react';
import { Button } from '../components/design-system/Button';
import { ProductCard } from '../components/design-system/ProductCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getBestsellers } from '../data/products';
import { Star, Sparkles, Heart } from 'lucide-react';

export default function Home() {
  const bestsellers = getBestsellers();

  const reviews = [
    { name: 'Emily R.', text: 'The candles smell absolutely divine! Best purchase ever.', rating: 5 },
    { name: 'Sarah M.', text: 'Beautiful notebooks, perfect quality. I love them!', rating: 5 },
    { name: 'Jessica L.', text: 'Such cute packaging and amazing scents. Highly recommend!', rating: 5 },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
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
                Discover our collection of handcrafted candles and notebooks, made to bring warmth and joy to your everyday moments.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/shop">Shop Now</Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1662994985065-a5d3e39d25c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwaG9tZSUyMGNhbmRsZXMlMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzcxMTc0MzYzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Cozy candles"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">Bestsellers</h2>
          <p className="text-muted-foreground">Our most loved products</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-gradient-to-b from-background to-[#FFF4E6] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Heart className="w-12 h-12 text-accent mx-auto" />
          <h2 className="text-4xl">Made with Love & Care</h2>
          <p className="text-lg text-muted-foreground">
            Every candle is hand-poured and every notebook is carefully bound by hand.
            We believe in creating products that bring joy and comfort to your daily life.
            Our small-batch approach ensures quality and attention to detail in every piece.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/about">Read Our Story</Link>
          </Button>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground">Join our happy community!</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-card rounded-3xl p-8 shadow-sm border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"{review.text}"</p>
              <p className="font-semibold">{review.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
