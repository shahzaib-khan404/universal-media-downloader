import { LoadingScreen } from '@/components/ui/loading-screen';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="container mx-auto px-4 flex-1 flex items-center justify-center">
        <LoadingScreen 
          title="Loading Page..."
          subtitle="Connecting with high-speed media pipeline and preparing resources."
        />
      </main>
      <Footer />
    </div>
  );
}
