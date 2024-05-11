import { CityDaily, CityHourly } from './cityData.js';

$(document).ready(function() {

  // Global variables
  let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let citiesHourlyData = {};
  let citiesDailyData = {};

  //  Main functionality

  mainTraid(); // Initial call to mainTraid function when document is ready

  // Event handler for panel tabs
  $('.panel-tabs').on('click', 'a', function(event){
    event.preventDefault(); // Prevent the default action of the click event
    $('.panel-tabs a').removeClass('is-active'); // Remove is-active class from all panel tabs
    $(this).addClass('is-active'); // Add is-active class to clicked panel tab
    let currentCityName = getUrlParams(window.location.href)["name"]; // Get current city name from URL
    let currentCityDataDaily = citiesDailyData[currentCityName]; // Get daily data for current city
    let currentDay = this.id; // Get the id of the clicked tab (represents day)
    $('#minTempD').text("Min: "+currentCityDataDaily["_minT"][currentDay]+" °C"); // Display min temperature for selected day
    $('#maxTempD').text("Max: "+currentCityDataDaily["_maxT"][currentDay]+" °C"); // Display max temperature for selected day
    console.log(currentCityDataDaily);
  });

  // Event handler for city list
  $('#cityesList').on('click', '.panel-block', function(event){
    event.preventDefault(); // Prevent the default action of the click event
    let activeCityes = parseCookee()["activeCities"]; // Get active cities from cookie
    if (activeCityes == null){
      activeCityes = [];
    } else { activeCityes = JSON.parse(activeCityes) }
    let img = $(this).find("img");
    if (activeCityes.includes(this.id)){
      img.attr("src", "https://cdn-icons-png.flaticon.com/128/15526/15526417.png")
      activeCityes = activeCityes.filter(item => item !== this.id);
      setCookie("activeCities", JSON.stringify(activeCityes));
    } else {
      img.attr("src", "https://cdn-icons-png.flaticon.com/128/5610/5610944.png")
      activeCityes.push(this.id);
      setCookie("activeCities", JSON.stringify(activeCityes));
    }
  });


  // Functions

  // Function to set city settings page
  function setSettingsPage(){
    let citiesList = $('#cityesList');
    citiesDailyData = parseDailyCitiesData(); // Parse daily cities data
    let cookie = parseCookee();
    if (cookie["activeCities"] == null){
      cookie["activeCities"] = [];
    }
    Object.keys(citiesDailyData).forEach(key => {
      let img = "https://cdn-icons-png.flaticon.com/128/15526/15526417.png"
      if (cookie["activeCities"].includes(key)){
        img = "https://cdn-icons-png.flaticon.com/128/5610/5610944.png"
      }
          citiesList.append(`<div class="panel-block" id="${key}"><label class="checkbox">
          <img src="${img}" width="20" height="20"/>${key.toUpperCase()}</label></div>`);
    });
  }

  // Function to set city page data
  function setCityPageData() {
    let urlString = window.location.href; // Get current URL
    let url = new URL(urlString); // Create URL object
    let searchParams = url.searchParams; // Get search parameters
    let cityName = searchParams.get("name"); // Get city name from parameters
    $("#title").text(cityName.toUpperCase()); // Set city name in title
    citiesHourlyData = parseHourlyCitiesData(); // Parse hourly cities data
    citiesDailyData = parseDailyCitiesData(); // Parse daily cities data
    let weekDaysTab = $('.panel-tabs');
    let date = new Date();
    $('#tempRightN').text("Temp: "+citiesHourlyData[cityName]["_temp"][date.getHours()]+" °C"); // Display current temperature
    $('#windRightN').text("Wind: "+citiesHourlyData[cityName]["_wind"][date.getHours()]+" km/h"); // Display current wind speed
    let maxTToday = Math.max(...citiesHourlyData[cityName]["_temp"].slice(24)); // Calculate max temperature for today
    $('#maxTemp').text("Temp: "+maxTToday+" °C"); // Display max temperature for today
    $('#maxWind').text("Wind: "+maxTToday+" km/h"); // Display max wind speed for today
    for (let i = date.getDay(); i < daysOfWeek.length; i++) {
      const daySpan = $('<a></a>').text(daysOfWeek[i]);
      if (i === date.getDay()) {
        daySpan.text("Today")
        daySpan.addClass('is-active');
        $('#minTempD').text("Min: "+citiesDailyData[cityName]["_minT"][i]+" °C");
        $('#maxTempD').text("Max: "+maxTToday+" °C");
      }
      daySpan.attr('id', i);
      weekDaysTab.append(daySpan);
    }
    for (let i = 0; i < date.getDay(); i++) {
      const daySpan = $('<a></a>').text(daysOfWeek[i]);
      daySpan.attr('id', i);
      weekDaysTab.append(daySpan);
    }
  }

  // Main trade function
  function mainTraid(){
    let cookie = parseCookee();
    switch (window.location.pathname){
      case "/":
      if (cookie["activeCities"] == null){
        showCities(parseDailyCitiesData());
        break;
      }
      if (cookie["activeCities"].length > 0){
        let allCities = parseDailyCitiesData();
        let cities = [];
        for (const city of Object.keys(allCities)){
          if (cookie["activeCities"].includes(city)){
            cities.push(allCities[city]);
          }
        }
        showCities(cities);
      } else {
        showCities(parseDailyCitiesData());
      }
      break;
      case "/city-focus/":
      setCityPageData();
      break;
      case "/settings/":
      setSettingsPage();
      break;
    }
  }

  // Function to parse cookies
  function parseCookee() {
    const cookieString = document.cookie;
    const cookies = {};
    if (cookieString.length === 0) {
      return cookies;
    }
    const cookiePairs = cookieString.split(';');
    for (let i = 0; i < cookiePairs.length; i++) {
      const pair = cookiePairs[i].trim();
      const keyV = pair.split('=');
      cookies[decodeURIComponent(keyV[0])] = decodeURIComponent(keyV[1]);
    }
    return cookies;
  }

  // Function to set cookie
  function setCookie(key, value, expires = 7, path = '/') {
    const cookies = parseCookee();
    cookies[key] = value;
    let cookieString = "";
    cookies[key] = value;
    for (const key of Object.keys(cookies)) {
      cookieString += `${key}=${cookies[key]};`;
    }
    if (expires) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expires);
      cookieString += ` expires=${expirationDate.toUTCString()}`;
    }
    if (path) {
      cookieString += `; path=${path}`;
    }
    document.cookie = cookieString;
  }

  // Function to display cities
  function showCities(cities) {
    const cityTemplateUrl = "../_page_blocks/citie_card.html";
    const currentDay = new Date().getDay();
    $(".content-data").empty();
    $.get(cityTemplateUrl, function(response, status) {
      if (status === "success") {
        let columns;
        let i = 0
        for (const key of Object.keys(cities)) {
          const cityHTML = $(response).clone();
          const replacedHTML = cityHTML.html()
          .replace("{{cityName}}", () => cities[key].name().toUpperCase())
          .replace(/{{cityLink}}/g, "city-focus/?name="+cities[key].name())
          .replace("{{cityLinkPic}}", "city")
          .replace("{{cityLinkTitle}}", "city")
          .replace("{{cityImageUrl}}", citiesPics[cities[key].name()])
          .replace("{{minT}}", cities[key].minT()[currentDay])
          .replace("{{maxT}}", cities[key].maxT()[currentDay])
          .replace("{{sunrise}}", cities[key].sunrise()[currentDay].split("T")[2])
          .replace("{{sunset}}", cities[key].sunset()[currentDay].split("T")[2]);
          cityHTML.html(replacedHTML);
          if (i % 3 === 0) {
            columns = $("<div class='columns'></div>");
            $(".content-data").append(columns);
          }
          columns.append(cityHTML);
          i++;
        }
      } else {
        console.error("Error loading city template:", status);
      }
    });
  }

  // Function to parse hourly cities data
  function parseHourlyCitiesData(){
    const data = $.ajax({
      url: '../_data/complete_data.json',
      dataType: 'json',
      async: false,
    }).responseJSON;
    const cities = {};
    const hourlyDataKeys = Object.keys(data).filter(city => city.toLowerCase().endsWith('hourly'));
    for (const cityKey of hourlyDataKeys) {
      let name = cityKey.split("_hourly")[0].replace("_", "-");
      let cityData = data[cityKey]["hourly"];
      let windSpeed = cityData["wind_speed_10m"].slice(24)
      let temperature = cityData["apparent_temperature"].slice(24)
      cities[name] = new CityHourly(temperature, windSpeed);
    }
    return cities;
  }

  // Function to parse daily cities data
  function parseDailyCitiesData() {
    const data = $.ajax({
      url: '../_data/complete_data.json',
      dataType: 'json',
      async: false,
    }).responseJSON;
    const cities = {};
    const dailyDataKeys = Object.keys(data).filter(city => city.toLowerCase().endsWith('daily'));
    for (const cityKey of dailyDataKeys) {
      let name = cityKey.split("_daily")[0].replace("_", "-");
      let maxTemp = data[cityKey]["daily"]["apparent_temperature_max"];
      let minTemp = data[cityKey]["daily"]["apparent_temperature_min"];
      let sunrise = data[cityKey]["daily"]["sunrise"];
      let sunset = data[cityKey]["daily"]["sunset"];
      cities[name] = new CityDaily(name, maxTemp, minTemp, sunrise, sunset);
    }
    return cities;
  }

  // Function to get URL parameters
  function getUrlParams(url) {
    var params = {};
    var queryString = url.split('?')[1];
    if (queryString) {
      var keyValuePairs = queryString.split('&');
      keyValuePairs.forEach(function(keyValuePair) {
        var keyValue = keyValuePair.split('=');
        var key = decodeURIComponent(keyValue[0]);
        var value = decodeURIComponent(keyValue[1]);
        params[key] = value;
      });
    }
    return params;
  }

  // City pictures object
  let citiesPics = {"amsterdam":"https://a.cdn-hotels.com/gdcs/production112/d1899/d77bcff2-a859-4785-bdb1-3b15a0887607.jpg?impolicy=fcrop&w=800&h=533&q=medium",
  "berlin":"https://www.telegraph.co.uk/content/dam/Travel/hotels/2023/july/Berlin%20Brandenburg%20gate%20getty.jpg",
  "copenhagen":"https://gdkfiles.visitdenmark.com/files/382/164757_Nyhavn_Jacob-Schjrring-og-Simon-Lau.jpg?width=987",
  "cork": "https://img.delicious.com.au/_db_tuZz/del/2019/07/cork-ireland-110336-1.jpg",
  "paris":"https://images.adsttc.com/media/images/5d44/14fa/284d/d1fd/3a00/003d/large_jpg/eiffel-tower-in-paris-151-medium.jpg?1564742900",
  "new-york":"https://www.investopedia.com/thmb/9TGuBqAcwK2UN_YgtfkQ4wbHUq0=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/LowerManhattanSkyline-900c48d4f1064a97893dbc1548d775e1.jpg",
  "san-francisco":"https://worldstrides.com/wp-content/uploads/2015/07/iStock_000061296808_Large-1.jpg",
  "tromso":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Troms%C3%B8_sentrum_%285835702754%29.jpg/1200px-Troms%C3%B8_sentrum_%285835702754%29.jpg",
  "waterford":"https://www.telegraph.co.uk/content/dam/travel/Spark/tourism-ireland/Waterford-Quay.jpg?imwidth=680"
};
});
