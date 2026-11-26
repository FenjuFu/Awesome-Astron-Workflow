import Navigation from '../components/Navigation';
import SparkPlayground from '../components/SparkPlayground';

const showcaseProjects = [
  { name: 'GoodAction Ocean Classroom', url: 'https://goodaction-ocean-classroom.vercel.app' },
];

export default function Playground() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="sr-only">Spark X2.6 4B Playground</h1>
        <section aria-labelledby="showcase-heading" className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 id="showcase-heading" className="text-lg font-semibold text-gray-900">Showcase</h2>
          <ul className="mt-2 flex flex-wrap gap-3">
            {showcaseProjects.map(({ name, url }) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline underline-offset-4 hover:text-indigo-900">
                  {name} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
        <SparkPlayground />
      </main>
    </div>
  );
}
