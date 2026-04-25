import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export function BMICalculator() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('');

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (w > 0 && h > 0) {
      const result = w / (h * h);
      setBmi(result);
      if (result < 18.5) setCategory('Underweight');
      else if (result < 25) setCategory('Normal');
      else if (result < 30) setCategory('Overweight');
      else setCategory('Obese');
    }
  };

  return (
    <Card className="bg-black/60 backdrop-blur-xl border-cyan-500/30 text-white w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl audiowide-regular text-cyan-400">BMI CALCULATOR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-neutral-400">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 focus:border-cyan-500 outline-none transition-colors"
            placeholder="e.g. 70"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-neutral-400">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 focus:border-cyan-500 outline-none transition-colors"
            placeholder="e.g. 175"
          />
        </div>
        <Button 
          onClick={calculateBMI}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-wider"
        >
          Calculate
        </Button>

        {bmi && (
          <div className="mt-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-4xl font-bold text-cyan-400 mb-1">{bmi.toFixed(1)}</div>
            <div className="text-sm uppercase tracking-widest text-white/80">{category}</div>
            <p className="text-[10px] text-neutral-400 mt-2 italic">
              *BMI is a general indicator and doesn't account for muscle mass.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
