import { useMemo, useState } from "react";

export interface PrototypeHealthScore {
  score: number;
  bmi: number;
  label: string;
}

export function calculatePrototypeBmiScore(
  heightCentimetres: number,
  weightKilograms: number,
): PrototypeHealthScore | null {
  if (heightCentimetres < 100 || heightCentimetres > 230) return null;
  if (weightKilograms < 25 || weightKilograms > 300) return null;
  const heightMetres = heightCentimetres / 100;
  const bmi = weightKilograms / (heightMetres * heightMetres);
  const score = Math.max(20, Math.min(100, Math.round(100 - Math.abs(bmi - 22) * 3)));
  const label =
    bmi < 18.5 ? "Below common BMI range" :
    bmi < 25 ? "Within common BMI range" :
    bmi < 30 ? "Above common BMI range" :
    "Well above common BMI range";
  return { score, bmi, label };
}

export function HealthScoreCard() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [age, setAge] = useState(30);
  const estimate = useMemo(() => calculatePrototypeBmiScore(height, weight), [height, weight]);

  return (
    <section className="health-overview-card prototype-health-score">
      <span className="overview-card-status">Client-side prototype estimate</span>
      <h2>Your Health Score</h2>
      {estimate ? (
        <div className="prototype-score-summary">
          <strong>{estimate.score}</strong>
          <span><b>{estimate.label}</b> BMI {estimate.bmi.toFixed(1)}</span>
        </div>
      ) : (
        <p className="overview-empty-state">Enter a valid height and weight to calculate the prototype.</p>
      )}
      <div className="health-score-inputs">
        <label>Height<input type="number" min="100" max="230" value={height} onChange={(event) => setHeight(Number(event.target.value))} /><span>cm</span></label>
        <label>Weight<input type="number" min="25" max="300" value={weight} onChange={(event) => setWeight(Number(event.target.value))} /><span>kg</span></label>
        <label>Age<input type="number" min="10" max="110" value={age} onChange={(event) => setAge(Number(event.target.value))} /><span>years</span></label>
      </div>
      <small>This BMI-derived score is not a diagnosis or medical assessment. Age is displayed for context but is not used in this prototype formula.</small>
    </section>
  );
}
