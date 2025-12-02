// Create a tooltip container
function createTooltip() {
    let tooltip = d3.select("body").select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", tooltipBg)
            .style("color", tooltipTextColor)
            .style("border-radius", "4px")
            .style("padding", "10px 14px")
            .style("font-size", "14px")
            .style("line-height", "1.4")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("max-width", "220px");
    }
    return tooltip;
}

function showTooltip(tooltip, html, event) {
    tooltip
        .html(html)
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 35}px`)
        .transition()
        .duration(200)
        .style("opacity", 1);
}

function hideTooltip(tooltip) {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 0);
}

// Attach tooltip to bar and line chart 
function attachTooltip(selection) {
    const tooltip = createTooltip();
    selection.on("mouseenter", (event, d) => {
        let el = d3.select(event.currentTarget);
        let htmlContent = "";

        if (el.classed("bar") || el.classed("dot")) {
            const count = el.attr("data-count") || d.count_conducted;
            const rate = el.attr("data-rate") || d.percent_positive;
            htmlContent = `Count: ${count}<br>Rate: ${rate}%`;
        }

        showTooltip(tooltip, htmlContent, event);
    })
    .on("mousemove", (event) => {
        tooltip.style("left", `${event.pageX + 12}px`)
               .style("top", `${event.pageY - 35}px`);
    })
    .on("mouseleave", () => hideTooltip(tooltip));
}

// Dumbbell chart dropdown interactivity
function initChart2Interaction(data) {
    const yearStartSelect = d3.select("#yearStart");
    const yearEndSelect = d3.select("#yearEnd");
    const years = Array.from({ length: 2024 - 2008 + 1 }, (_, i) => (2008 + i).toString());

    years.forEach(y => {
        yearStartSelect.append("option").attr("value", y).text(y);
        yearEndSelect.append("option").attr("value", y).text(y);
    });

    yearStartSelect.property("value", "2008");
    yearEndSelect.property("value", "2024");

    d3.select("#updateChart").on("click", () => {
        const start = yearStartSelect.property("value");
        const end = yearEndSelect.property("value");

        createDumbbellChart(data, start, end);
    });
}


'use strict';

let currentView = 'drugs';  
let resizeTimeout = null;

// Simple state container (expected to be filled by load-data.js)
if (typeof globalData === 'undefined') {
    window.globalData = {};
}

// Ensure DATA_PATHS exists (loaded from shared-constants.js)
if (typeof DATA_PATHS === 'undefined') {
    window.DATA_PATHS = {
        drugData: 'data/RQ2.csv',
        ageData: 'data/RQ3.csv'
    };
}

function getMainContent() {
    const el = document.getElementById('main-content');
    if (!el) {
        console.error('Missing required DOM element: #main-content');
    }
    return el;
}

function showLoading(message = 'Loading data...') {
    const mainContent = getMainContent();
    if (!mainContent) return;
    mainContent.innerHTML = `<div class="loading" role="status" aria-live="polite">${escapeHtml(message)}</div>`;
}

function showError(message) {
    const mainContent = getMainContent();
    if (!mainContent) {
        console.error('showError called but #main-content is missing. Message:', message);
        return;
    }
    mainContent.innerHTML = `<div class="error" role="alert">${escapeHtml(message)}</div>`;
}

function showMessage(message) {
    const mainContent = getMainContent();
    if (!mainContent) return;
    mainContent.innerHTML = `<div class="message">${escapeHtml(message)}</div>`;
}

function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function initializeDashboard() {
    showLoading();

    try {
        // loadAllData should be defined in load-data.js and fill window.globalData
        if (typeof loadAllData !== 'function') {
            const msg = 'Data loader not found. Make sure load-data.js is included and defines loadAllData().';
            console.error(msg);
            showError(msg);
            return;
        }

        // Attempt to load data
        try {
            await loadAllData();
            console.log('Data loaded:', {
                drugs: Array.isArray(globalData.drugs) ? globalData.drugs.length : 0,
                age: Array.isArray(globalData.age) ? globalData.age.length : 0
            });
        } catch (loadErr) {
            // Error while loading data (network, parsing, file missing, etc.)
            console.error('Error loading CSV data:', loadErr);
            showError('Failed to load data. Please check that your CSV files exist in the data/ folder and have the correct format. Expected columns:\n' +
                '- data/RQ2.csv → Drug_Type, Total_Detections\n' +
                '- data/RQ3.csv  → AGE_GROUP, Positive_Count');
            return;
        }

        // Show default view
        showView(currentView || 'drugs');
    } catch (err) {
        console.error('Initialization error:', err);
        showError('Initialization error. See console for details.');
    }
}

/**
 * showView - update navigation UI and render the selected visualization
 * @param {string} view - 'drugs' or 'age'
 */
function showView(view) {
    currentView = view;
    updateNavActiveState(view);

    // Clear prior error/message but don't destroy the DOM elements chart functions may expect.
    // Many chart functions create/replace their own inner nodes, so we simply ensure main-content exists.
    const mainContent = getMainContent();
    if (!mainContent) {
        showError('Main content container (#main-content) not found in the HTML.');
        return;
    }
    showMessage('Rendering chart...');

    try {
        switch (view) {
            case 'drugs':
            // Check main drug data
            if (!Array.isArray(globalData.drugs) || globalData.drugs.length === 0) {
                showError('Drug data not available. Please ensure data/positive_by_drugs.csv exists and contains columns: Drug_Type, Total_Detections');
                return;
            }
            if (typeof createDrugChart !== 'function') {
                showError('Chart renderer for drugs not found. Ensure createDrugChart() is defined and included.');
                console.error('Missing createDrugChart function.');
                return;
            }
            // Render main drug chart
            try {
                createDrugChart(globalData.drugs);
            } catch (renderErr) {
                console.error('Error while rendering drug chart:', renderErr);
                showError('An error occurred while rendering the drug chart. See console for details.');
            }

            // Render stacked bar chart (location by drug type)
            if (!Array.isArray(globalData.drugsByLocation) || globalData.drugsByLocation.length === 0) {
                console.warn('Drug location data not available. Skipping stacked bar chart.');
                break;
            }
            if (typeof drawStackedBarChart !== 'function') {
                console.warn('Stacked bar chart function not found. Skipping stacked bar chart.');
                break;
            }

            try {
                // Create container div inside #main-content
                const stackedContainer = document.createElement('div');
                stackedContainer.id = 'stackedbarchart';
                stackedContainer.classList.add('responsive-svg-container');
                getMainContent().appendChild(stackedContainer);

                drawStackedBarChart(globalData.drugsByLocation);
            } catch (err) {
                console.error('Error rendering stacked bar chart:', err);
            }

            break;


            case 'age':
                if (!Array.isArray(globalData.age) || globalData.age.length === 0) {
                    showError('Age data not available. Please ensure data/positive_by_age.csv exists and contains columns: AGE_GROUP, Positive_Count');
                    return;
                }
                if (typeof createAgeChart !== 'function') {
                    showError('Chart renderer for age groups not found. Ensure createAgeChart() is defined and included.');
                    console.error('Missing createAgeChart function.');
                    return;
                }
                try {
                    createAgeChart(globalData.age);
                } catch (renderErr) {
                    console.error('Error while rendering age chart:', renderErr);
                    showError('An error occurred while rendering the age chart. See console for details.');
                }
                break;

            default:
                showError('Unknown view requested: ' + escapeHtml(view));
                console.warn('Unknown view in showView:', view);
        }
    } catch (err) {
        console.error('Unexpected error in showView:', err);
        showError('Unexpected error when switching views. See console for details.');
    }
}

/**
 * Update nav buttons' active state
 */
function updateNavActiveState(view) {
    const buttons = document.querySelectorAll('.nav-btn');
    if (!buttons || buttons.length === 0) {
        // No nav buttons present — not fatal, but log it
        console.warn('No navigation buttons (.nav-btn) found in the page. Navigation will not be interactive.');
        return;
    }
    buttons.forEach(btn => {
        try {
            btn.classList.toggle('active', btn.dataset.view === view);
        } catch (e) {
            // ignore individual button errors
        }
    });
}

/**
 * Hook up listeners and start initialization on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Hook nav buttons if present
    const buttons = document.querySelectorAll('.nav-btn');
    if (buttons && buttons.length > 0) {
        buttons.forEach(btn => {
            btn.addEventListener('click', (ev) => {
                const view = btn.dataset.view;
                if (!view) {
                    console.warn('nav-btn has no data-view attribute', btn);
                    return;
                }
                if (view === currentView) return; // already active
                showView(view);
            });
        });
    } else {
        console.warn('No .nav-btn elements found on DOMContentLoaded.');
    }

    // Start the dashboard
    initializeDashboard();
});

/**
 * Handle window resize — debounce and attempt to re-render current view.
 * Many chart functions have their own responsive behavior; the fallback here is to call showView again.
 */
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!currentView) return;
        // If create*Chart functions support a 'resize' argument or redrawing, they'd handle it internally.
        // This will attempt to re-render the current view which is safe because showView guards data & renderer presence.
        showView(currentView);
    }, 250);
});







