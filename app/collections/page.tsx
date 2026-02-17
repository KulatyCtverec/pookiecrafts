import Link from "next/link";
import { getCollections } from "@/lib/shopify";
import { ImageWithFallback } from "@/components/design-system/ImageWithFallback";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl mb-4">Collections</h1>
        <p className="text-muted-foreground text-lg">
          Browse our collections
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.handle}`}
            className="group block bg-card rounded-3xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:border-accent transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-[4/5] overflow-hidden bg-muted relative">
              <ImageWithFallback
                src={c.image?.url ?? ""}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {!c.image?.url && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground p-4 text-center">
                  {c.title}
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-primary group-hover:text-accent transition-colors">
                {c.title}
              </h2>
              <p className="text-muted-foreground mt-2">View collection</p>
            </div>
          </Link>
        ))}
      </div>
      {collections.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          No collections found.
        </p>
      )}
    </div>
  );
}
