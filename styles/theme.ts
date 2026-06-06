/**
 * My Custom Map Fixed Basemap Theme
 * 
 * This file contains ALL configurable values for the my-custom-map-fixed basemap.
 * 
 * FILE STRUCTURE:
 * ============================================================================
 * 1. BASEMAP STYLE CONFIGURATIONS
 *    - All basemap styling (colors, widths, opacities, fonts, etc.)
 *    - These can be copied/pasted between themes to reuse basemap styles
 * 
 * 2. DATA OVERLAY CONFIGURATIONS
 *    - Data overlay styling (places layer, etc.)
 *    - These are typically theme-specific and may vary per implementation
 * 
 * 3. COMPLETE THEME ASSEMBLY
 *    - Final theme object that combines all configurations
 * ============================================================================
 * 
 * To create a new basemap, copy the BASEMAP STYLE CONFIGURATIONS section
 * and adjust the values. Then add your own DATA OVERLAY CONFIGURATIONS.
 */

import { 
  fonts, 
  type Theme, 
  type ThemeColors, 
  type ThemeWidths, 
  type ThemeOpacities,
  type ThemePOIs,
  type ThemeSettings,
  type ThemeLabelFonts,
  type ThemePlaces,
  type ThemeWorldLowZoomLand,
} from "../shared/styles/index.js";

// ============================================================================
// BASEMAP STYLE CONFIGURATIONS
// ============================================================================
//
// This section contains all basemap styling configurations:
// - Settings, fonts, colors, widths, opacities
// - Basemap layers (roads, water, land, buildings, etc.)
// - Visual effects (hillshade, bathymetry, contours, etc.)
//
// These configurations can be copied/pasted between themes to reuse
// basemap styles. Simply copy everything from this section through
// the AEROWAY CONFIGURATION section.
//
// ============================================================================

// ============================================================================
// SETTINGS
// ============================================================================

export const myCustomMapFixedSettings: ThemeSettings = {
  /** Map projection type - "mercator" for flat map, "globe" for 3D globe */
  projection: "globe",
  
  /** Minimum zoom level - different for globe vs mercator */
  minZoom: {
    mercator: 0,  // Flat map can go to z0
    globe: 2,     // Globe needs higher min zoom for better appearance
  },
  /**
   * When true, road widths scale proportionally to real-world sizes at zoom 15+.
   * Roads will double in pixel width with each zoom level to match map scale.
   * This makes roads proportional to buildings at high zoom levels.
   * 
   * Set to true to enable, false to use fixed pixel widths.
   */
  realWorldScale: true,
  
  /**
   * The zoom level at which real-world scaling begins.
   * Below this zoom, roads use fixed pixel widths.
   */
  realWorldScaleMinZoom: 16,
  
  /**
   * Initial map view configuration.
   * Controls where the map is centered, the zoom level, camera tilt, and rotation when it first loads.
   */
  view: {
    /** Initial center point [longitude, latitude] */
    center: [-98.0, 39.0],
    /** Initial zoom level */
    zoom: 4.25,
    /** Camera tilt angle in degrees (0-60, default 0). 0 = straight down, higher = more tilted */
    pitch: 0,
    /** Rotation angle in degrees (0-360, default 0). 0 = north, 90 = east, 180 = south, 270 = west */
    bearing: 0,
  },
};

// ============================================================================
// LABEL FONTS
// ============================================================================

/**
 * Per-label-type font configuration.
 * 
 * Available fonts (from CDN at https://assets.storypath.studio/glyphs/):
 * 
 * Noto Sans (default):
 *   - "Noto Sans Regular"
 *   - "Noto Sans SemiBold"
 *   - "Noto Sans Italic"
 * 
 * Cormorant Garamond:
 *   - "Cormorant Garamond Regular"
 *   - "Cormorant Garamond SemiBold"
 *   - "Cormorant Garamond Italic"
 *   - "Cormorant Garamond Bold"
 *   - "Cormorant Garamond Bold Italic"
 * 
 * IM FELL English:
 *   - "IM FELL English Regular"
 *   - "IM FELL English Italic"
 *   - "IM FELL English SC Regular" (small caps)
 * 
 * Junicode:
 *   - "Junicode Regular"
 *   - "Junicode Bold"
 *   - "Junicode Italic"
 */
