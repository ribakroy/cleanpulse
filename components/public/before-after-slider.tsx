"use client";

import Image from "next/image";
import { type CSSProperties, useId, useState } from "react";

type BeforeAfterSliderProps = {
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
  initialValue?: number;
};

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt,
  afterAlt,
  initialValue = 58,
}: BeforeAfterSliderProps) {
  const inputId = useId();
  const [value, setValue] = useState(initialValue);
  const sliderStyle = { "--before-after-position": `${value}%` } as CSSProperties;

  return (
    <div className="before-after-slider" style={sliderStyle}>
      <Image src={beforeImage} alt={beforeAlt} fill sizes="100vw" className="before-after-image" />
      <div className="before-after-clean-layer" aria-hidden="true">
        <Image src={afterImage} alt={afterAlt} fill sizes="100vw" className="before-after-image" />
      </div>

      <div className="before-after-label before-after-label-before">לא נעים</div>
      <div className="before-after-label before-after-label-after">נקי</div>

      <div className="before-after-divider" aria-hidden="true">
        <span>
          <i />
          <i />
        </span>
      </div>

      <label className="sr-only" htmlFor={inputId}>
        הזזת קו ההשוואה בין שירותים לא נעימים לשירותים נקיים
      </label>
      <input
        id={inputId}
        className="before-after-range"
        type="range"
        min="8"
        max="92"
        value={value}
        onInput={(event) => setValue(Number(event.currentTarget.value))}
        onChange={(event) => setValue(Number(event.currentTarget.value))}
      />
    </div>
  );
}
