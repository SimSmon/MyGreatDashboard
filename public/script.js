function startTime() {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = checkTime(m);
  document.getElementById('time').innerHTML =
  h + ":" + m + ":" + s;
  var t = setTimeout(startTime, 500);
}
function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}
 
startTime();

loadWeather();

function getWeatherIcon(code) {

  switch(code) {

    case 0:
      return "wi-day-sunny";

    case 1:
    case 2:
      return "wi-day-cloudy";

    case 3:
      return "wi-cloudy";

    case 61:
    case 63:
      return "wi-rain";

    case 71:
      return "wi-snow";

    default:
      return "wi-na";
  }
}

async function loadWeather() {

  const url =
     "https://api.open-meteo.com/v1/forecast?" +
     "latitude=48.1019&longitude=-1.7956" +
     "&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset" + 
     "&models=meteofrance_seamless" + 
     "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure" +
     "&timezone=auto&forecast_days=5";

  const response = await fetch(url);

  const data = await response.json();

  const temp = data.current.temperature_2m;
  const rel_hum = data.current.relative_humidity_2m;
  const precipitation = data.current.precipitation;
  const app_temp = data.current.apparent_temperature;
  const p_surface = data.current.surface_pressure;
  const wind_direction_10m = data.current.wind_direction_10m;
  const wind_speed_10m = data.current.wind_speed_10m;
  const weatherCode = data.current.weather_code;
  

  const todayMax = data.daily.temperature_2m_max[0];
  const todayMin = data.daily.temperature_2m_min[0];

  const sunrise = data.daily.sunrise[0];
  const sunset = data.daily.sunset[0];
  const DweatherCode = data.daily.weather_code;

  const iconClass = getWeatherIcon(weatherCode);

  document.getElementById("weather").innerHTML = `
    <table>
        <tr>
            <td><p><i class="wi wi-strong-wind"></i>${wind_speed_10m}Km/H</p></td>
            <td><p><i class="wi wi-direction-up-right"></i>${wind_direction_10m}°</p></td>
            <td><p><i class="wi wi-sunrise"></i>${sunrise.split("T")[1]}</p></td>
            <td><p><i class="wi wi-sunset"></i>${sunset.split("T")[1]}</p></td>
        </tr>
        <tr>
            <th><h1><i class="wi ${iconClass}"></i></h1></th>
            <th><h1><i class="wi wi-thermometer"></i>${temp}<i class="wi wi-degrees"></i></h1></th>
        </tr>
        <tr>
            <td><p>ressenti ${app_temp}°C</p></td>
        </tr>
        <tr>
            <td><p>${rel_hum}<i class="wi wi-humidity"></i></p> </td>
            <td><p>${precipitation} mm</p></td>
            <td><p>${p_surface}<i class="wi wi-barometer"></i></p></td>
        </tr>
        <tr>
            <td><p>Max : ${todayMax}°C</p></td>
            <td><p>Min : ${todayMin}°C</p></td>
        </tr>
    </table>
  `;

    const tbody = document.querySelector("#forecastTable tbody");

    for (let i = 0; i < 5; i++) {

    const date = data.daily.time[i];
    const todayMax = data.daily.temperature_2m_max[i];
    const todayMin = data.daily.temperature_2m_min[i];

     const code = data.daily.weather_code[i];

    const icon =
      getWeatherIcon(code);

    const row = `
      <tr>
        <td>${date}</td>
        <td><i class="wi ${icon}"></i></td>
        <td>${todayMin}°C</td>
        <td>${todayMax}°C</td>
      </tr>
    `;

    tbody.innerHTML += row;
  }

};

async function loadCalendar() {

const response =
  await fetch("/calendar");

const text =
  await response.text();

  const calendar =
    document.getElementById("calendar");

  calendar.innerHTML = "";

  events.slice(0, 5).forEach(event => {

    const e = new ICAL.Event(event);

    calendar.innerHTML += `
      <div class="event">
        <h3>${e.summary}</h3>
        <p>${e.startDate.toJSDate().toLocaleString()}</p>
      </div>
    `;
  });
}

loadCalendar();