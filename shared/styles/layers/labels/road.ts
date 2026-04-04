/**
 * Road label layers
 */

import type {
  DataDrivenPropertyValueSpecification,
  FilterSpecification,
  LayerSpecification,
} from "maplibre-gl";
import type { Theme } from "../../theme.js";
import { createAbbreviatedTextField } from "../../baseStyle.js";

function roadLabelTextSize(
  z0: number,
  s0: number,
  z1: number,
  s1: number,
  z2: number,
  s2: number
): DataDrivenPropertyValueSpecification<number> {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    z0,
    s0,
    z1,
    s1,
    z2,
    s2,
  ] as DataDrivenPropertyValueSpecification<number>;
}

function roadLabelTextSizeTwo(
  z0: number,
  s0: number,
  z1: number,
  s1: number
): DataDrivenPropertyValueSpecification<number> {
  return [
    "interpolate",
    ["linear"],
    ["zoom"],
    z0,
    s0,
    z1,
    s1,
  ] as DataDrivenPropertyValueSpecification<number>;
}

export function createRoadLabelLayers(theme: Theme): LayerSpecification[] {
  const c = theme.colors;
  const majorFilter = [
    "all",
    ["!=", ["get", "brunnel"], "tunnel"],
    ["!=", ["get", "brunnel"], "bridge"],
    [
      "match",
      ["get", "class"],
      ["motorway", "trunk", "primary"],
      true,
      false,
    ],
    ["has", "name"],
  ] as FilterSpecification;
  const secondaryFilter = [
    "all",
    ["!=", ["get", "brunnel"], "tunnel"],
    ["!=", ["get", "brunnel"], "bridge"],
    ["==", ["get", "class"], "secondary"],
    ["has", "name"],
  ] as FilterSpecification;
  const tertiaryFilter = [
    "all",
    ["!=", ["get", "brunnel"], "tunnel"],
    ["!=", ["get", "brunnel"], "bridge"],
    [
      "match",
      ["get", "class"],
      ["tertiary", "residential"],
      true,
      false,
    ],
    ["has", "name"],
  ] as FilterSpecification;
  const otherFilter = [
    "all",
    ["!=", ["get", "brunnel"], "tunnel"],
    ["!=", ["get", "brunnel"], "bridge"],
    [
      "!",
      [
        "match",
        ["get", "class"],
        [
          "motorway",
          "trunk",
          "primary",
          "secondary",
          "tertiary",
          "residential",
        ],
        true,
        false,
      ],
    ],
    ["has", "name"],
  ] as FilterSpecification;
  
  // Use theme-configured font for road labels, with fallback to default fonts
  const roadFont = theme.labelFonts?.road ?? theme.labelFonts?.default ?? theme.fonts.regular;
  
  const baseLabelLayout = { 
    "text-font": roadFont, 
    "symbol-placement": "line" as const, 
    "text-rotation-alignment": "map" as const, 
    "text-pitch-alignment": "viewport" as const, 
    "symbol-spacing": 150 
  };
  const baseLabelPaint = { 
    "text-halo-color": c.label.road.halo, 
    "text-halo-width": 1.5, 
    "text-halo-blur": 1 
  };
  
  return [
    { id: "road-label-major", type: "symbol", source: "us_high", "source-layer": "transportation_name", minzoom: 8, filter: majorFilter, layout: { ...baseLabelLayout, "text-field": createAbbreviatedTextField(), "text-size": roadLabelTextSize(8, 9, 12, 11, 15, 13) }, paint: { ...baseLabelPaint, "text-color": c.label.road.major.color, "text-opacity": c.label.road.major.opacity } },
    { id: "road-label-secondary", type: "symbol", source: "us_high", "source-layer": "transportation_name", minzoom: 10, filter: secondaryFilter, layout: { ...baseLabelLayout, "text-field": createAbbreviatedTextField(), "text-size": roadLabelTextSize(10, 8, 12, 10, 15, 12) }, paint: { ...baseLabelPaint, "text-color": c.label.road.secondary.color, "text-opacity": c.label.road.secondary.opacity } },
    { id: "road-label-tertiary", type: "symbol", source: "us_high", "source-layer": "transportation_name", minzoom: 12, filter: tertiaryFilter, layout: { ...baseLabelLayout, "text-field": createAbbreviatedTextField(), "text-size": roadLabelTextSizeTwo(12, 8, 15, 10) }, paint: { ...baseLabelPaint, "text-color": c.label.road.tertiary.color, "text-opacity": c.label.road.tertiary.opacity } },
    { id: "road-label-other", type: "symbol", source: "us_high", "source-layer": "transportation_name", minzoom: 14, filter: otherFilter, layout: { ...baseLabelLayout, "text-field": createAbbreviatedTextField(), "text-size": roadLabelTextSizeTwo(14, 7, 15, 8) }, paint: { ...baseLabelPaint, "text-color": c.label.road.other.color, "text-opacity": c.label.road.other.opacity } },
  ];
}

/**
 * Creates highway shield layers that display route numbers with shield sprites
 * (e.g., I-95, US-1, State Route 66)
 * 
 * Shield visibility and styling is controlled via theme.shields
 */
