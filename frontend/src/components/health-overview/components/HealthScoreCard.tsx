import { useMemo, useState } from "react";

export interface AdultBmiResult {
  bmi: number;
  category: string;
  healthyRangePercentage: number;
}

export function calculateAdultBmi(
  heightCentimetres: number,
  weightKilograms: number,
): AdultBmiResult | null {
  if (heightCentimetres < 100 || heightCentimetres > 230) return null;
  if (weightKilograms < 25 || weightKilograms > 300) return null;
  const heightMetres = heightCentimetres / 100;
  const bmi = weightKilograms / (heightMetres * heightMetres);
  const category =
    bmi < 18.5 ? "Underweight" :
    bmi < 25 ? "Healthy weight" :
    bmi < 30 ? "Overweight" :
    bmi < 40 ? "Obesity" :
    "Severe obesity";
  const healthyRangePercentage =
    bmi < 18.5
      ? Math.max(0, Math.round((bmi / 18.5) * 100))
      : bmi < 25
        ? 100
        : Math.max(0, Math.round(100 - ((bmi - 25) / 25) * 100));
  return { bmi, category, healthyRangePercentage };
}

export function HealthScoreCard() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [age, setAge] = useState(30);
  const result = useMemo(() => age >= 20 ? calculateAdultBmi(height, weight) : null, [height, weight, age]);

  return (
    <section className="health-overview-card bmi-health-score">
      <h2>Healthy BMI Range</h2>
      {result ? (
        <div className="prototype-score-summary">
          <strong>{result.healthyRangePercentage}</strong>
          <span><b>{result.category}</b><span>BMI range score</span></span>
        </div>
      ) : (
        <p className="overview-empty-state">Enter a valid adult age, height, and weight.</p>
      )}
      <div className="health-score-inputs">
        <label>Height<input type="number" min="100" max="230" value={height} onChange={(event) => setHeight(Number(event.target.value))} /><span>cm</span></label>
        <label>Weight<input type="number" min="25" max="300" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /><span>kg</span></label>
        <label>Age<input type="number" min="20" max="120" value={age} onChange={(event) => setAge(Number(event.target.value))} /><span>yrs</span></label>
      </div>
      <small>BMI is a general health indicator, not a diagnosis.</small>
    </section>
  );
}
