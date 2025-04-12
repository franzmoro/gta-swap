import SwapWidget from './screens/swap';
import ErrorBoundary from '@/components/error-boundary';

const App = () => {
  return (
    <ErrorBoundary>
      <SwapWidget />
    </ErrorBoundary>
  );
};

export default App;
