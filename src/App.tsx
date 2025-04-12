import SwapWidget from './screens/swap';
import ErrorBoundary from '@/components/error-boundary';

const App = () => {
  return (
    <ErrorBoundary>
      <main className="flex min-h-screen flex-col items-center bg-background">
        <SwapWidget />
      </main>
    </ErrorBoundary>
  );
};

export default App;