export function createHighwayShieldLayers(theme: Theme): LayerSpecification[] {
  const shields = theme.shields;
  
  // If shields are disabled globally, return empty array
  if (shields && !shields.enabled) {
    return [];
  }
  
  // Default values if shields config is not provided
  const interstateConfig = shields?.interstate || { enabled: true, sprite: "shield-interstate", textColor: "#ffffff", minZoom: 6 };
  const usHighwayConfig = shields?.usHighway || { enabled: true, sprite: "shield-us", textColor: "#000000", minZoom: 7 };
  const stateHighwayConfig = shields?.stateHighway || { enabled: true, sprite: "shield-state", textColor: "#1a4d1a", minZoom: 8 };
  
  // Filter for roads that have a ref (route number)
  const interstateFilter = [
    "all",
    ["has", "ref"],
    ["==", ["get", "network"], "us-interstate"],
  ] as FilterSpecification;
  const usHighwayFilter = [
    "all",
    ["has", "ref"],
    ["==", ["get", "network"], "us-highway"],
  ] as FilterSpecification;
  const stateHighwayFilter = [
    "all",
    ["has", "ref"],
    [
      "match",
      ["get", "network"],
      ["us-state", "US:US", "US"],
      true,
      false,
    ],
  ] as FilterSpecification;
  
  // Base layout shared by all shields (can be overridden per-shield)
  const baseShieldLayout = {
    "symbol-placement": "line" as const,
    "icon-rotation-alignment": "viewport" as const,
    "text-rotation-alignment": "viewport" as const,
    "icon-pitch-alignment": "viewport" as const,
    "text-pitch-alignment": "viewport" as const,
    "symbol-spacing": 400,
    "text-field": ["get", "ref"],
    "icon-text-fit": "both" as const,
    "icon-size": ["interpolate", ["linear"], ["zoom"], 6, 0.8, 10, 1.0, 14, 1.2],
    "text-letter-spacing": 0.05,
  };
  
  // Helper to build text-size interpolation from config [minZoom, minSize, maxZoom, maxSize]
  const buildTextSize = (
    config?: [number, number, number, number]
  ): DataDrivenPropertyValueSpecification<number> => {
    if (!config) {
      return [
        "interpolate",
        ["linear"],
        ["zoom"],
        6,
        9,
        14,
        13,
      ] as DataDrivenPropertyValueSpecification<number>;
    }
    return [
      "interpolate",
      ["linear"],
      ["zoom"],
      config[0],
      config[1],
      config[2],
      config[3],
    ] as DataDrivenPropertyValueSpecification<number>;
  };
  
  const layers: LayerSpecification[] = [];
  
  // Interstate shields (I-70, I-95, etc.)
  if (interstateConfig.enabled) {
    layers.push({ 
      id: "highway-shield-interstate", 
      type: "symbol", 
      source: "us_high", 
      "source-layer": "transportation_name", 
      minzoom: interstateConfig.minZoom || 6, 
      filter: interstateFilter, 
      layout: { 
        ...baseShieldLayout,
        "icon-image": interstateConfig.sprite,
        "icon-text-fit-padding": interstateConfig.textPadding || [2, 4, 2, 4],
        "text-size": buildTextSize(interstateConfig.textSize),
        "text-font": interstateConfig.textFont || theme.fonts.semibold || theme.fonts.regular,
      }, 
      paint: { 
        "text-color": interstateConfig.textColor,
      } 
    } as LayerSpecification);
  }
  
  // US Highway shields (US-1, US-66, etc.)
  if (usHighwayConfig.enabled) {
    layers.push({ 
      id: "highway-shield-us", 
      type: "symbol", 
      source: "us_high", 
      "source-layer": "transportation_name", 
      minzoom: usHighwayConfig.minZoom || 7, 
      filter: usHighwayFilter, 
      layout: { 
        ...baseShieldLayout,
        "icon-image": usHighwayConfig.sprite,
        "icon-text-fit-padding": usHighwayConfig.textPadding || [2, 4, 2, 4],
        "text-size": buildTextSize(usHighwayConfig.textSize),
        "text-font": usHighwayConfig.textFont || theme.fonts.semibold || theme.fonts.regular,
      }, 
      paint: { 
        "text-color": usHighwayConfig.textColor,
      } 
    } as LayerSpecification);
  }
  
  // State highway shields
  if (stateHighwayConfig.enabled) {
    layers.push({ 
      id: "highway-shield-state", 
      type: "symbol", 
      source: "us_high", 
      "source-layer": "transportation_name", 
      minzoom: stateHighwayConfig.minZoom || 8, 
      filter: stateHighwayFilter, 
      layout: { 
        ...baseShieldLayout,
        "icon-image": stateHighwayConfig.sprite,
        "icon-text-fit-padding": stateHighwayConfig.textPadding || [2, 4, 2, 4],
        "text-size": buildTextSize(stateHighwayConfig.textSize),
        "text-font": stateHighwayConfig.textFont || theme.fonts.semibold || theme.fonts.regular,
      }, 
      paint: { 
        "text-color": stateHighwayConfig.textColor,
      } 
    } as LayerSpecification);
  }
  
  return layers;
}

