"use client";

import { useState, useEffect } from "react";
import {
  Airspeed,
  Altimeter,
  AttitudeIndicator,
  HeadingIndicator,
  TurnCoordinator,
  Variometer,
} from "react-flight-indicators";

const runways = [
  { number: "09", heading: 90 },
  { number: "18", heading: 180 },
  { number: "27", heading: 270 },
  { number: "36", heading: 360 },
];

const instructions = [
  "Enter left downwind",
  "Enter right downwind",
  "Enter left base",
  "Enter right base",
  "Enter straight-in",
];

export default function Home() {
  const [scenario, setScenario] = useState(null);
  const [heading, setHeading] = useState(Math.random() * 360);

  useEffect(() => {
    const runway = runways[Math.floor(Math.random() * runways.length)];
    const instruction = instructions[Math.floor(Math.random() * instructions.length)];

    setScenario({ runway, instruction });
  }, []);

  return (
    <div className="flex flex-col gap-20 items-center justify-center min-h-screen p-10">
      {/* Scenario prompt */}
      {scenario && (
        <div className="space-y-5 text-center text-black">
          <p className="text-4xl font-semibold">
            Tower says: “{scenario.instruction} for Runway {scenario.runway.number}”
          </p>
          <p className="text-xl text-black/50">
            Your current heading is <b>{heading.toFixed(0)}°</b>.
            What turn should you make to enter the pattern correctly?
          </p>
        </div>
      )}

      {/* Six-pack instruments */}
      <div className="grid grid-cols-3">
        <HeadingIndicator heading={heading} showBox={false} />
        <Airspeed speed={Math.random() * 160} showBox={false} />
        <Altimeter altitude={Math.random() * 28000} showBox={false} />
        <AttitudeIndicator
          roll={(Math.random() - 0.5) * 120}
          pitch={(Math.random() - 0.5) * 40}
          showBox={false}
        />
        <TurnCoordinator turn={(Math.random() - 0.5) * 120} showBox={false} />
        <Variometer vario={(Math.random() - 0.5) * 4000} showBox={false} />
      </div>
    </div>
  );
}