export const myCustomMapFixedLabelFonts: ThemeLabelFonts = {
  /** Default font for all labels (fallback when specific label fonts not set) */
  default: ["Noto Sans Regular"],
  
  /** Font for place labels (continents, countries, cities, etc.) */
  place: ["Noto Sans Regular"],
  
  /** Font for road labels */
  road: ["Noto Sans Regular"],
  
  /** Font for water labels (oceans, lakes, rivers) - uses italic by default */
  water: ["Noto Sans Italic"],
  
  /** Font for POI labels */
  poi: ["Noto Sans Regular"],
  
  /** Font for grid labels (latitude/longitude) */
  grid: ["Noto Sans Regular"],
};

// ============================================================================
// COLORS
// ============================================================================

export const myCustomMapFixedColors: ThemeColors = {
  // Cool charcoal — complements light-gray #f0f2f4 (keep label halos in sync)
  background: "#1a1e24",
  
  land: {
    wood: "#262b32",
    grass: "#323840",
    scrub: "#2f353d",
    cropland: "#353b44",
    farmland: "#353b44",
    rock: "#2a3038",
    sand: "#384049",
    wetland: "#282e36",
    default: "#2c323a",
  },
  
  landuse: {
    park: "#30363f",
    cemetery: "#333942",
    pitch: "#2d333c",
    stadium: "#2d333c",
    residential: "#363c46",
    college: "#323840",
    commercial: "#343a43",
    construction: "#2e343e",
    dam: "#282e36",
    farmland: "#353b44",
    grass: "#323840",
    hospital: "#333942",
    industrial: "#2e343e",
    military: "#2a3038",
    neighbourhood: "#363c46",
    quarry: "#282e36",
    quarter: "#363c46",
    railway: "#2e343e",
    retail: "#343a43",
    school: "#323840",
    suburb: "#363c46",
    theme_park: "#30363f",
    track: "#333942",
    university: "#323840",
    zoo: "#30363f",
    default: "#2c323a",
  },
  
  water: {
    fill: "#12161c",
    line: "#2a313b",
    labelColor: "#aeb6c2",
    labelHalo: "#1a1e24",
    ocean: "#12161c",
    sea: "#141920",
    lake: "#12161c",
    pond: "#10141a",
    river: "#0e1218",
    canal: "#0e1218",
    stream: "#0f1319",
    ditch: "#0c1016",
    drain: "#0c1016",
    bay: "#141920",
    gulf: "#141920",
    reservoir: "#12161c",
    default: "#12161c",
  },
  
  boundary: {
    country: "#7a8490",
    state: "#5a6370",
  },
  
  road: {
    motorway: "#6a7380",
    trunk: "#646d7a",
    primary: "#5e6774",
    secondary: "#585f6c",
    tertiary: "#525a66",
    residential: "#4c5460",
    service: "#464e59",
    parkingAisle: "#424a55",
    other: "#464e59",
    casing: "#0e1218",
    
    tunnel: {
      motorway: "#5e6673",
      trunk: "#5a626e",
      primary: "#565e6a",
      secondary: "#505764",
      tertiary: "#505764",
      residential: "#505764",
      service: "#4a515d",
      default: "#4a515d",
    },
    
    bridge: {
      motorway: "#6a7380",
      trunk: "#646d7a",
      primary: "#5e6774",
      secondary: "#585f6c",
      tertiary: "#525a66",
      residential: "#4c5460",
      default: "#4c5460",
      casing: "#0e1218",
    },
    
    tunnelCasing: "#1a2028",
  },
  
  path: "#3a424d",
  
  railway: "#3d4652",
  
  building: {
    fill: "#323945",
    outline: "#141920",
    short: "#323945",
    medium: "#363e4a",
    tall: "#3a4350",
    skyscraper: "#3e4754",
    supertall: "#424b59",
    megatall: "#464f5e",
    default: "#323945",
  },
  
  label: {
    place: {
      color: "#c8ced6",
      halo: "#1a1e24",
    },
    road: {
      major: { color: "#d0d6de", opacity: 0.9 },
      secondary: { color: "#b8bfc8", opacity: 0.85 },
      tertiary: { color: "#a0a8b3", opacity: 0.8 },
      other: { color: "#8e97a3", opacity: 0.75 },
      halo: "#1a1e24",
    },
    water: {
      color: "#aeb6c2",
      halo: "#1a1e24",
    },
    poi: {
      iconColor: "#aeb6c2",
      iconSize: 0.8,
      textColor: "#c8ced6",
      textHalo: "#1a1e24",
      textHaloWidth: 1.5,
    },
  },
};

// ============================================================================
// LINE WIDTHS (at different zoom levels)
// ============================================================================

