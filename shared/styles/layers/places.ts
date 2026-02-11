/**
 * Places layers (incorporated places boundaries)
 */

import type { LayerSpecification } from "maplibre-gl";
import type { Theme } from "../theme.js";

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
  
  // Fill layer - semi-transparent with data-driven opacity based on population
  layers.push({
    id: "places-fill",
    type: "fill",
    source: "places-source",
    "source-layer": "places",
    minzoom: minZoom,
    filter: ["all", ["has", "GEOID"]],
    paint: {
      "fill-color": places.fill.color,
      "fill-opacity": [
        "+",
        places.fill.opacity,
        [
          "case",
          // Use feature-state for population-based opacity boost
          ["!=", ["feature-state", "pop_total"], null],
          [
            "interpolate",
            ["linear"],
            ["feature-state", "pop_total"],
            0, 0,           // No boost for 0 population
            10000, 0.05,    // Small boost for 10k+
            50000, 0.1,     // Medium boost for 50k+
            100000, 0.15,   // Larger boost for 100k+
            500000, 0.2     // Max boost for 500k+
          ],
          0  // Default: no boost if no population data
        ]
      ],
      "fill-antialias": false,
    }
  });
  
  // Outline layer - visible borders
  layers.push({
    id: "places-outline",
    type: "line",
    source: "places-source",
    "source-layer": "places",
    minzoom: minZoom,
    filter: ["all", ["has", "GEOID"]],
    paint: {
      "line-color": places.outline.color,
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5, places.outline.width.z5 ?? 0.5,
        10, places.outline.width.z10 ?? 1.0,
        15, places.outline.width.z15 ?? 1.5
      ],
      "line-opacity": places.outline.opacity,
    }
  });
  
  return layers;
}
