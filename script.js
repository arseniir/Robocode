// // 1bc8d8b136894ccd8a0171731240606 - api key
const searchElement = document.getElementById('search')
const resultElement = document.getElementById('result')
const threedaysElement = document.getElementById('threedays')
const detailElement = document.getElementById('detail')

// let button_for_input = document.getElementById('button_for_input')
document.addEventListener("DOMContentLoaded", function() {
    let url = `http://api.weatherapi.com/v1/forecast.json?key=1bc8d8b136894ccd8a0171731240606&q=Odesa&days=3&aqi=no&alerts=no`
    search(url)
});    


function resultCards(){
    clearWeatherData()
    let city = document.getElementById('city_choice').value
    let url = `http://api.weatherapi.com/v1/forecast.json?key=1bc8d8b136894ccd8a0171731240606&q=${city}&days=3&aqi=no&alerts=no`
    search(url)
}

function FieldInputCitySearch() {
    clearWeatherData()
    const button_for_input = document.getElementById('button_for_input');

    button_for_input.addEventListener('click', () => {
        let input = document.getElementById('input_line').value;
        let url = `http://api.weatherapi.com/v1/forecast.json?key=1bc8d8b136894ccd8a0171731240606&q=${input}&days=3&aqi=no&alerts=no`;
        
        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    button_for_input.style.backgroundColor = 'rgb(196, 106, 106)';
                    return null; 
                }
            })
            .then(data => {
                if (data) {
                    globalWeatherData = data;
                    currentWeather(data);
                    threeDaysWeather(data);
                    button_for_input.style.backgroundColor = ''
                }
            })
            .catch(error => {
                console.error('Помилка: ', error.message);
                button_for_input.style.backgroundColor = 'rgb(196, 106, 106)';

            });
    });
}

function search(link){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', link);
    xhr.responseType = 'json';
    xhr.send();
    xhr.onload = function(){
        globalWeatherData = xhr.response;
        currentWeather(xhr.response);
        threeDaysWeather(xhr.response);
    }
}

function clearWeatherData() {
    threedaysElement.innerHTML = '';
    detailElement.innerHTML = '';
    if (myChart) {
        myChart.destroy();
        myChart = null;
    }
}



function currentWeather(weather){
    resultElement.innerHTML = null
    resultElement.innerHTML = `
        <div class="card">
            <h3>${weather.location.name}</h3>

            <img src="${weather.current.condition.icon}" alt="icon">
            <h5>Weather: ${weather.current.condition.text}</h5>
            <p>Temperature: ${weather.current.temp_c}°C</p>
            <p>Feels like: ${weather.current.wind_kph}°C</p>
            <p>Wind speed: ${weather.current.wind_dir} kph</p>
            <p>Wind direction: ${weather.current.feelslike_c}</p>
        </div>`
}

function threeDaysWeather(weather){
    threedaysElement.innerHTML = null;
    weather.forecast.forecastday.forEach((day, index) => {
        threedaysElement.innerHTML += `
            <div class="box">
                <img src="${day.day.condition.icon}" alt="icon">
                <h5>Weather: ${day.day.condition.text}</h5>
                <p>Max temp: ${day.day.maxtemp_c}°C, Min temp: ${day.day.mintemp_c}°C</p>
                <p>Max wind speed: ${day.day.maxwind_kph} kph</p>
                <p>Average temp: ${day.day.avgtemp_c}°C</p>
                <button class="detail-button" onclick="moreInformation(${index})">Details</button>
            </div>`
    })
}


let hours = [];
let temperatures = [];
let times = null;
let myChart = null;

function moreInformation(index) {
    if (globalWeatherData) {
        const day = globalWeatherData.forecast.forecastday[index];
        detailElement.innerHTML = null;
        
        hours = [];
        temperatures = [];
        
        for (let i = 0; i < day.hour.length; i += 3) {
            const hour = day.hour[i];
            hours.push(hour.time);
            temperatures.push(hour.temp_c);

            detailElement.innerHTML += `
                <div class="box-time">
                    <img src="${hour.condition.icon}" alt="icon">
                    <h5>Time: ${hour.time}</h5>
                    <p>Weather: ${hour.condition.text}</p>
                    <p>Temp: ${hour.temp_c}°C</p>
                    <p>Wind speed: ${hour.wind_kph} kph</p>
                    <p>Humidity: ${hour.humidity}%</p>
                </div>`;
        }

        times = hours.map(date => date.split(' ')[1]);
        console.log(times);

        updateChart();
    }
}

function createChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: times,
            datasets: [{
                label: 'Temperature',
                data: temperatures,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateChart() {
    if (myChart) {
        myChart.data.labels = times;
        myChart.data.datasets[0].data = temperatures;
        myChart.update();
    } else {
        createChart();
    }
}




 