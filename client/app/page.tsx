import Link from "next/link";
import { display } from "@/lib/fonts";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

export default function LandingPage() {
  return (
    <main
      className={`${display.className} relative flex min-h-screen flex-col overflow-hidden bg-[#2547FF] text-white`}
    >
      {/* rings that pulse outward, like a signal going out */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span className="absolute size-[18rem] rounded-full border border-white/15 sm:size-[26rem]" />
        <span className="absolute size-[30rem] rounded-full border border-white/10 sm:size-[44rem]" />
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{ animationDuration: "3.3s", animationDelay: `${i * 1.1}s` }}
            className="absolute size-[18rem] animate-ping rounded-full border border-white/30 motion-reduce:hidden sm:size-[26rem]"
          />
        ))}
      </div>

      <header className="relative z-10 p-6 sm:p-8">
        <span className="text-lg font-extrabold tracking-tight">
          RustDesk Helper
        </span>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <h1 className="font-extrabold leading-[0.95] tracking-tight text-6xl ">
          Get Help, Stay On Track.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
          Join your class with a code, or start a group and help students
          remotely.
        </p>

        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Link
            href="/student"
            className={`rounded-full bg-white px-8 py-4 text-lg font-bold text-[#2547FF] transition-transform hover:scale-[1.03] motion-reduce:transition-none ${focus}`}
          >
            I&apos;m a student
          </Link>
          <Link
            href="/mentor"
            className={`rounded-full border-2 border-white/60 px-8 py-4 text-lg font-bold transition-colors hover:bg-white/10 ${focus}`}
          >
            I&apos;m a mentor
          </Link>
        </div>
      </div>
    </main>
  );
}
