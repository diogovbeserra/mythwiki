
import { RefinementCalculator } from '@/components/refinement-calculator';

export const metadata = {
  title: 'Refinement Calculator - Myth Wiki',
  description: 'Calculate refinement costs and success rates for your equipment'
};

export default function RefinementPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Refinement Calculator</h1>
        <p className="text-muted-foreground text-lg">
          Plan your equipment refinement strategy with accurate cost calculations
        </p>
      </div>

      <RefinementCalculator />
    </div>
  );
}