export const myCustomMapFixedWidths: ThemeWidths = {
  // Boundary widths
  boundary: {
    country: { z0: 0.4, z6: 1.2, z10: 2.0, z15: 2.5 },
    state: { z0: 0.2, z6: 0.8, z10: 1.2, z15: 1.5 },
  },
  
  // Water line widths
  water: {
    line: { z0: 0.1, z6: 0.4, z10: 0.8, z15: 1.0 },
  },
  
  // Road widths by class
  road: {
    motorway: { z6: 1, z12: 3, z15: 10 },
    trunk: { z6: 0.8, z12: 2.75, z15: 10 },
    primary: { z6: 0.7, z12: 2, z15: 10 },
    secondary: { z6: 0.6, z12: 1.5, z15: 7.5 },
    tertiary: { z6: 0.5, z12: 1.5, z15: 6 },
    residential: { z6: 0.4, z12: 1, z15: 4 },
    service: { z6: 0.2, z12: 1, z15: 4 },
    default: { z6: 0.4, z12: 1, z15: 4 },
  },
  
  // Road casing widths (slightly larger than road - using same zoom stops)
  // Note: Casing currently uses fixed scaling, not real-world scaling
  roadCasing: {
    motorway: { z6: 1.5, z12: 4, z15: 11 },
    trunk: { z6: 1.2, z12: 3.5, z15: 11 },
    primary: { z6: 1.0, z12: 2.8, z15: 11 },
    secondary: { z6: 0.9, z12: 2.2, z15: 8.5 },
    tertiary: { z6: 0.8, z12: 2.2, z15: 7 },
    residential: { z6: 0.7, z12: 1.8, z15: 5 },
    service: { z6: 0.5, z12: 1.5, z15: 5 },
    default: { z6: 0.7, z12: 1.8, z15: 5 },
  },
  
  // Tunnel widths (legacy - kept for reference)
  tunnel: { z10: 0.4, z12: 1.0, z14: 1.6 },
  tunnelCasing: { z10: 0.5, z12: 1.2, z14: 2.0 },
  
  // Tunnel road class widths - COMMENTED OUT: tunnels inherit road widths by default
  // Uncomment to override with custom tunnel widths:
  // tunnelRoad: {
  //   motorway: { z6: 1, z12: 3, z15: 10 },
  //   trunk: { z6: 0.8, z12: 2.75, z15: 10 },
  //   primary: { z6: 0.7, z12: 2, z15: 10 },
  //   secondary: { z6: 0.6, z12: 1.5, z15: 7.5 },
  //   tertiary: { z6: 0.5, z12: 1.5, z15: 6 },
  //   residential: { z6: 0.4, z12: 1, z15: 4 },
  //   service: { z6: 0.2, z12: 1, z15: 4 },
  //   default: { z6: 0.4, z12: 1, z15: 4 },
  // },
  
  // Bridge widths (legacy - kept for reference)
  bridge: { z10: 0.5, z12: 1.1, z14: 1.8 },
  bridgeCasing: { z10: 0.6, z12: 1.3, z14: 2.2 },
  
  // Bridge road class widths - COMMENTED OUT: bridges inherit road widths by default
  // Uncomment to override with custom bridge widths:
  // bridgeRoad: {
  //   motorway: { z6: 2, z12: 6, z15: 20 },
  //   trunk: { z6: 1.6, z12: 5.5, z15: 20 },
  //   primary: { z6: 1.4, z12: 4, z15: 20 },
  //   secondary: { z6: 1.2, z12: 3, z15: 15 },
  //   tertiary: { z6: 1, z12: 3, z15: 12 },
  //   residential: { z6: 0.8, z12: 2, z15: 8 },
  //   service: { z6: 0.4, z12: 2, z15: 8 },
  //   default: { z6: 0.8, z12: 2, z15: 8 },
  // },
  
  // Path widths
  path: { z12: 0.2, z14: 0.6 },
  
  // Railway widths
  railway: { z10: 0.3, z14: 0.8 },
};

// ============================================================================
// OPACITIES
// ============================================================================

export const myCustomMapFixedOpacities: ThemeOpacities = {
  landcover: 0.6,
  landuse: 0.6,
  building: 0.9,
  
  boundary: {
    country: { z0: 0.3, z3: 0.3, z6: 0.8, z10: 0.85 },
    state: 0.65,
    maritime: 0,  // Hidden by default
  },
  
  tunnel: 0.7,
  
  label: {
    place: 0.75,
    water: 0.9,
    waterway: 0.85,
  },
};

// ============================================================================
// HIGHWAY SHIELDS
// ============================================================================

