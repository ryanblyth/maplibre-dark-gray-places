/**
 * Places layers (incorporated places boundaries)
 */

import type {
  DataDrivenPropertyValueSpecification,
  ExpressionSpecification,
  FilterSpecification,
  LayerSpecification,
} from "maplibre-gl";
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
 * Generates a density-based color step expression for a provided value
 * (used for point features where we compute density on the fly)
 */
function generateDensityStepForValue(
  densityColors: DensityColors,
  densityValueExpression: ExpressionSpecification
): ExpressionSpecification {
  const sortedRanges = sortRangesByThreshold(densityColors.ranges);
  const expression: (string | number | ExpressionSpecification)[] = [
    "step",
    ["coalesce", densityValueExpression, 0],
    densityColors.defaultFillColor,
  ];

  for (const range of sortedRanges) {
    expression.push(range.threshold, range.fillColor);
  }

  return expression as ExpressionSpecification;
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
): ExpressionSpecification {
  const sortedRanges = sortRangesByThreshold(densityColors.ranges);

  const expression: (string | number | ExpressionSpecification)[] = [
    "step",
    ["feature-state", "pop_density_sqmi"],
  ];

  if (isOutline) {
    const defaultColor =
      densityColors.defaultOutlineColor ||
      darkenColor(densityColors.defaultFillColor);
    expression.push(defaultColor);
  } else {
    expression.push(densityColors.defaultFillColor);
  }

  for (const range of sortedRanges) {
    expression.push(range.threshold);
    if (isOutline) {
      const outlineColor = range.outlineColor || darkenColor(range.fillColor);
      expression.push(outlineColor);
    } else {
      expression.push(range.fillColor);
    }
  }

  return expression as ExpressionSpecification;
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
  const labelColor = theme.colors?.label?.place?.color ?? "#ffffff";
  const labelHalo = theme.colors?.label?.place?.halo ?? "#000000";

  // Normalize stops: number | number[] | record -> even-length [z,v,...]
  function normalizeStops(
    input: number | number[] | Record<string, number> | undefined,
    defaultStops: number[]
  ): number[] {
    if (input === undefined) return defaultStops;
    if (typeof input === "number") {
      return [0, input, 24, input];
    }
    if (Array.isArray(input)) {
      return input.length >= 2 && input.length % 2 === 0 ? input : defaultStops;
    }
    // record of named stops like { z0: 1, z6_5: 3 }
    const pairs: Array<[number, number]> = [];
    for (const [k, v] of Object.entries(input)) {
      const zStr = k.startsWith("z") ? k.slice(1) : k;
      const zNum = parseFloat(zStr.replace("_", "."));
      if (!Number.isNaN(zNum)) {
        pairs.push([zNum, v]);
      }
    }
    pairs.sort((a, b) => a[0] - b[0]);
    const flat: number[] = [];
    for (const [z, v] of pairs) {
      flat.push(z, v);
    }
    return flat.length >= 2 && flat.length % 2 === 0 ? flat : defaultStops;
  }

  function getZoomBreaks(stops: number[], fallbackBreaks: number[]): number[] {
    if (stops.length >= 2 && stops.length % 2 === 0) {
      const zooms: number[] = [];
      for (let i = 0; i < stops.length; i += 2) {
        zooms.push(stops[i]);
      }
      return Array.from(new Set(zooms)).sort((a, b) => a - b);
    }
    return fallbackBreaks;
  }

  function valueAtZoom(
    normalizedStops: number[],
    defaultValue: number,
    zoom: number
  ): number {
    if (normalizedStops.length < 2 || normalizedStops.length % 2 !== 0) {
      return defaultValue;
    }
    const stops = normalizedStops;
    if (zoom <= stops[0]) return stops[1];
    for (let i = 0; i < stops.length - 2; i += 2) {
      const z0 = stops[i];
      const v0 = stops[i + 1];
      const z1 = stops[i + 2];
      const v1 = stops[i + 3];
      if (zoom <= z1) {
        const t = (zoom - z0) / (z1 - z0 || 1);
        return v0 + (v1 - v0) * t;
      }
    }
    return stops[stops.length - 1];
  }

  // Density value for point tiles (computed directly from attributes)
  const densityValueForPoints = [
    "case",
    [">", ["coalesce", ["get", "ALAND"], 0], 0],
    [
      "/",
      ["coalesce", ["get", "pop_total"], 0],
      [
        "/",
        ["max", ["coalesce", ["get", "ALAND"], 0.000001], 0.000001],
        2589988.110336,
      ],
    ],
    0,
  ] as ExpressionSpecification;

  const fillColorExpression = (
    places.densityColors
      ? [
          "case",
          ["!=", ["feature-state", "pop_density_sqmi"], null],
          generateDensityStepExpression(places.densityColors, false),
          places.fill.color,
        ]
      : [
          "case",
          ["!=", ["feature-state", "pop_density_sqmi"], null],
          [
            "step",
            ["feature-state", "pop_density_sqmi"],
            "#ecda9a",
            100,
            "#efc47e",
            300,
            "#f3ad6a",
            1000,
            "#f7945d",
            2000,
            "#f97b57",
            5000,
            "#f66356",
            10000,
            "#ee4d5a",
          ],
          places.fill.color,
        ]
  ) as DataDrivenPropertyValueSpecification<string>;

  const pointFillColorExpression = (
    places.densityColors
      ? generateDensityStepForValue(places.densityColors, densityValueForPoints)
      : [
          "step",
          densityValueForPoints,
          "#ecda9a",
          100,
          "#efc47e",
          300,
          "#f3ad6a",
          1000,
          "#f7945d",
          2000,
          "#f97b57",
          5000,
          "#f66356",
          10000,
          "#ee4d5a",
        ]
  ) as DataDrivenPropertyValueSpecification<string>;

  const outlineColorExpression = (
    places.densityColors
      ? [
          "case",
          ["!=", ["feature-state", "pop_density_sqmi"], null],
          generateDensityStepExpression(places.densityColors, true),
          places.outline.color,
        ]
      : [
          "case",
          ["!=", ["feature-state", "pop_density_sqmi"], null],
          [
            "step",
            ["feature-state", "pop_density_sqmi"],
            "#c4b87a",
            100,
            "#c9a366",
            300,
            "#c88a54",
            1000,
            "#c7754a",
            2000,
            "#c86246",
            5000,
            "#c44e45",
            10000,
            "#c03d48",
          ],
          places.outline.color,
        ]
  ) as DataDrivenPropertyValueSpecification<string>;

  const placesFillOpacity = [
    "interpolate",
    ["linear"],
    ["zoom"],
    5,
    0,
    6.5,
    [
      "*",
      places.fill.opacity ?? 0.35,
      [
        "+",
        1.0,
        [
          "case",
          ["!=", ["feature-state", "pop_total"], null],
          [
            "interpolate",
            ["linear"],
            ["feature-state", "pop_total"],
            0,
            0,
            10000,
            0.05,
            50000,
            0.1,
            100000,
            0.15,
            500000,
            0.2,
          ],
          0,
        ],
      ],
    ],
    13,
    [
      "*",
      places.fill.opacity ?? 0.35,
      [
        "+",
        1.0,
        [
          "case",
          ["!=", ["feature-state", "pop_total"], null],
          [
            "interpolate",
            ["linear"],
            ["feature-state", "pop_total"],
            0,
            0,
            10000,
            0.05,
            50000,
            0.1,
            100000,
            0.15,
            500000,
            0.2,
          ],
          0,
        ],
      ],
    ],
  ] as DataDrivenPropertyValueSpecification<number>;

  const pointLayerIds = [
    { id: "places-points-lowzoom", layerName: "places_points" },
  ];

  const clusterLabelLayerIds = [
    { id: "places-cluster-labels-lowzoom", layerName: "places_points" },
  ];

  // Low-zoom point/cluster layers (starfield points) with fallback source-layer names
  if (places.pointsEnabled !== false) {
    for (const entry of pointLayerIds) {
      const radiusStops = normalizeStops(places.points?.radius, [0, 1, 6.5, 3]);
      const strokeStops = normalizeStops(places.points?.strokeWidth, [0, 0.1, 6.5, 0.25]);
      const opacityStops = normalizeStops(places.points?.opacity, [0, 1, 5, 1, 6.5, 0]);

      const radiusBreaks = getZoomBreaks(radiusStops, [0, 6.5, 24]);
      const strokeBreaks = getZoomBreaks(strokeStops, [0, 6.5, 24]);
      const opacityBreaks = getZoomBreaks(opacityStops, [0, 5, 6.5, 24]);

      const radiusInterpolate = [
        "interpolate",
        ["linear"],
        ["zoom"],
        ...radiusBreaks.flatMap((z) => [
          z,
          [
            "case",
            ["==", ["coalesce", ["get", "cluster"], false], true],
            [
              "interpolate",
              ["linear"],
              ["sqrt", ["coalesce", ["get", "point_count"], 1]],
              1,
              4,
              5,
              8,
              25,
              14,
              100,
              22,
            ],
            valueAtZoom(radiusStops, 3, z),
          ] as ExpressionSpecification,
        ]),
      ] as DataDrivenPropertyValueSpecification<number>;

      const strokeInterpolate = [
        "interpolate",
        ["linear"],
        ["zoom"],
        ...strokeBreaks.flatMap((z) => [z, valueAtZoom(strokeStops, 0.25, z)]),
      ] as DataDrivenPropertyValueSpecification<number>;

      const opacityInterpolate = [
        "interpolate",
        ["linear"],
        ["zoom"],
        ...opacityBreaks.flatMap((z) => [z, valueAtZoom(opacityStops, 1, z)]),
      ] as DataDrivenPropertyValueSpecification<number>;

      layers.push({
        id: entry.id,
        type: "circle",
        source: "places-low-source",
        "source-layer": entry.layerName,
        minzoom: 0,
        maxzoom: 6.6,
        paint: {
          "circle-color": pointFillColorExpression,
          "circle-radius": radiusInterpolate,
          "circle-opacity": opacityInterpolate,
          "circle-stroke-width": strokeInterpolate,
          "circle-stroke-color": places.points?.strokeColor ?? "#111822"
        }
      });
    }
  }

  // Optional cluster labels for low zooms (with fallback source-layer names)
  if (places.pointsEnabled !== false) {
    for (const entry of clusterLabelLayerIds) {
      layers.push({
        id: entry.id,
        type: "symbol",
        source: "places-low-source",
        "source-layer": entry.layerName,
        minzoom: 2.5,
        maxzoom: 5.5,
        filter: [
          "==",
          ["coalesce", ["get", "cluster"], false],
          true,
        ] as FilterSpecification,
        layout: {
          "text-field": [
            "get",
            "point_count_abbreviated",
          ] as ExpressionSpecification,
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            2.5,
            10,
            5.5,
            14,
          ] as DataDrivenPropertyValueSpecification<number>,
          "text-font":
            theme.labelFonts?.place ??
            theme.labelFonts?.default ??
            theme.fonts.regular,
        },
        paint: {
          "text-color": labelColor,
          "text-halo-color": labelHalo,
          "text-halo-width": 1.5,
          "text-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            2.5,
            0.9,
            5.5,
            0,
          ] as DataDrivenPropertyValueSpecification<number>,
        },
      });
    }
  }

  // Fill layer - data-driven color based on population density, with opacity based on population
  if (places.polygonsEnabled !== false) {
    layers.push({
      id: "places-fill",
      type: "fill",
      source: "places-source",
      "source-layer": "places",
      minzoom: minZoom,
      filter: ["all", ["has", "GEOID"]],
      paint: {
        "fill-color": fillColorExpression,
        "fill-opacity": placesFillOpacity,
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
          5,
          places.outline.width.z5 ?? 0.5,
          10,
          places.outline.width.z10 ?? 1.0,
          15,
          places.outline.width.z15 ?? 1.5,
        ] as DataDrivenPropertyValueSpecification<number>,
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5,
          0.1,
          6.5,
          places.outline.opacity ?? 0.6,
          13,
          places.outline.opacity ?? 0.6,
        ] as DataDrivenPropertyValueSpecification<number>,
      }
    });
  }
  
  return layers;
}
