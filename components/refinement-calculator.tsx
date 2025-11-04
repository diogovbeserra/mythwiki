
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calculator, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type EquipmentLevel = '1' | '2' | '3' | '4';
type RefinementType = 'normal' | 'enriched' | 'hd';

interface RefinementRates {
  [key: string]: number;
}

const normalRates: Record<EquipmentLevel, RefinementRates> = {
  '1': { '0-7': 100, '8': 60, '9': 40, '10': 19, '11-20': 9 },
  '2': { '0-6': 100, '7': 60, '8': 40, '9': 20, '10': 10, '11-20': 5 },
  '3': { '0-5': 100, '6': 60, '7': 50, '8': 20, '9': 20, '10': 9, '11-20': 5 },
  '4': { '0-4': 100, '5': 60, '6': 40, '7': 40, '8': 20, '9': 20, '10': 10, '11-20': 5 }
};

const enrichedRates: Record<EquipmentLevel, RefinementRates> = {
  '1': { '0-7': 100, '8': 90, '9': 70, '10': 30, '11-20': 15 },
  '2': { '0-6': 100, '7': 90, '8': 70, '9': 40, '10': 20, '11-20': 10 },
  '3': { '0-5': 100, '6': 90, '7': 80, '8': 40, '9': 40, '10': 15, '11-20': 10 },
  '4': { '0-4': 100, '5': 90, '6': 70, '7': 70, '8': 40, '9': 40, '10': 20, '11-20': 10 }
};

const hdRates: Record<EquipmentLevel, RefinementRates> = {
  '1': { '0-10': 100, '11-20': 50 },
  '2': { '0-10': 100, '11-20': 50 },
  '3': { '0-10': 100, '11-20': 50 },
  '4': { '0-10': 100, '11-20': 50 }
};

function getSuccessRate(currentRefine: number, equipLevel: EquipmentLevel, refineType: RefinementType): number {
  const rates = refineType === 'normal' ? normalRates : refineType === 'enriched' ? enrichedRates : hdRates;
  const levelRates = rates[equipLevel];

  for (const [range, rate] of Object.entries(levelRates)) {
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(Number);
      if (currentRefine >= min && currentRefine <= max) return rate;
    } else if (currentRefine === Number(range)) {
      return rate;
    }
  }
  return 0;
}

export function RefinementCalculator() {
  const [equipLevel, setEquipLevel] = useState<EquipmentLevel>('4');
  const [currentRefine, setCurrentRefine] = useState(0);
  const [targetRefine, setTargetRefine] = useState(10);
  const [refineType, setRefineType] = useState<RefinementType>('normal');
  const [materialCost, setMaterialCost] = useState(0);
  const [equipmentCost, setEquipmentCost] = useState(0);

  const calculateRefinement = () => {
    let totalCost = 0;
    let totalAttempts = 0;
    let equipmentsNeeded = 1;

    for (let refine = currentRefine; refine < targetRefine; refine++) {
      const successRate = getSuccessRate(refine, equipLevel, refineType);
      const attemptsNeeded = 100 / successRate;

      totalAttempts += attemptsNeeded;
      totalCost += attemptsNeeded * materialCost;

      // If refinement type breaks on fail and success rate < 100%
      if ((refineType === 'normal' && successRate < 100) || 
          (refineType === 'enriched' && successRate < 100 && refine >= 5)) {
        const failureRate = 1 - (successRate / 100);
        equipmentsNeeded += (attemptsNeeded - 1) * failureRate;
      }
    }

    const totalEquipmentCost = Math.ceil(equipmentsNeeded) * equipmentCost;

    return {
      totalAttempts: Math.ceil(totalAttempts),
      totalMaterialCost: Math.ceil(totalCost),
      equipmentsNeeded: Math.ceil(equipmentsNeeded),
      totalEquipmentCost,
      grandTotal: Math.ceil(totalCost) + totalEquipmentCost
    };
  };

  const result = calculateRefinement();
  const successRate = getSuccessRate(currentRefine, equipLevel, refineType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle>Refinement Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate the cost and success rate for refining your equipment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Equipment Level */}
          <div className="space-y-2">
            <Label htmlFor="equip-level">Equipment Level</Label>
            <Select value={equipLevel} onValueChange={(value) => setEquipLevel(value as EquipmentLevel)}>
              <SelectTrigger id="equip-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refinement Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="refine-type">Refinement Type</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      <strong>Normal:</strong> Breaks on failure<br />
                      <strong>Enriched:</strong> Safer refining, doesn't break from +5 to +9<br />
                      <strong>HD:</strong> Never breaks, downgrades by 1 on failure
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={refineType} onValueChange={(value) => setRefineType(value as RefinementType)}>
              <SelectTrigger id="refine-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (Breaks on Fail)</SelectItem>
                <SelectItem value="enriched">Enriched (Safe +5 to +9)</SelectItem>
                <SelectItem value="hd">HD (Never Breaks)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Refine */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Current Refine</Label>
              <Badge variant="outline">+{currentRefine}</Badge>
            </div>
            <Slider
              value={[currentRefine]}
              onValueChange={(value) => setCurrentRefine(value[0])}
              max={20}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Target Refine */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Target Refine</Label>
              <Badge variant="outline">+{targetRefine}</Badge>
            </div>
            <Slider
              value={[targetRefine]}
              onValueChange={(value) => setTargetRefine(value[0])}
              max={20}
              min={currentRefine + 1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Material Cost */}
          <div className="space-y-2">
            <Label htmlFor="material-cost">Material Cost per Attempt (Zeny)</Label>
            <Input
              id="material-cost"
              type="number"
              value={materialCost}
              onChange={(e) => setMaterialCost(Number(e.target.value))}
              placeholder="e.g., 10000"
            />
          </div>

          {/* Equipment Cost */}
          <div className="space-y-2">
            <Label htmlFor="equipment-cost">Equipment Base Cost (Zeny)</Label>
            <Input
              id="equipment-cost"
              type="number"
              value={equipmentCost}
              onChange={(e) => setEquipmentCost(Number(e.target.value))}
              placeholder="e.g., 1000000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>Refinement Analysis</CardTitle>
          <CardDescription>
            Estimated costs and attempts from +{currentRefine} to +{targetRefine}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Current Success Rate</div>
              <div className="text-2xl font-bold">{successRate}%</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Attempts Needed</div>
              <div className="text-2xl font-bold">{result.totalAttempts.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Material Cost</div>
              <div className="text-2xl font-bold">{result.totalMaterialCost.toLocaleString()}z</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Equipments Needed</div>
              <div className="text-2xl font-bold">{result.equipmentsNeeded.toLocaleString()}</div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Equipment Cost</div>
              <div className="text-2xl font-bold">{result.totalEquipmentCost.toLocaleString()}z</div>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <div className="text-sm text-primary mb-1">Grand Total Cost</div>
              <div className="text-2xl font-bold text-primary">{result.grandTotal.toLocaleString()}z</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
            <strong className="text-foreground">📊 Note:</strong> These are statistical averages. Actual results may vary due to RNG.
            {refineType === 'normal' && (
              <span> Normal refinement will break your equipment on failure at higher refines.</span>
            )}
            {refineType === 'enriched' && (
              <span> Enriched refinement is safer and doesn't break equipment from +5 to +9.</span>
            )}
            {refineType === 'hd' && (
              <span> HD refinement never breaks equipment, but downgrades by 1 level on failure.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
