import { cn } from "@/lib/utils";

export type TestimonialItem = {
  text: string;
  name: string;
  biz: string;
  city: string;
  photo: string;
  metric: string;
};

type Props = {
  items: TestimonialItem[];
  className?: string;
};

export default function TestimonialCards({ items, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-stretch justify-center gap-5",
        className,
      )}
    >
      {items.map((t) => (
        <article
          key={t.name}
          className="flex w-full max-w-[22rem] min-h-[560px] flex-col bg-[#14121F] text-white rounded-2xl border border-white/10 shadow-[0_28px_60px_-36px_rgba(0,0,0,0.55)]"
        >
          <div className="relative -mt-px overflow-hidden rounded-2xl">
            <img
              src={t.photo}
              alt={`Foto de ${t.name}`}
              width={600}
              height={360}
              loading="lazy"
              decoding="async"
              className="h-[360px] w-full rounded-2xl object-cover object-top transition-all duration-300 hover:scale-105"
            />
            <div className="pointer-events-none absolute bottom-0 z-10 h-72 w-full bg-gradient-to-t from-[#14121F] to-transparent" />
          </div>
          <div className="flex flex-1 flex-col px-4 pb-6 pt-1">
            <p className="border-b border-white/15 pb-5 text-[15px] font-medium leading-snug tracking-[-0.01em]">
              “{t.text}”
            </p>
            <div className="mt-auto pt-5">
              <p className="text-[14px] font-semibold">{t.name}</p>
              <p className="mt-1 text-sm font-medium text-white/45">
                {t.biz} · {t.city}
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.08em] bg-gradient-to-r from-[#8B76FF] via-[#ED4B00] to-[#9938CA] bg-clip-text text-transparent">
                {t.metric}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
