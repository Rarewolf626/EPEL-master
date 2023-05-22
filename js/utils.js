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
