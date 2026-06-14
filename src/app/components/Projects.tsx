'use client';

const projects = [
  {
    title: 'Glide',
    tag: 'Urban commute',
    body: 'Quiet acceleration, upright geometry, and the range to turn daily routes into rituals.',
  },
  {
    title: 'Core',
    tag: 'Foldable utility',
    body: 'A compact fat-tyre platform with confident handling and city-ready storage.',
  },
  {
    title: 'Cargo',
    tag: 'Workhorse',
    body: 'Built for delivery loops, equipment runs, and the practical side of electric mobility.',
  },
];

export function Projects() {
  return (
    <section id="projekti" className="bg-black px-5 py-24 text-white sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl sm:mb-16">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-white/40">Selected models</p>
          <h2 className="text-4xl font-black uppercase leading-none tracking-normal sm:text-6xl">Built for the city after dark.</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.title}
              className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:shadow-lime-300/10 sm:p-8"
            >
              <div className="mb-20 flex items-center justify-between gap-4">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-white/50">
                  {project.tag}
                </span>
                <span className="h-2 w-2 rounded-full bg-lime-300 opacity-70 transition group-hover:scale-150 group-hover:opacity-100" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-normal">{project.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/55">{project.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
