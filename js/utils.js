// Adds a comma for every thousands, e.g., converts 123456 to "123,456"
let formatAsThousands = d3.format(",")

function formatAsDays(days) {
    const hours = days * 24;
    const minutes = hours * 60;
    const xDays = Math.floor(days);
    const xHours = Math.floor(hours % 24);
    const xMinutes = Math.floor(minutes % 60);
    return `${xDays} days, ${xHours} hours, and ${xMinutes} minutes`;
}


/**
 * https://dev.to/jorik/country-code-to-flag-emoji-a21
 * 
 * @param {*} countryCode 
 * @returns 
 */
function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}