// To build shield icons and styles, run: npx tsx scripts/build-shields.ts && npm run build:styles

export const myCustomMapFixedShields = {
  /** Whether to show highway shields */
  enabled: true,
  
  /** Global minimum zoom for all shields */
  minZoom: 6,
  
  /** Interstate shields (I-70, I-95, etc.) */
  interstate: {
    enabled: true,
    sprite: "shield-interstate-custom",
    textColor: "#e8eaed",
    minZoom: 6,
    textPadding: [5, 5, 5, 5] as [number, number, number, number],
    textSize: [6, 9, 14, 13] as [number, number, number, number],
    textFont: ["Noto Sans SemiBold"],
    upperBackground: "#454d5a",
    lowerBackground: "#525a66",
    strokeColor: "#454d5a",
    strokeWidth: 2,
  },
  
  /** US Highway shields (US-1, US-66, etc.) */
  usHighway: {
    enabled: true,
    sprite: "shield-ushighway-custom",
    textColor: "#e8eaed",
    minZoom: 7,
    textPadding: [5, 5, 5, 5] as [number, number, number, number],
    textSize: [6, 9, 14, 13] as [number, number, number, number],
    textFont: ["Noto Sans SemiBold"],
    background: "#353c47",
    strokeColor: "#8e97a3",
    strokeWidth: 2.5,
  },
  
  /** State Highway shields */
  stateHighway: {
    enabled: true,
    sprite: "shield-state-custom",
    textColor: "#e8eaed",
    minZoom: 8,
    textPadding: [4, 4, 4, 4] as [number, number, number, number],
    textSize: [8, 8, 14, 12] as [number, number, number, number],
    textFont: ["Noto Sans SemiBold"],
    background: "#353c47",
    strokeColor: "#7a8490",
    strokeWidth: 1,
  },
};

// ============================================================================
// STARFIELD CONFIGURATION
// ============================================================================

export const myCustomMapFixedStarfield = {
  /** Lighter neutral "space" so stars and rim don't merge with the globe */
  containerBackground: "#3e4754",
  glowColors: {
    inner: "rgba(152, 152, 152, 0.55)",
    middle: "rgba(112, 112, 112, 0.42)",
    outer: "rgba(78, 78, 78, 0.3)",
    fade: "rgba(62, 71, 84, 0)",
  },
  starCount: 200,
  glowIntensity: 0.5,
  glowSizeMultiplier: 1.2,
  glowBlurMultiplier: 0.12,
};

// ============================================================================
// POI CONFIGURATION
// ============================================================================

export const myCustomMapFixedPOIs: ThemePOIs = {
  /** Whether to show POIs at all */
  enabled: true,
  
  /** Global minimum zoom for all POIs */
  minZoom: 12,
  
  /** Airport POI settings */
  airport: {
    enabled: true,
    minZoom: 12,
  },
  
  /** Airfield POI settings */
  airfield: {
    enabled: true,
    minZoom: 12,
  },
  
  /** Hospital POI settings */
  hospital: {
    enabled: true,
    minZoom: 12,
  },
  
  /** Museum POI settings */
  museum: {
    enabled: true,
    minZoom: 12,
  },
  
  /** Zoo POI settings */
  zoo: {
    enabled: true,
    minZoom: 12,
  },
  
  /** Stadium POI settings */
  stadium: {
    enabled: true,
    minZoom: 12,
  },
  
  /** Park POI settings */
  park: {
    enabled: true,
    minZoom: 12,
  },
  
  /** Railway station POI settings */
  rail: {
    enabled: true,
    minZoom: 12,
  },
  
  /** School/College/University POI settings */
  school: {
    enabled: true,
    minZoom: 12,
  },
};

// ============================================================================
// BATHYMETRY CONFIGURATION
// ============================================================================

export const myCustomMapFixedBathymetry = {
  /** Whether to show bathymetry at all */
  enabled: true,
  
  /** Minimum zoom level to show bathymetry */
  minZoom: 0,
  
  /** Maximum zoom level to show bathymetry (fades out after this) */
  maxZoom: 7,
  
  /** Opacity range */
  opacity: {
    min: 0.7,  // Opacity at minZoom
    max: 0.9,  // Opacity at maxZoom
  },
  
  /** Custom colors for each depth level */
  colors: {
    shallow: "#161b22",
    shelf: "#141920",
    slope: "#12171e",
    deep1: "#10151c",
    deep2: "#0e1318",
    abyss: "#0c1116",
    trench: "#0a0f14",
  },
  
  /** Custom opacity for each depth level */
  depthOpacities: {
    shallow: 0.3,    // 0m - shallowest (most transparent)
    shelf: 0.35,     // 200m
    slope: 0.45,     // 1000m
    deep1: 0.55,     // 2000m
    deep2: 0.7,     // 4000m
    abyss: 0.85,     // 6000m
    trench: 1,    // 10000m - deepest (most opaque)
  },
};

