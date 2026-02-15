import Link from "next/link";
import { Button } from "@/components/design-system/Button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-8xl md:text-9xl text-primary">404</h1>
        <h2 className="text-3xl">Page Not Found</h2>
        <p className="text-muted-foreground">
          Oops! The page you&apos;re looking for seems to have wandered off.
        </p>
        <Button size="lg" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
