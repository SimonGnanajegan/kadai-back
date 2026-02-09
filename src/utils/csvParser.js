/**
 * Simple CSV Parser
 * Parses CSV string into an array of objects.
 * Handles quoted fields and commas within quotes.
 */
exports.parseCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = parseLine(lines[0]);
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i];
        if (!currentLine) continue;

        const values = parseLine(currentLine);

        // Skip if empty or mismatch
        if (values.length === 0) continue;

        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            const header = headers[j].trim();
            let value = values[j] !== undefined ? values[j].trim() : '';

            // Attempt to parse numbers or booleans if possible? 
            // Better to keep as string and let Mongoose cast, OR do simple casting.
            // Mongoose handles casting usually.

            obj[header] = value;
        }
        result.push(obj);
    }
    return result;
};

// Helper to parse a single CSV line handling quotes
const parseLine = (text) => {
    const result = [];
    let start = 0;
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            // Found a comma separator
            let value = text.substring(start, i);
            value = cleanValue(value);
            result.push(value);
            start = i + 1;
        }
    }

    // Last field
    let lastValue = text.substring(start);
    lastValue = cleanValue(lastValue);
    result.push(lastValue);

    return result;
};

const cleanValue = (val) => {
    val = val.trim();
    if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
        // Unescape double quotes if any (standard CSV uses "" for ")
        val = val.replace(/""/g, '"');
    }
    return val;
};