// ============================================================================
// CONTOURS CONFIGURATION
// ============================================================================

export const myCustomMapFixedContours = {
  /** Whether to show contours at all */
  enabled: false,
  
  /** Minimum zoom level to show contours */
  minZoom: 4,
  
  /** Maximum zoom level to show contours (fades out after this) */
  maxZoom: 10,
  
  /** Major contour line styling (800m intervals) */
  major: {
    color: "#5c6570",
    width: {
      min: 0.5,  // Width at minZoom
      max: 1.5,  // Width at maxZoom
    },
    opacity: 0.6,
    minZoom: 4,  // Major contours start at z4
  },
  
  /** Minor contour line styling (350m intervals) */
  minor: {
    color: "#4a525e",
    width: {
      min: 0.25,  // Width at minZoom
      max: 0.75,  // Width at maxZoom
    },
    opacity: 0.4,
    minZoom: 6,  // Minor contours start at z6
  },
};

// ============================================================================
// ICE CONFIGURATION
// ============================================================================

export const myCustomMapFixedIce = {
  /** Whether to show ice at all */
  enabled: false,
  
  /** Minimum zoom level to show ice */
  minZoom: 0,
  
  /** Maximum zoom level to show ice (fades out after this) */
  maxZoom: 6,
  
  /** Base opacity range */
  opacity: {
    min: 0.7,  // Opacity at minZoom
    max: 0.9,  // Opacity at maxZoom
  },
  
  /** Glaciated areas (glaciers, ice caps) */
  glaciated: {
    color: "#e8f4f8",  // Light blue-white
    opacity: 0.9,
  },
  
  /** Ice shelves */
  iceShelves: {
    color: "#d0e8f0",  // Slightly darker blue-white
    opacity: 0.9,
  },
  
  /** Ice edge (outline) - set to null or enabled: false to disable */
  iceEdge: {
    enabled: false,  // Outline of ice shelves (Antarctica only)
    color: "#a0c8d8",  // Medium blue-gray (matches original design)
    width: 1.0,  // Increased from 0.5 for better visibility
    opacity: 0.8,  // Increased from 0.6 for better visibility
  },
};

// ============================================================================
// HILLSHADE CONFIGURATION
// ============================================================================

export const myCustomMapFixedHillshade = {
  /** Whether to show hillshade at all */
  enabled: true,
  
  /** Minimum zoom level to show hillshade (TileJSON minzoom is 1; z0 has no tiles) */
  minZoom: 1,
  
  /** Maximum zoom level to show hillshade (fades out after this) */
  maxZoom: 12,

  /** Native tiles for world_mtn_hillshade only exist through z6 (see TileJSON maxzoom). */
  rasterSourceMaxZoom: 6,
  
  opacity: 0.3,
  
  /** Illumination direction (0-360 degrees, where 0 is north, 90 is east) */
  illuminationDirection: 335,  // Northwest (typical for natural lighting)
  
  /** Illumination anchor - "map" (fixed to map) or "viewport" (fixed to viewport) */
  illuminationAnchor: "viewport" as const,
  
  /** Exaggeration factor for terrain relief (0.0 to 1.0, higher = more dramatic) */
  exaggeration: 0.28,
  
  shadowColor: "#141920",
  
  highlightColor: "#2a3038",
  
  accentColor: "#1c2026",
};

// ============================================================================
// GRID CONFIGURATION
// ============================================================================

export const myCustomMapFixedGrid = {
  /** Whether to show grid lines at all */
  enabled: false,
  
  /** Minimum zoom level to show grid lines */
  minZoom: 0,
  
  /** Maximum zoom level to show grid lines (fades out after this) */
  maxZoom: 10,
  
  /** Latitude lines (horizontal) styling */
  latitude: {
    color: "#5c6570",
    width: {
      min: 1.0,  // Width at minZoom (increased for visibility)
      max: 1.5,  // Width at maxZoom
    },
    opacity: 0.6,  // Increased opacity for better visibility
    interval: 10,  // Lines every 10 degrees
    label: {
      enabled: false,  // Enable labels for latitude lines
      color: "#aeb6c2",
      size: {
        min: 10,  // Size at minZoom
        max: 12,  // Size at maxZoom
      },
      opacity: 0.8,
      minZoom: 2,  // Show labels starting at zoom 2
    },
  },
  
  /** Longitude lines (vertical) styling */
  longitude: {
    color: "#5c6570",
    width: {
      min: 1.0,  // Width at minZoom (increased for visibility)
      max: 1.5,  // Width at maxZoom
    },
    opacity: 0.6,  // Increased opacity for better visibility
    interval: 10,  // Lines every 10 degrees
    label: {
      enabled: false,
      color: "#aeb6c2",
      size: {
        min: 10,  // Size at minZoom
        max: 12,  // Size at maxZoom
      },
      opacity: 0.8,
      minZoom: 2,  // Show labels starting at zoom 2
    },
  },
};

