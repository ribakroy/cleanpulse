# Homepage Scan Story Assets

Assets live in:

```text
public/homepage/scan-story/
```

## scan-context-bg.webp

Current use: the first scan scene background, including restroom context, hand, phone, acrylic QR sign and kiosk/tablet in the environment.

Regeneration prompt:

```text
Hyper-realistic premium hospitality restroom scan scene, bright clean white and soft blue environment, one hand holding a modern generic flagship smartphone scanning a QR code on a luxury acrylic counter sign, same composition suitable for Apple-level product reveal, high-end hotel restroom, marble counter, blurred tablet kiosk in background, realistic lens depth, soft daylight, no brand logos, no readable commercial text, no Apple logo, no device name, elegant and clean, 16:9 composition.
```

## phone-report-mockup.png

Current use: report/rating stage mockup. Source: user-provided transparent mockup refined into the scan-story asset folder.

Regeneration direction:

```text
Transparent PNG of a realistic hand holding a modern generic flagship smartphone. The phone screen shows the real CleanPulse Hebrew RTL guest report UI in correct mobile proportions: rating stars, restroom context, issue selection cards, soft blue-white product UI, no Apple logo, no device name, no extra text outside the app, clean premium lighting, realistic hand and phone edges, transparent background.
```

## phone-success-mockup.png

Current use: success stage mockup. Source: user-provided transparent mockup normalized to the same canvas as `phone-report-mockup.png`.

Regeneration direction:

```text
Transparent PNG of the same hand and modern generic flagship smartphone angle as the report mockup. The phone screen shows a CleanPulse Hebrew RTL success state: green check mark, thank-you confirmation, team updated message, soft white-blue background, premium app typography, no Apple logo, no device name, transparent background, consistent scale with the report mockup.
```

## phone-hand.png

Built-in ImageGen prompt:

```text
Use case: product-mockup
Asset type: transparent layered website asset for a pinned scroll product story
Primary request: Photorealistic premium render of one human hand holding a large generic modern flagship smartphone, no brand identity.
Subject: One realistic adult hand holding a large modern titanium-edge smartphone with rounded corners and a clean blank dark glass screen facing the viewer at a slight perspective angle. The hand should be natural and anatomically correct. No face, no body, no sleeve logo.
Style: high-end product photography, premium studio lighting, clean reflections, realistic shadows on the object only, ultra detailed, 4k quality, refined and cinematic.
Background requirement: Create the subject on a perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. Keep the subject fully separated from the background with crisp edges and generous padding. Do not use #00ff00 anywhere in the subject.
Avoid: No Apple logo, no readable brand text, no notch or dynamic-island-like cutout, no extra fingers, no distorted hand, no face, no body, no clutter, no watermark, no low quality.
```

Transparency was produced locally with:

```bash
python3 /Users/royribak/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
```

## qr-wall-sign.png

Built-in ImageGen prompt:

```text
Use case: product-mockup
Asset type: transparent layered website asset for a pinned scroll product story
Primary request: Photorealistic premium acrylic and brushed-metal QR wall sign for a luxury restroom reporting flow, no brand identity.
Subject: A freestanding premium acrylic or brushed-metal wall sign panel with a clear central QR-code-like square pattern, mounted style but isolated as an object. Elegant hospitality restroom signage feel, subtle beveled edges, glass/acrylic reflections, small restroom pictogram is acceptable but no readable text.
Style: high-end hotel restroom signage, photorealistic 3D product render, luxury material, subtle blue glow, realistic reflections, ultra detailed, 4k quality.
Background requirement: Create the sign on a perfectly flat solid #00ff00 chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. Keep the subject fully separated from the background with crisp edges and generous padding. Do not use #00ff00 anywhere in the subject.
Avoid: No brand logos, no readable text, no people, no distorted QR, no cheap plastic, no watermark, no low quality, no wall background.
```

Transparency was produced with the same chroma-key removal command above.

Current implementation note: the final scan scene uses `scan-context-bg.webp`, where the QR sign is already embedded in the full context image. `qr-wall-sign.png` is kept as a rollback/alternate transparent layer.

## clean-bubbles.png

Built-in ImageGen prompt:

```text
Use case: stylized-concept
Asset type: transparent overlay website asset for cleaning transition
Primary request: Elegant transparent-effect overlay of subtle water bubbles and cleanliness sparkles, premium and minimal, not cartoon.
Subject: Delicate cluster of translucent water bubbles, tiny white-blue sparkles, faint mist highlights, arranged as a wide airy overlay with generous negative space. Premium hygiene effect for a luxury restroom transformation.
Style: refined commercial product effect, soft blue-white highlights, photorealistic water/glass sparkle, minimal and tasteful, high resolution.
Background requirement: Create the effect on a perfectly flat solid #ff00ff chroma-key background for background removal. The background must be one uniform color with no shadows, gradients, texture, reflections, floor plane, or lighting variation. Keep the translucent bubbles visible but separated from the background. Do not use #ff00ff anywhere in the subject.
Avoid: No cartoon bubbles, no soap foam covering everything, no childish style, no text, no logos, no watermark, no dense clutter, no background.
```

Transparency was produced with the same chroma-key removal command above.

## restroom-dirty.webp and restroom-clean.webp

These were copied from the existing homepage before/after pair:

```text
public/home/cp-before-dirty.webp
public/home/cp-before-clean.webp
```

Reason: the existing pair is already a same-angle luxury restroom before/after scene, which is better for the scroll wipe than unrelated generated variants.

## kiosk/tablet-mockup-cropped.png

Asset lives in:

```text
public/kiosk/tablet-mockup-cropped.png
```

Current use: `/kiosk-demo` tablet shell. Source: user-provided transparent tablet mockup, cropped locally so the public report UI can sit inside the black screen area.
