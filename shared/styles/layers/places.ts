/**
 * Places layers (incorporated places boundaries)
 */

import type { LayerSpecification } from "maplibre-gl";
import type { Theme, DensityColorRange, DensityColors } from "../theme.js";

/**
 * Darkens a hex color by reducing RGB values by ~25%
 * 
 * @param hexColor - Hex color string (e.g., "#ecda9a")
 * @returns Darkened hex color string
 */
function darkenColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Darken by ~25% (multiply by 0.75)
  const darkenedR = Math.round(r * 0.75);
  const darkenedG = Math.round(g * 0.75);
  const darkenedB = Math.round(b * 0.75);
  
  // Convert back to hex
  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
}

/**
 * Sorts density color ranges by threshold (ascending)
 * 
 * @param ranges - Array of density color ranges
 * @returns Sorted array of ranges
 */
function sortRangesByThreshold(ranges: DensityColorRange[]): DensityColorRange[] {
  return [...ranges].sort((a, b) => a.threshold - b.threshold);
}

/**
 * Generates a MapLibre step expression for density-based colors
 * 
 * @param densityColors - Density color configuration
 * @param isOutline - Whether generating for outline (uses outlineColor or auto-darkens)
 * @returns MapLibre expression array for step function
 */
function generateDensityStepExpression(
  densityColors: DensityColors,
  isOutline: boolean = false
): any[] {
  const sortedRanges = sortRangesByThreshold(densityColors.ranges);
  
  // Start with the step expression structure
  const expression: any[] = [
    "step",
    ["feature-state", "pop_density_sqmi"]
  ];
  
  // Add default color (for values below first threshold)
  if (isOutline) {
    const defaultColor = densityColors.defaultOutlineColor || darkenColor(densityColors.defaultFillColor);
    expression.push(defaultColor);
  } else {
    expression.push(densityColors.defaultFillColor);
  }
  
  // Add threshold and color pairs
  for (const range of sortedRanges) {
    expression.push(range.threshold);
    if (isOutline) {
      const outlineColor = range.outlineColor || darkenColor(range.fillColor);
      expression.push(outlineColor);
    } else {
      expression.push(range.fillColor);
    }
  }
  
  return expression;
}

/**
 * Creates places fill and outline layers for incorporated places boundaries
 * 
 * @param theme - Theme object with places configuration
 * @returns Array of LayerSpecification objects, or empty array if places is disabled
 */
export function createPlacesLayers(theme: Theme): LayerSpecification[] {
  // Return empty array if places is disabled
  if (!theme.places?.enabled) {
    return [];
  }
  
  const places = theme.places;
  const layers: LayerSpecification[] = [];
  
  const minZoom = places.minZoom ?? 5;
  
  // Determine fill color expression based on density configuration
  const fillColorExpression = places.densityColors
    ? [
        "case",
        // Use density-based colors if available
        ["!=", ["feature-state", "pop_density_sqmi"], null],
        generateDensityStepExpression(places.densityColors, false),
        // Fallback to theme color if no density data
        places.fill.color
      ]
    : [
        "case",
        // Use density-based colors if available (fallback to hardcoded values)
        ["!=", ["feature-state", "pop_density_sqmi"], null],
        [
          "step",
          ["feature-state", "pop_density_sqmi"],
          "#ecda9a",  // Default for < 100
          100, "#efc47e",   // 100-300
          300, "#f3ad6a",   // 300-1,000
          1000, "#f7945d",  // 1,000-2,000
          2000, "#f97b57",  // 2,000-5,000
          5000, "#f66356",  // 5,000-10,000
          10000, "#ee4d5a"  // 10,000-25,000
        ],
        // Fallback to theme color if no density data
        places.fill.color
      ];
  
  // Determine outline color expression based on density configuration
  const outlineColorExpression = places.densityColors
    ? [
        "case",
        // Use density-based darker colors if available
        ["!=", ["feature-state", "pop_density_sqmi"], null],
        generateDensityStepExpression(places.densityColors, true),
        // Fallback to theme color if no density data
        places.outline.color
      ]
    : [
        "case",
        // Use density-based darker colors if available (fallback to hardcoded values)
        ["!=", ["feature-state", "pop_density_sqmi"], null],
        [
          "step",
          ["feature-state", "pop_density_sqmi"],
          "#c4b87a",  // Default for < 100 (darker #ecda9a)
          100, "#c9a366",   // 100-300 (darker #efc47e)
          300, "#c88a54",   // 300-1,000 (darker #f3ad6a)
          1000, "#c7754a",  // 1,000-2,000 (darker #f7945d)
          2000, "#c86246",  // 2,000-5,000 (darker #f97b57)
          5000, "#c44e45",  // 5,000-10,000 (darker #f66356)
          10000, "#c03d48"  // 10,000-25,000 (darker #ee4d5a)
        ],
        // Fallback to theme color if no density data
        places.outline.color
      ];
  
  // Fill layer - data-driven color based on population density, with opacity based on population
  layers.push({
    id: "places-fill",
    type: "fill",
    source: "places-source",
    "source-layer": "places",
    minzoom: minZoom,
    filter: ["all", ["has", "GEOID"]],
    paint: {
      "fill-color": fillColorExpression,
      "fill-opacity": [
        "*",
        places.fill.opacity ?? 0.15,  // Theme opacity controls the base/maximum opacity for the layer
        [
          "+",
          1.0,  // Base multiplier (1.0 = 100% of theme opacity)
          [
            "case",
            // Use feature-state for population-based opacity boost
            ["!=", ["feature-state", "pop_total"], null],
            [
              "interpolate",
              ["linear"],
              ["feature-state", "pop_total"],
              0, 0,           // No boost for 0 population
              10000, 0.05,    // Small boost for 10k+ (adds 5% to multiplier)
              50000, 0.1,     // Medium boost for 50k+ (adds 10% to multiplier)
              100000, 0.15,   // Larger boost for 100k+ (adds 15% to multiplier)
              500000, 0.2     // Max boost for 500k+ (adds 20% to multiplier)
            ],
            0  // Default: no boost if no population data
          ]
        ]
      ],
      "fill-antialias": false,
    }
  });
  
  // Outline layer - data-driven color based on population density (darker versions of fill colors)
  layers.push({
    id: "places-outline",
    type: "line",
    source: "places-source",
    "source-layer": "places",
    minzoom: minZoom,
    filter: ["all", ["has", "GEOID"]],
    paint: {
      "line-color": outlineColorExpression,
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5, places.outline.width.z5 ?? 0.5,
        10, places.outline.width.z10 ?? 1.0,
        15, places.outline.width.z15 ?? 1.5
      ],
      "line-opacity": places.outline.opacity ?? 0.6,  // Outline opacity from theme (default: 0.6 if not specified)
    }
  });
  
  return layers;
}