// ============================================================================
// BOUNDARY CONFIGURATION
// ============================================================================

export const myCustomMapFixedBoundary = {
  /** Whether to show country boundaries */
  country: true,  // Set to false to hide country boundaries
  /** Whether to show state boundaries */
  state: true,  // Set to false to hide state boundaries
  /** Whether to show maritime boundaries */
  maritime: false,  // Set to false to hide maritime boundaries
  /** Whether to hide boundaries over water areas (only show on land) */
  hideOverWater: true,  // Set to true to hide boundaries over water
};

// ============================================================================
// BUILDING CONFIGURATION
// ============================================================================

export const myCustomMapFixedBuildings = {
  /** Whether to show buildings at all */
  enabled: true,  // Set to false to hide all buildings
  /** Minimum zoom level to show buildings */
  minZoom: 13,  // Buildings start appearing at zoom 13 (PMTiles data availability)
  /** Maximum zoom level to show buildings (fades out after this) */
  maxZoom: undefined,  // No maximum zoom (buildings show at all zoom levels)
  /** Zoom level where height-based colors start (before this, uses default color) */
  heightColorsMinZoom: 14,  // Height-based colors start at zoom 14 (height data available from z14+), default color before that
};

// ============================================================================
// LAND CONFIGURATION
// ============================================================================

export const myCustomMapFixedLand = {
  /** 
   * Whether to make all landcover layers transparent (sets opacity to 0, layers still exist but are invisible).
   * Uses transparency instead of removing layers to allow runtime toggling via map.setPaintProperty().
   * Note: Removing layers would be more efficient (no tiles loaded, no processing), but transparency
   * enables dynamic control without rebuilding the style.
   */
  transparent: false,  // Set to true to make all landcover transparent (opacity 0)
  /** Whether to use a single override color for all landcover types */
  useOverrideColor: false,  // Set to true to use overrideColor for all landcover types
  /** Override color to use for all landcover types when useOverrideColor is true */
  overrideColor: "#2c323a",
};

// ============================================================================
// LANDUSE CONFIGURATION
// ============================================================================

export const myCustomMapFixedLanduse = {
  /** 
   * Whether to make all landuse layers transparent (sets opacity to 0, layers still exist but are invisible).
   * Uses transparency instead of removing layers to allow runtime toggling via map.setPaintProperty().
   * Note: Removing layers would be more efficient (no tiles loaded, no processing), but transparency
   * enables dynamic control without rebuilding the style.
   */
  transparent: false,  // Set to true to make all landuse transparent (opacity 0)
  /** Whether to use a single override color for all landuse types */
  useOverrideColor: false,  // Set to true to use overrideColor for all landuse types
  /** Override color to use for all landuse types when useOverrideColor is true */
  overrideColor: "#2c323a",
};

// ============================================================================
// WATER CONFIGURATION
// ============================================================================

export const myCustomMapFixedWater = {
  /** 
   * Whether to make all water fill layers transparent (sets opacity to 0, layers still exist but are invisible).
   * Uses transparency instead of removing layers to allow runtime toggling via map.setPaintProperty().
   * Note: Removing layers would be more efficient (no tiles loaded, no processing), but transparency
   * enables dynamic control without rebuilding the style.
   */
  transparent: false,  // Set to true to make all water fills transparent (opacity 0)
  /** 
   * Whether to make all waterway (line) layers transparent (sets opacity to 0, layers still exist but are invisible).
   * Uses transparency instead of removing layers to allow runtime toggling via map.setPaintProperty().
   * Note: Removing layers would be more efficient (no tiles loaded, no processing), but transparency
   * enables dynamic control without rebuilding the style.
   */
  transparentWaterway: false,  // Set to true to make all waterways transparent (opacity 0)
  /** Whether to use a single override color for all water fill types */
  useOverrideColor: false,  // Set to true to use overrideColor for all water fill types
  /** Override color to use for all water fill types when useOverrideColor is true */
  overrideColor: "#12161c",
  /** Whether to use a single override color for all waterway (line) types */
  useOverrideColorWaterway: false,  // Set to true to use overrideColorWaterway for all waterway types
  /** Override color to use for all waterway types when useOverrideColorWaterway is true */
  overrideColorWaterway: "#2a313b",
};

