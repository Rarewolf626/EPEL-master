// ============================================= Home =============================================

/**
 * 
 * @param {*} countData 
 */
function createCountryRankings(countData) {
    let rankTableBody = d3.select("#rankTable").select("tbody");

    let rankedCountries = countData.sort(function (a, b) {
        return parseInt(b.num_users) - parseInt(a.num_users);
    }).slice(0, 10);

    for (let i = 0; i < rankedCountries.length; i++) {
        /* Append a new element             
            <tr>
                <td>i+1</td>
                <td>top10Data[i].country</td>
                <td>top10Data[i].num_users</td>
            </tr>
        */
        let tr = rankTableBody.append("tr")
        tr.append("td").text(i + 1)
        tr.append("td").text(rankedCountries[i].country)
        tr.append("td").text(formatAsThousands(rankedCountries[i].num_users))
    }
}

// ============================================= Country =============================================

/**
 * 
 * @param {*} d 
 * @param {*} genderData 
 * @param {*} ageData 
 * @param {*} daysData 
 * @returns 
 */
function showCountryInfo(d, genderData, ageData, daysData) {
    // Switch to the country tab
    countryTab.show()

    let engName = d.properties.admin;
    let japName = d.properties.name_ja

    /* Country general information */
    // Country name (english and japanese)
    d3.select("#countryName")
        .text(engName)
        .append("span")
        .text(" (" + japName + ")")
        .style("font-size", "0.75em");

    // Country's number of users
    let numUsers = d.properties.value;
    d3.select("#numUsers").text(numUsers ? formatAsThousands(numUsers) + " otakus" : "No otakus here :(");

    // Country flag
    createFlag(d);

    /* Country stats */
    // Top animes

    // Top studios

    // Gender balance
    createGenderChart(genderData, engName);

    // Age distribution
    ageChart = createAgeChart(ageData, engName);
    // Resize the width and height of the chart
    // ageChart.attr("width", "100%")

    // Mean number of days spent watching anime
    // Find the corresponding country in the daysData
    let countryDays = daysData.find(d => d.country == engName);
    if (!countryDays) {
        d3.select("#country-num-days").text("No data available");
        return;
    }
    let numDays = countryDays.num_days_spent_watching_mean
    let numDaysFormat = formatAsDays(numDays)
    d3.select("#country-num-days").text("On average, an otaku has spent " + numDaysFormat + " watching animes (ranked #??)");
}

/**
 * 
 * @param {*} d 
 */
function createFlag(d) {
    let flag = d3.select("#country-flag")
        .attr("src", d.properties.flag_path)
        .attr("alt", d.properties.admin)
        .attr("title", d.properties.admin)
        .style("display", "block")

    // Define a maximum width and height for the flag
    let flagMaxWidth = 150;
    let flagMaxHeight = 100;
    // Resize the flag if it is too big
    flag.on("load", function () {
        let width = this.width;
        let height = this.height;
        if (width > flagMaxWidth) {
            console.log("width > flagMaxWidth")
            this.width = flagMaxWidth;
            // this.height = height * flagMaxWidth / width;
            console.log(this.width, this.height)
        }
        if (height > flagMaxHeight) {
            console.log("height > flagMaxHeight")
            this.height = flagMaxHeight;
            // this.width = width * flagMaxHeight / height;
            console.log(this.width, this.height)
        }
    })
}