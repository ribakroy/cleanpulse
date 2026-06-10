"use client";

import React, { useState } from "react";

interface IssueData {
  label: string;
  count: number;
}

interface ReportsDonutChartProps {
  incidentsByIssue: IssueData[];
  chartColors: string[];
  totalIssuesCount: number;
}

export function ReportsDonutChart({
  incidentsByIssue,
  chartColors,
  totalIssuesCount,
}: ReportsDonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (totalIssuesCount === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
        אין נתוני תקלות.
      </div>
    );
  }

  // Dimensions of SVG
  const width = 460;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const rOut = 85;
  const rIn = 60;
  const rLabel = 105; // radius where line bends

  // Helper for polar to Cartesian coordinates
  const getPoint = (radius: number, angle: number) => {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Build the slices with angles
  const slices = incidentsByIssue.map((d, idx) => {
    const pct = totalIssuesCount > 0 ? d.count / totalIssuesCount : 0;
    
    // Pure calculation of cumulative percentages
    const startPct = incidentsByIssue
      .slice(0, idx)
      .reduce((sum, item) => sum + (totalIssuesCount > 0 ? item.count / totalIssuesCount : 0), 0);
    const endPct = startPct + pct;

    const startAngle = startPct * 2 * Math.PI - Math.PI / 2;
    const endAngle = endPct * 2 * Math.PI - Math.PI / 2;
    const midAngle = startAngle + (endAngle - startAngle) / 2;

    const color = chartColors[idx % chartColors.length];

    return {
      ...d,
      pct: Math.round(pct * 100),
      startAngle,
      endAngle,
      midAngle,
      color,
      index: idx,
    };
  });

  // Center text contents
  const hoveredSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-2 w-full">
      {/* SVG Container with viewbox for responsiveness */}
      <div className="relative w-full max-w-[460px] aspect-[460/300] shrink-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
        >
          {/* Slices */}
          <g>
            {slices.map((slice, idx) => {
              const { startAngle, endAngle, midAngle, color } = slice;
              const isHovered = hoveredIdx === idx;

              // Arc math details
              const sliceAngle = endAngle - startAngle;
              const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

              // Compute coordinates
              const pOutStart = getPoint(rOut, startAngle);
              const pOutEnd = getPoint(rOut, endAngle);
              const pInStart = getPoint(rIn, startAngle);
              const pInEnd = getPoint(rIn, endAngle);

              let pathData = "";
              if (sliceAngle >= 2 * Math.PI - 0.001) {
                // Render full circle donut
                pathData = `
                  M ${cx} ${cy - rOut}
                  A ${rOut} ${rOut} 0 1 1 ${cx - 0.01} ${cy - rOut}
                  Z
                  M ${cx} ${cy - rIn}
                  A ${rIn} ${rIn} 0 1 0 ${cx - 0.01} ${cy - rIn}
                  Z
                `;
              } else {
                pathData = `
                  M ${pOutStart.x} ${pOutStart.y}
                  A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${pOutEnd.x} ${pOutEnd.y}
                  L ${pInEnd.x} ${pInEnd.y}
                  A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${pInStart.x} ${pInStart.y}
                  Z
                `;
              }

              // Transform for hovering (slight translation along middle angle)
              const shiftDist = isHovered ? 6 : 0;
              const tx = Math.cos(midAngle) * shiftDist;
              const ty = Math.sin(midAngle) * shiftDist;

              return (
                <path
                  key={idx}
                  d={pathData}
                  fill={color}
                  className="cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-105"
                  style={{
                    transform: `translate(${tx}px, ${ty}px)`,
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </g>

          {/* Leader lines and labels */}
          <g>
            {slices.map((slice, idx) => {
              const { midAngle, color, pct, label, count } = slice;
              const isHovered = hoveredIdx === idx;

              // Line start (slightly outside outer circle)
              const pLineStart = getPoint(rOut + 3, midAngle);
              // Line bend
              const pLineBend = getPoint(rLabel, midAngle);

              // Direction of horizontal extension
              const isRightSide = Math.cos(midAngle) >= 0;
              const bendOffset = isRightSide ? 15 : -15;
              const pLineEnd = {
                x: pLineBend.x + bendOffset,
                y: pLineBend.y,
              };

              // Text coordinates
              const textX = pLineEnd.x + (isRightSide ? 6 : -6);
              const textY = pLineEnd.y;
              const textAnchor = isRightSide ? "start" : "end";

              // Leader line path
              const linePath = `M ${pLineStart.x} ${pLineStart.y} L ${pLineBend.x} ${pLineBend.y} L ${pLineEnd.x} ${pLineEnd.y}`;

              // Don't render line/text if the slice is too small or if it's less than 1% to avoid overlap, unless it's the only ones.
              if (pct < 1 && incidentsByIssue.length > 5) return null;

              return (
                <g
                  key={idx}
                  className="transition-all duration-300"
                  style={{
                    opacity: hoveredIdx === null || isHovered ? 1 : 0.45,
                  }}
                >
                  {/* Leader line */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? 1.8 : 1.1}
                    className="transition-all duration-200"
                  />
                  {/* Label dot at start */}
                  <circle
                    cx={pLineStart.x}
                    cy={pLineStart.y}
                    r={isHovered ? 3 : 2}
                    fill={color}
                    className="transition-all duration-200"
                  />
                  {/* Text Label */}
                  <text
                    x={textX}
                    y={textY}
                    textAnchor={textAnchor}
                    className="font-sans text-[11px] font-bold fill-slate-800 transition-all duration-200"
                  >
                    <tspan x={textX} dy="-4">
                      {label.length > 14 ? `${label.substring(0, 13)}...` : label}
                    </tspan>
                    <tspan
                      x={textX}
                      dy="13"
                      className="font-mono text-[9.5px] font-semibold fill-slate-500"
                    >
                      ({pct}%) {count}
                    </tspan>
                  </text>
                </g>
              );
            })}
          </g>

          {/* Center Info Panel */}
          <g className="pointer-events-none">
            {hoveredSlice ? (
              <>
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  className="font-sans text-[10px] font-bold fill-slate-400"
                >
                  {hoveredSlice.label.length > 16
                    ? `${hoveredSlice.label.substring(0, 15)}...`
                    : hoveredSlice.label}
                </text>
                <text
                  x={cx}
                  y={cy + 12}
                  textAnchor="middle"
                  className="font-sans text-lg font-black fill-[#0f2742]"
                >
                  {hoveredSlice.pct}%
                </text>
                <text
                  x={cx}
                  y={cy + 26}
                  textAnchor="middle"
                  className="font-sans text-[9px] font-medium fill-slate-500"
                >
                  {hoveredSlice.count} דיווחים
                </text>
              </>
            ) : (
              <>
                <text
                  x={cx}
                  y={cy - 6}
                  textAnchor="middle"
                  className="font-sans text-2xl font-black fill-[#0f2742]"
                >
                  {totalIssuesCount}
                </text>
                <text
                  x={cx}
                  y={cy + 13}
                  textAnchor="middle"
                  className="font-sans text-[9.5px] font-bold fill-slate-500 tracking-wider"
                >
                  דיווחים
                </text>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 w-full pt-4 border-t border-border/60">
        {slices.map((slice, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={slice.label}
              className={`flex items-center justify-between text-[11.5px] gap-2 p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                isHovered
                  ? "bg-slate-100 scale-[1.02] border-l-2 border-[#1e88e5] font-bold"
                  : "hover:bg-slate-50/80"
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <span
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span
                  className={`truncate text-right ${
                    isHovered ? "text-[#0f2742]" : "text-slate-700"
                  }`}
                  title={slice.label}
                >
                  {slice.label}
                </span>
              </div>
              <span className="font-mono text-slate-500 shrink-0 text-[10.5px] pl-1">
                {slice.count}{" "}
                <span className="text-slate-400 text-[9px]">({slice.pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
