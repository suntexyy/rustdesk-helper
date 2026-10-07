import Link from "next/link";

const options = [
  {
    href: "/student",
    emoji: "🎓",
    title: "I'm a student",
    text: "Join a group with a code and ask for help.",
  },
  {
    href: "/mentor",
    emoji: "🧑‍🏫",
    title: "I'm a mentor",
    text: "Create your group and help students remotely.",
  },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#09090b]">
            rustdesk-helper
          </h1>
          <p className="mt-2 text-sm text-[#71717a]">
            Choose how you want to join
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {options.map((o) => (
            <Link
              key={o.href}
              href={o.href}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:border-zinc-400"
            >
              <span className="text-3xl">{o.emoji}</span>
              <span className="text-lg font-semibold text-[#09090b]">
                {o.title}
              </span>
              <span className="text-sm text-[#71717a]">{o.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
