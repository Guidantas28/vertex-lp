import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TestimonialV2Item = {
  text: string;
  image: string;
  name: string;
  role: string;
};

function padToNine(items: TestimonialV2Item[]): TestimonialV2Item[] {
  if (items.length >= 9) return items.slice(0, 9);
  const out: TestimonialV2Item[] = [];
  for (let i = 0; i < 9; i++) out.push(items[i % items.length]);
  return out;
}

const TestimonialsColumn = ({
  className,
  testimonials,
  duration = 10,
  animate,
}: {
  className?: string;
  testimonials: TestimonialV2Item[];
  duration?: number;
  animate: boolean;
}) => (
  <div className={className}>
    <motion.ul
      animate={animate ? { translateY: "-50%" } : { translateY: "0%" }}
      transition={
        animate
          ? {
              duration,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }
          : undefined
      }
      className="m-0 flex list-none flex-col gap-6 bg-transparent p-0 pb-6 transition-colors duration-300"
    >
      {[0, 1].map((dup) => (
        <React.Fragment key={dup}>
          {testimonials.map(({ text, image, name, role }, i) => (
            <motion.li
              key={`${dup}-${i}`}
              aria-hidden={dup === 1 ? "true" : "false"}
              tabIndex={dup === 1 ? -1 : 0}
              whileHover={
                animate
                  ? {
                      scale: 1.03,
                      y: -8,
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                      transition: { type: "spring", stiffness: 400, damping: 17 },
                    }
                  : undefined
              }
              className="group max-w-xs w-full cursor-default select-none rounded-3xl border border-[color:var(--zx-line,rgba(20,19,28,0.1))] bg-[color:var(--zx-panel,#fff)] p-8 shadow-lg shadow-black/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#ED4B00]/30 md:p-10"
            >
              <blockquote className="m-0 p-0">
                <p className="m-0 font-normal leading-relaxed text-[color:var(--zx-ink2,#4E4A5C)]">
                  “{text}”
                </p>
                <footer className="mt-6 flex items-center gap-3">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={`Foto de ${name}`}
                    loading="lazy"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[color:var(--zx-line,rgba(20,19,28,0.1))] transition-all duration-300 ease-in-out group-hover:ring-[#ED4B00]/30"
                  />
                  <div className="flex flex-col">
                    <cite className="font-semibold not-italic leading-5 tracking-tight text-[color:var(--zx-ink,#14131C)]">
                      {name}
                    </cite>
                    <span className="mt-0.5 text-sm leading-5 tracking-tight text-[color:var(--zx-ink3,#8A8696)]">
                      {role}
                    </span>
                  </div>
                </footer>
              </blockquote>
            </motion.li>
          ))}
        </React.Fragment>
      ))}
    </motion.ul>
  </div>
);

type Props = {
  items: TestimonialV2Item[];
  title?: string;
  lead?: string;
};

export default function TestimonialV2({
  items,
  title = "O que quem usa o VOS fala",
  lead = "Times reais, operação no ar — sem planilha paralela.",
}: Props) {
  const reduce = useReducedMotion();
  const animate = !reduce;
  const all = padToNine(items);
  const firstColumn = all.slice(0, 3);
  const secondColumn = all.slice(3, 6);
  const thirdColumn = all.slice(6, 9);

  return (
    <section
      aria-labelledby="testimonials-v2-heading"
      className="relative overflow-hidden bg-transparent py-4"
    >
      <div className="container z-10 mx-auto px-0">
        <div className="mx-auto mb-12 flex max-w-[540px] flex-col items-center justify-center md:mb-16">
          <h2
            id="testimonials-v2-heading"
            className="zx-h2 text-center"
          >
            {title}
          </h2>
          <p className="zx-lead mx-auto mt-4 text-center" style={{ marginInline: "auto" }}>
            {lead}
          </p>
        </div>

        <motion.div
          initial={animate ? { opacity: 0, y: 28 } : false}
          whileInView={animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.08 }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
          role="region"
          aria-label="Depoimentos em rolagem"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} animate={animate} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
            animate={animate}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
            animate={animate}
          />
        </motion.div>
      </div>
    </section>
  );
}
