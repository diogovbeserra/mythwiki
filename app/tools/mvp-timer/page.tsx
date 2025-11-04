
import { MvpTimer } from '@/components/mvp-timer';

export const metadata = {
  title: 'MVP Timer - Myth Wiki',
  description: 'Track your MVP farming sessions with a precision timer'
};

export default function MvpTimerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">MVP Timer</h1>
        <p className="text-muted-foreground text-lg">
          Professional timer for tracking your MVP farming sessions
        </p>
      </div>

      <MvpTimer />
    </div>
  );
}
