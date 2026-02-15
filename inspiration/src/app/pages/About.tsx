import { Heart, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm">Our Story</span>
        </div>
        <h1 className="text-4xl md:text-5xl">About PookieCrafts</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Handcrafted with love, designed to bring warmth and joy to your everyday moments.
        </p>
      </div>
      
      {/* Main Image */}
      <div className="rounded-3xl overflow-hidden mb-16 shadow-lg">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1662994985065-a5d3e39d25c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwaG9tZSUyMGNhbmRsZXMlMjBhZXN0aGV0aWN8ZW58MXx8fHwxNzcxMTc0MzYzfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="PookieCrafts workspace"
          className="w-full h-[400px] object-cover"
        />
      </div>
      
      {/* Story Content */}
      <div className="prose prose-lg max-w-none space-y-8">
        <div className="bg-card rounded-3xl p-8 border border-border">
          <h2 className="text-2xl mb-4 flex items-center gap-3">
            <Heart className="w-7 h-7 text-accent" />
            How It Started
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            PookieCrafts was born from a simple love for creating beautiful, meaningful things by hand. 
            What started as a hobby in a small home studio has blossomed into a passion for crafting 
            products that bring comfort and joy to people's lives.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Every candle is hand-poured with care, using only natural soy wax and premium fragrance oils. 
            Each notebook is thoughtfully bound, with attention to every detail. We believe that handmade 
            items carry a special warmth that mass-produced products simply can't match.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-[#FFE6ED] to-[#FFF4E6] rounded-3xl p-8">
          <h2 className="text-2xl mb-4">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">✨ Handmade Quality</h3>
              <p className="text-muted-foreground">
                Every product is crafted by hand in small batches to ensure the highest quality.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">🌿 Natural Materials</h3>
              <p className="text-muted-foreground">
                We use eco-friendly, sustainable materials whenever possible.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">💖 Made with Love</h3>
              <p className="text-muted-foreground">
                Each item is created with care and attention to detail.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">🎁 Thoughtful Design</h3>
              <p className="text-muted-foreground">
                Beautiful aesthetics meet practical functionality.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-3xl p-8 border border-border text-center">
          <h2 className="text-2xl mb-4">Join Our Community</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            We're so grateful to have a wonderful community of customers who appreciate handmade quality 
            and thoughtful design. Every order supports a small business and helps us continue doing what we love. 
            Thank you for being part of our journey!
          </p>
        </div>
      </div>
    </div>
  );
}
