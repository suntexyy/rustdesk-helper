import Link from "next/link";
import { display } from "@/lib/fonts";

export default function LandingPage() {
  return (
    <main
      className={`${display.className} flex min-h-screen flex-col lg:flex-row`}
    >
      <h1 className="sr-only">rustdesk-helper: choose how you want to join</h1>

      {/* Student */}
      <Link
        href="/student"
        className="group flex flex-1 flex-col justify-between gap-12 bg-[#FFD23F] p-8 text-[#0B2545] transition-[flex-grow,background-color] duration-300 hover:bg-[#FFDB63] focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-inset focus-visible:ring-[#0B2545] motion-reduce:transition-none sm:p-12 lg:p-16 lg:hover:grow-[1.12]"
      >
        <span className="text-xl font-extrabold tracking-tight">
          rustdesk-helper
        </span>

        <div>
          <h2 className="text-6xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl xl:text-8xl">
            Need a hand?
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed">
            Join your class with a group code, then ask for help whenever you
            get stuck.
          </p>
          <span className="mt-8 inline-flex rounded-full bg-[#0B2545] px-7 py-3.5 text-base font-semibold text-white transition-colors group-hover:bg-[#13365F]">
            Join with a code
          </span>
        </div>

        <div
          aria-hidden="true"
          className="flex max-w-sm items-center gap-4 rounded-2xl bg-white p-4"
        >
          <span className="relative flex size-12 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#FFD23F] motion-reduce:hidden" />
            <span className="relative flex size-12 items-center justify-center rounded-full bg-[#0B2545] text-lg font-bold text-white">
              M
            </span>
          </span>
          <span className="flex flex-col">
            <span className="font-semibold">Maya</span>
            <span className="text-sm font-medium text-[#7A5200]">
              Needs help
            </span>
          </span>
        </div>
      </Link>

      {/* Mentor */}
      <Link
        href="/mentor"
        className="group flex flex-1 flex-col justify-between gap-12 bg-[#0B2545] p-8 text-white transition-[flex-grow,background-color] duration-300 hover:bg-[#0F2E57] focus-visible:outline-none focus-visible:ring-8 focus-visible:ring-inset focus-visible:ring-[#FFD23F] motion-reduce:transition-none sm:p-12 lg:p-16 lg:hover:grow-[1.12]"
      >
        <span aria-hidden="true" className="hidden h-7 lg:block" />

        <div>
          <h2 className="text-6xl font-extrabold leading-[0.92] tracking-tight sm:text-7xl xl:text-8xl">
            Lend a hand.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#C9D6EA]">
            Create your group, see who needs help, and connect to their screen
            in one click.
          </p>
          <span className="mt-8 inline-flex rounded-full bg-[#FFD23F] px-7 py-3.5 text-base font-semibold text-[#0B2545] transition-colors group-hover:bg-[#FFDB63]">
            Create a group
          </span>
        </div>

        <div
          aria-hidden="true"
          className="flex max-w-sm items-center gap-4 rounded-2xl bg-[#13365F] p-4"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#FFD23F] text-lg font-bold text-[#0B2545]">
            M
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-semibold">Maya</span>
            <span className="text-sm tabular-nums text-[#C9D6EA]">
              382 605 744
            </span>
          </span>
          <span className="rounded-full bg-[#FFD23F] px-4 py-2 text-sm font-semibold text-[#0B2545]">
            Connect
          </span>
        </div>
      </Link>
    </main>
  );
}