// ============================================================================
// AEROWAY CONFIGURATION
// ============================================================================

export const myCustomMapFixedAeroway = {
  /** Whether to show aeroway features at all */
  enabled: false,
  
  /** Runway line styling */
  runway: {
    color: "#5c6570",
    width: 0.5,              // Thin lines
    opacity: 0.8,
    majorLength: 2500,       // Minimum length (meters) for major runways shown at z6-7
  },
  
  /** Apron polygon styling */
  apron: {
    fillColor: "#4a525e",
    fillOpacity: 0.3,
    outlineColor: "#6a7380",
    outlineWidth: 0.3,        // Thin outline
  },
  
  /** Taxiway line styling */
  taxiway: {
    color: "#6a7380",
    width: 0.4,              // Slightly thinner than runways
    opacity: 0.7,
  },
  
  /** Helipad point styling */
  helipad: {
    fillColor: "#6a7380",
    fillOpacity: 0.6,
    outlineColor: "#7a8490",
    outlineWidth: 0.3,
    size: 4,                 // Circle radius in pixels
  },
  
  /** Airport label styling */
  label: {
    color: "#c8ced6",
    haloColor: "#1a1e24",
    haloWidth: 0,
    opacity: 0.9,
    majorSize: { min: 10, max: 12 },      // Font size for major airports (z8-9)
    detailedSize: { min: 10, max: 12 },   // Font size for detailed labels (z13+)
  },
};

// ============================================================================
// WORLD LOW-ZOOM LAND (z0–~5.5)
// ============================================================================

/**
 * Low-zoom globe: lighter `background` where tiles have no landcover polygons, plus
 * +56 RGB landcover/landuse vs base so land reads clearly vs water (#12161c) through ~z5.5.
 */
export const myCustomMapFixedWorldLowZoomLand: ThemeWorldLowZoomLand = {
  blendEndZoom: 5.5,
  /** Solid base under sparse landcover (see MAP_ELEMENTS.md); oceans still use water fills */
  backgroundAtZ0: "#2e3644",
  landcover: {
    wood: "#5e636a",
    grass: "#6a7078",
    scrub: "#676d75",
    cropland: "#6d737c",
    farmland: "#6d737c",
    rock: "#626870",
    sand: "#707881",
    wetland: "#60666e",
    default: "#646a72",
  },
  landuse: {
    park: "#686e77",
    cemetery: "#6b717a",
    pitch: "#656b74",
    stadium: "#656b74",
    residential: "#6e747e",
    college: "#6a7078",
    commercial: "#6c727b",
    construction: "#666c76",
    dam: "#60666e",
    farmland: "#6d737c",
    grass: "#6a7078",
    hospital: "#6b717a",
    industrial: "#666c76",
    military: "#626870",
    neighbourhood: "#6e747e",
    quarry: "#60666e",
    quarter: "#6e747e",
    railway: "#666c76",
    retail: "#6c727b",
    school: "#6a7078",
    suburb: "#6e747e",
    theme_park: "#686e77",
    track: "#6b717a",
    university: "#6a7078",
    zoo: "#686e77",
    default: "#646a72",
  },
};

// ============================================================================
// END OF BASEMAP STYLE CONFIGURATIONS
// ============================================================================
//
// Everything above this line is basemap styling and can be copied
// between themes. Everything below is data overlays and theme assembly.
//
// ============================================================================

// ============================================================================
// DATA OVERLAY CONFIGURATIONS
// ============================================================================
//
// This section contains data overlay styling configurations:
// - Places layer (city boundaries, demographic data overlays, etc.)
//
// These configurations are typically theme-specific and may vary
// per implementation. They overlay on top of the basemap.
//
// ============================================================================

// ============================================================================
// PLACES CONFIGURATION
// ============================================================================

