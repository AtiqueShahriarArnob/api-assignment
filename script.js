const API_KEY = "c0bc208f3bc16cd9cd9ae0d3be0bfb3f"; 

function searchCountry() {
    const query = document.getElementById("searchInput").value.trim();
    const displayArea = document.getElementById("displayArea");

    if (!query) {
        alert("Please enter a country name.");
        return;
    }

    displayArea.innerHTML = "<p>Loading country data...</p>";
    const url = `https://restcountries.com/v3.1/name/${query}`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Country not found");
            return res.json();
        })
        .then(data => showCountries(data))
        .catch(err => {
            displayArea.innerHTML = "";
            alert("Country not found or error fetching data.");
        });
}

function showCountries(countries) {
    const displayArea = document.getElementById("displayArea");
    displayArea.innerHTML = "";

    countries.forEach(country => {
        const div = document.createElement("div");
        div.className = "country-card";

        const capital = country.capital ? country.capital[0] : "Not available";
        const population = country.population ? country.population.toLocaleString() : "Not available";

        div.innerHTML = `
            <img src="${country.flags.svg}" alt="Flag of ${country.name.common}">
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${capital}</p>
            <p><strong>Population:</strong> ${population}</p>
            <button class="more-btn" onclick="getWeather('${capital}', this)">More Details</button>
            <div class="weather-data"></div>
        `;

        displayArea.appendChild(div);
    })
}

function getWeather(capital, btn) {
    if (capital === "Not available") {
        alert("Weather data not available for this country.");
        return;
    }

    const weatherDiv = btn.nextElementSibling;
    weatherDiv.innerHTML = "<p>Loading weather data...</p>";

    const countryCard = btn.closest(".country-card");
    const countryName = countryCard.querySelector("h2").textContent;

    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch country coordinates");
            return res.json();
        })
        .then(data => {
            const latlng = data[0]?.latlng;
            if (!latlng || latlng.length < 2) {
                throw new Error("Lat/Lng data missing");
            }

            const lat = latlng[0];
            const lon = latlng[1];

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

            return fetch(weatherUrl);
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch weather");
            return res.json();
        })
        .then(data => {
            weatherDiv.innerHTML = `
                <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
                <p><strong>Weather:</strong> ${data.weather[0].description}</p>
                <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            `;
        })
        .catch(err => {
            console.error("ERROR:", err.message);
            weatherDiv.innerHTML = `<p style="color:red;">Weather data not available.</p>`;
        });
}