// Chart dimensions and margins
const width = 1100;   
const height = 700;
const margin = { top: 100, right: 80, bottom: 120, left: 140 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// Colors
const colorBar = "skyblue";
const colorLine = "red";
const colorDumbbellStart = "#1f77b4";
const colorDumbbellEnd = "#ff7f0e";
const colorLineConnect = "#999";

// Tooltip settings
const tooltipBg = "#222";
const tooltipTextColor = "#fff";
const tooltipWidth = 100;
const tooltipHeight = 40;


// // --- Colors and style ---
const colorScale = d3.scaleOrdinal();
const drugColorScheme = d3.schemeSet2;
const bodyBackgroundColor = "#ffffffff"; 
const tooltipBorder = "#ccc";



const CONFIG = {
    animationDuration: 800,
    animationDelay: 100
};

const COLOR_SCHEMES = {
    drugs:d3.schemeSet2,
    age: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#43e97b', '#feca57', '#ff6b6b'],
    default: ['#667eea', '#764ba2', '#f093fb', '#f5576c']
};

const DATA_PATHS = {
    drugData: 'data/RQ2.csv',
    ageData: 'data/RQ3.csv'
};

// Global data storage
let globalData = {
    drugs: null,
    age: null
};