export const myCustomMapFixedPlaces: ThemePlaces = {
  /** Whether to show places layer at all */
  enabled: true,
  /** Toggle low-zoom points/dots */
  pointsEnabled: true,
  /** Toggle polygons (fills/lines) */
  polygonsEnabled: true,
  /** Minimum zoom level to show ploygon places */
  minZoom: 5,
  /** Low-zoom places point styling (dots/clusters) */
  points: {
    /** Radius for non-cluster points; named zoom stops { z0: 1, z5: 1, z6_5: 0 } */
    radius: { z0: .25, z3: 1, z6_5: 3 },
    /** Stroke width for points/clusters; named zoom stops { z0: 1, z5: 1, z6_5: 0 } */
    strokeWidth: { z0: 0, z6_5: 0 },
    /** Stroke color for points/clusters */
    strokeColor: "#111822",
    /** Opacity stops for point crossfade { z0: 1, z5: 1, z6_5: 0 } */
    opacity: { z0: 1, z5: 1, z6_5: 0 },
  },
  /** Polygon styling for place boundaries */
  fill: {
    color: "#6a7588",  // Medium gray to match theme (fallback when density data unavailable)
    opacity: 1,      // Base fill opacity (0.0-1.0). Adjust to control transparency.
                        // This is the base opacity; population-based styling can add up to 0.2 more.
                        // To make places more opaque, increase this value (e.g., 0.3, 0.5, or 1.0).
  },
  /** Outline styling for place boundaries */
  outline: {
    color: "#8a9598",  // Lighter gray for borders (fallback when density data unavailable)
    width: { z5: 0.5, z10: 1.0, z15: 1.5 },
    opacity: 0.6,      // Outline opacity (0.0-1.0). Adjust to control boundary line visibility.
                        // To make boundaries more visible, increase (e.g., 0.8 or 1.0).
                        // To make boundaries more subtle, decrease (e.g., 0.3 or 0.4).
  },
  /** Interactivity configuration */
  interactivity: {
    enabled: true,
    autoDetectStates: true,
    popupMaxHeight: "400px",
  },
  /** 
   * Whether to render places boundaries above city/place labels
   * - true (default): Places boundaries render on top of city labels
   * - false: Places boundaries render below city labels (labels visible on top)
   */
  renderAboveLabels: false,
  /** Population density color configuration */
  // { threshold: 100, fillColor: "#efc47e", outlineColor: "#c9a366" } with border color
  // { threshold: 100, fillColor: "#efc47e"} with default border color
  densityColors: {
    defaultFillColor: "#ecda9a",      // Default for < 100
    defaultOutlineColor: "#c4b87a",  // Darker version of default fill
    ranges: [
      { threshold: 100, fillColor: "#f6e6b8"},
      { threshold: 300, fillColor: "#f3d28f"},
      { threshold: 1000, fillColor: "#f0bd6b"},
      { threshold: 2000, fillColor: "#f2a14a"},
      { threshold: 3000, fillColor: "#f08a2a"},
      { threshold: 4000, fillColor: "#ef6800"},
      { threshold: 5000, fillColor: "#f04f1a"},
      { threshold: 7500, fillColor: "#f03a34"},
      { threshold: 10000, fillColor: "#ee2b4e"},
      { threshold: 15000, fillColor: "#e21f64"},
      { threshold: 25000, fillColor: "#c81b78"},
    ],
  },
};

// ============================================================================
// END OF DATA OVERLAY CONFIGURATIONS
// ============================================================================

// ============================================================================
// COMPLETE THEME ASSEMBLY
// ============================================================================
//
// This section combines all basemap and data overlay configurations
// into the final theme object.
//
// ============================================================================

export const myCustomMapFixedTheme: Theme = {
  name: "My Custom Map Fixed Basemap",
  fonts,
  labelFonts: myCustomMapFixedLabelFonts,
  colors: myCustomMapFixedColors,
  widths: myCustomMapFixedWidths,
  opacities: myCustomMapFixedOpacities,
  settings: myCustomMapFixedSettings,
  shields: myCustomMapFixedShields,
  pois: myCustomMapFixedPOIs,
  bathymetry: myCustomMapFixedBathymetry,
  contours: myCustomMapFixedContours,
  ice: myCustomMapFixedIce,
  hillshade: myCustomMapFixedHillshade,
  grid: myCustomMapFixedGrid,
  boundary: myCustomMapFixedBoundary,
  buildings: myCustomMapFixedBuildings,
  land: myCustomMapFixedLand,
  landuse: myCustomMapFixedLanduse,
  water: myCustomMapFixedWater,
  aeroway: myCustomMapFixedAeroway,
  places: myCustomMapFixedPlaces,
  starfield: myCustomMapFixedStarfield,
  worldLowZoomLand: myCustomMapFixedWorldLowZoomLand,
};
