/**
 * Animates a counter from 0 to an end value.
 * 
 * @param {*} selector  The selector of the element to animate
 * @param {*} endValue  The end value
 * @param {*} duration  The duration of the animation in milliseconds
 */
function animateCounter(selector, endValue, duration = 1000) {
    d3.selectAll(selector)
        .transition()
        .tween("text", function () {
            let node = this;
            const interpolator = d3.interpolateNumber(0, endValue);
            return function (t) {
                d3.select(node)
                    .text(Math.round(interpolator(t)).toLocaleString("en-US"))
            };
        })
        .duration(duration);
}

// URL of the default image to use when an image is not found
const DEFAULT_IMG_URL = "data/graph3_map/no_picture_mal.png";

/**
 * Adds a comma for every thousands, e.g., converts "123456" to "123,456"
 */
let formatAsThousands = d3.format(",")

function formatAsDays(days) {
    const hours = days * 24;
    const minutes = hours * 60;
    const xDays = Math.floor(days);
    const xHours = Math.floor(hours % 24);
    const xMinutes = Math.floor(minutes % 60);

    return [xDays, xHours, xMinutes];
}

/**
 * Returns the flag emoji string for a given country.
 * Adapted from https://dev.to/jorik/country-code-to-flag-emoji-a21.
 * 
 * @param {*} countryCode  The country code
 * @returns  The flag emoji
 */
function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}