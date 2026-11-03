import Navigation from '../components/Navigation';
import SparkPlayground from '../components/SparkPlayground';

export default function Playground() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="sr-only">Spark X2.6 4B Playground</h1>
        <SparkPlayground />
      </main>
    </div>
  );
}
