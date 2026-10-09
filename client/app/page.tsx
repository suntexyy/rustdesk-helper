import Link from "next/link";
import { display } from "@/lib/fonts";

const GLOW =
  "radial-gradient(60% 50% at 15% 0%, rgba(51,85,255,0.95) 0%, rgba(51,85,255,0) 70%), radial-gradient(45% 45% at 95% 85%, rgba(123,92,255,0.6) 0%, rgba(123,92,255,0) 70%)";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

// a fake preview of the mentor panel, so people see what the app does
const PREVIEW = [
  {
    name: "Maya",
    status: "Needs help",
    hue: 28,
    dot: "bg-[#FFC53D]",
    text: "text-[#FFC53D]",
    row: "bg-[#FFC53D]/10 ring-1 ring-inset ring-[#FFC53D]/40",
    action: "Connect",
    button: "bg-white text-[#1B2FD6]",
    ping: true,
  },
  {
    name: "Leo",
    status: "In session",
    hue: 225,
    dot: "bg-[#6D8BFF]",
    text: "text-[#9DB1FF]",
    row: "bg-[#4C6BFF]/10 ring-1 ring-inset ring-[#4C6BFF]/30",
    action: "Finish",
    button: "bg-[#34E3A5] text-[#04261A]",
    ping: false,
  },
  {
    name: "Sam",
    status: "Online",
    hue: 160,
    dot: "bg-[#34E3A5]",
    text: "text-[#34E3A5]",
    row: "",
    action: "Connect",
    button: "bg-white text-[#1B2FD6]",
    ping: false,
  },
];

export default function LandingPage() {
  return (
    <main
      className={`${display.className} relative flex min-h-screen flex-col overflow-hidden bg-[#070B24] text-white`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GLOW }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-6 pt-8">
        <span className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
          <span
            aria-hidden="true"
            className="size-3 rounded-full bg-[#FFC53D]"
          />
          RustDesk Helper
        </span>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-16 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div>
          <h1 className="text-6xl font-extrabold leading-[0.95] tracking-tight">
            <span className="">Get Help</span>
            <br />
            <span className="text-[#9DB1FF]">Stay On Track.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#AAB4DB]">
            Students join with a code. Mentors see who needs a hand and connect
            to their screen in one click.
          </p>

          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:gap-10">
            <div className="flex flex-col gap-3">
              <Link
                href="/student"
                className={`w-fit rounded-full bg-white px-8 py-4 text-lg font-bold text-[#1B2FD6] transition-transform hover:scale-[1.03] motion-reduce:transition-none ${focus}`}
              >
                I&apos;m a student
              </Link>
              <p className="px-2 text-sm text-[#AAB4DB]">
                Join with a six-digit code
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/mentor"
                className={`w-fit rounded-full border-2 border-white/40 bg-white/5 px-8 py-4 text-lg font-bold backdrop-blur transition-colors hover:bg-white/15 ${focus}`}
              >
                I&apos;m a mentor
              </Link>
              <p className="px-2 text-sm text-[#AAB4DB]">
                Create a group and get a code
              </p>
            </div>
          </div>
        </div>

        {/* product preview */}
        <div
          aria-hidden="true"
          className="relative mx-auto w-full max-w-md lg:mx-0 lg:[transform:perspective(1400px)_rotateY(-9deg)_rotateX(3deg)]"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
          <span className="pointer-events-none absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />

          <div className="relative z-10 rounded-3xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <p className="text-sm font-medium text-[#AAB4DB]">Frontend class</p>
            <p className="mt-2 text-5xl font-extrabold tabular-nums tracking-[0.12em] [text-shadow:0_0_40px_rgba(80,110,255,0.8)]">
              482913
            </p>

            <div className="mt-6 flex flex-col gap-2">
              {PREVIEW.map((p) => (
                <div
                  key={p.name}
                  className={`flex items-center gap-3 rounded-2xl p-3 ${p.row}`}
                >
                  <span className="relative flex size-11 shrink-0">
                    <span
                      className="flex size-11 items-center justify-center rounded-full text-base font-bold"
                      style={{
                        backgroundColor: `hsl(${p.hue} 85% 70%)`,
                        color: `hsl(${p.hue} 60% 18%)`,
                      }}
                    >
                      {p.name[0]}
                    </span>
                    <span className="absolute -bottom-0.5 -right-0.5 flex size-4">
                      {p.ping && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-[#FFC53D] motion-reduce:hidden" />
                      )}
                      <span
                        className={`relative size-4 rounded-full ring-2 ring-[#10164A] ${p.dot}`}
                      />
                    </span>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{p.name}</span>
                    <span className={`block text-sm ${p.text}`}>
                      {p.status}
                    </span>
                  </span>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-bold ${p.button}`}
                  >
                    {p.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
