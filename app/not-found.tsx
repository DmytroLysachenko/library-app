import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HomeIcon, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat bg-pattern">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-bold text-white">404</h1>
            <h2 className="text-3xl font-semibold text-white">
              Page Not Found
            </h2>
          </div>

          <p className="text-gray-300">
            Oops! The page you&apos;re looking for seems to have vanished into
            thin air. Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              variant="secondary"
              asChild
              className="gap-2"
            >
              <Link href="/">
                <HomeIcon className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="gap-2"
            >
              <Link href="javascript:history.back()">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
