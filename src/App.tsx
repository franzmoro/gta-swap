import { Button } from '@/components/ui/button';

const App = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-4xl font-bold">Custom Theme Example</h1>
        <p className="text-xl">
          This text should be light blue-gray (#bdd4e5) on a dark blue background (#01193a).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border border-border bg-card">
            <h2 className="text-2xl font-semibold mb-4">Card Example</h2>
            <p className="mb-4">
              This card should have the same background color as the main page.
            </p>
            <Button>Lime Green Button</Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
