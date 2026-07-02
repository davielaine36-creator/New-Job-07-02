import Link from "next/link";
import { Container } from "@/components/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <div className="rule-gold mb-10 w-16" />
      <p className="eyebrow">404</p>
      <h1 className="mt-5 font-display text-display-md text-cream">
        Nothing here — yet.
      </h1>
      <p className="mt-4 max-w-md text-mist">
        The page you're after has moved, or was never written. The archive is a
        good place to begin.
      </p>
      <div className="mt-9 flex gap-4">
        <Link href="/" className="btn-gold">
          Home
        </Link>
        <Link href="/essays" className="btn-gold">
          Essays
        </Link>
      </div>
    </Container>
  );
}
