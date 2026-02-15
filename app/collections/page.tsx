import Link from "next/link";
import { getCollections } from "@/lib/shopify";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl mb-4">Collections</h1>
        <p className="text-muted-foreground text-lg">
          Browse our handmade collections
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/collections/${c.handle}`}
            className="bg-card rounded-3xl p-8 border border-border hover:border-accent hover:shadow-lg transition-all"
          >
            <h2 className="text-2xl font-semibold text-primary">{c.title}</h2>
            <p className="text-muted-foreground mt-2">View collection</p>
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
