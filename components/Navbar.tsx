import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { buttonVariants } from "./ui/Button";
import SignOutButton from "./ui/SignOutButton";
import SignInButton from "./ui/SignInButton";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="fixed backdrop-blur-sm bg-white/75 dark:bg-slate-900/75 z-40 top-0 left-0 right-0 h-20 border-b border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-between">
      <div className="container max-w-7xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className={buttonVariants({ variant: "link" })}>
          Text Similarity
        </Link>

        <div className="md:hidden">
          <ThemeToggle />
        </div>

        <div className="hidden md:flex gap-5">
          <ThemeToggle />

          <Link
            href="/documentation"
            className={buttonVariants({ variant: "ghost" })}
          >
            Documentation
          </Link>

          {session ? (
            <>
              <Link
                className={buttonVariants({ variant: "ghost" })}
                href="/dashboard"
              >
                Dashboard
              </Link>

              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
