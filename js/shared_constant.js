// shared_constant.js
const WIDTH = 900;
const HEIGHT = 500;
const MARGIN = { top: 50, right: 60, bottom: 70, left: 60 };
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

// Colors
const COLOR_BAR = "skyblue";
const COLOR_LINE = "red";
const COLOR_DUMBBELL_START = "#1f77b4";
const COLOR_DUMBBELL_END = "#ff7f0e";
const COLOR_LINE_CONNECT = "#999";

// Tooltip settings
const TOOLTIP_WIDTH = 100;
const TOOLTIP_HEIGHT = 40;




// --- Chart dimensions and margins ---
const margin = { top: 80, right: 30, bottom: 100, left: 80 };
const width = 800;
const height = 500;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// --- Colors and style ---
const colorScale = d3.scaleOrdinal();
const drugColorScheme = d3.schemeSet2;
const bodyBackgroundColor = "#ffffffff";  // light cream background
const tooltipBg = "rgba(255, 255, 255, 0.95)";
const tooltipBorder = "#ccc";
const tooltipTextColor = "#333";

// --- Tooltip dimensions ---
const tooltipWidth = 80;
const tooltipHeight = 35;
