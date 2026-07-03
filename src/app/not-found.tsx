import Link from "next/link";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-5 font-display text-display-md text-ink">
        We couldn't find that page.
      </h1>
      <p className="mt-4 max-w-md text-slate">
        The page you're after has moved or doesn't exist. Head back home, or
        explore the platform.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Home
        </Link>
        <Link href="/platform" className="btn-outline">
          Explore the platform
        </Link>
      </div>
    </Container>
  );
}
