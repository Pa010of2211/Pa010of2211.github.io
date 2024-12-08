function calculateRanks(data) {
    const columns = Object.keys(data[0]); // Get column names

    // Process each column for ranking
    columns.forEach(column => {
        // Extract values for the column
        const values = data.map(row => +row[column]); // Convert to numbers

        // Create a sorted array of unique values (descending)
        const sortedValues = [...new Set(values)].sort((a, b) => a - b);

        // Map value to rank (descending)
        const valueToRank = {};
        let rank = 1;
        sortedValues.forEach((value, index) => {
            valueToRank[value] = rank; // Assign current rank
            rank += data.filter(row => +row[column] === value).length; // Increment by count of ties
        });

        // Store ranks for this column
        data.forEach(row => {
            row[`${column}_rank`] = valueToRank[+row[column]];
        });
    });

    return data;
}