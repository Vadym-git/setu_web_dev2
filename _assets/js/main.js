import { CityDaily, CityHourly } from './cityData.js';

$(document).ready(function() {

  // global variables
  let daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let citiesHourlyData = {};
  let citiesDailyData = {};

  //  main functionality

  mainTraid();

  $('.panel-tabs').on('click', 'a', function(event){
    // this function set daily info in detailed city page
    // Prevent the default action of the click event
    event.preventDefault();
    // Remove the is-active class from all <a> elements within .panel-tabs
    $('.panel-tabs a').removeClass('is-active');
    // Add the is-active class to the clicked <a> element
    $(this).addClass('is-active');
    let currentCityName = getUrlParams(window.location.href)["name"];
    let currentCityDataDaily = citiesDailyData[currentCityName];
    let currentDay = this.id;
    $('#minTempD').text("Min: "+currentCityDataDaily["_minT"][currentDay]+" °C");
    $('#maxTempD').text("Max: "+currentCityDataDaily["_maxT"][currentDay]+" °C");
    console.log(currentCityDataDaily);
  });

  $('#cityesList').on('click', '.panel-block', function(event){
    event.preventDefault();;
    // Toggle its checked state#
    let activeCityes = parseCookee()["activeCities"];
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


  // functions

  function setSettingsPage(){
    let citiesList = $('#cityesList');
    citiesDailyData = parseDailyCitiesData();
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

  function setCityPageData() {
    // Get the current URL
    let urlString = window.location.href;
    // Create a URL object
    let url = new URL(urlString);
    // Get the search parameters from the URL
    let searchParams = url.searchParams;
    // Get a specific parameter by name
    let cityName = searchParams.get("name");
    $("#title").text(cityName.toUpperCase());
    citiesHourlyData = parseHourlyCitiesData();
    citiesDailyData = parseDailyCitiesData();
    let weekDaysTab = $('.panel-tabs');
    let date = new Date();
    // current temp and wind
    $('#tempRightN').text("Temp: "+citiesHourlyData[cityName]["_temp"][date.getHours()]+" °C");
    $('#windRightN').text("Wind: "+citiesHourlyData[cityName]["_wind"][date.getHours()]+" km/h");
    // max temp and wind for today
    let maxTToday = Math.max(...citiesHourlyData[cityName]["_temp"].slice(24));
    $('#maxTemp').text("Temp: "+Math.max(...citiesHourlyData[cityName]["_temp"].slice(24))+" °C");
    $('#maxWind').text("Wind: "+maxTToday+" km/h");
    console.log(citiesHourlyData[cityName]["_wind"][0]);
    for (let i = date.getDay(); i < daysOfWeek.length; i++) {
      // Create a new span element and add it to weekDaysTab
      const daySpan = $('<a></a>').text(daysOfWeek[i]);
      if (i === date.getDay()) {
        daySpan.text("Today")
        daySpan.addClass('is-active');  // Add the class instead of reassigning the variable
        $('#minTempD').text("Min: "+citiesDailyData[cityName]["_minT"][i]+" °C");
        $('#maxTempD').text("Max: "+maxTToday+" °C");
      }
      daySpan.attr('id', i);
      weekDaysTab.append(daySpan);
    }
    // Loop again to print days from Sunday to the day before today
    for (let i = 0; i < date.getDay(); i++) {
      const daySpan = $('<a></a>').text(daysOfWeek[i]); // Create a span with the day name
      daySpan.attr('id', i);
      weekDaysTab.append(daySpan);
    }
  }

  function mainTraid(){
    // This function like a Controller in MVC
    let cookie = parseCookee();
    switch (window.location.pathname){
      case "/":
      // show cities from the list selection
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
        // show all the cities
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

  function parseCookee() {
    // Get the cookie string
    const cookieString = document.cookie;
    // Create an object to store cookies
    const cookies = {};
    // Split the string into key-value pairs
    if (cookieString.length === 0) {
      return cookies;
    }
    const cookiePairs = cookieString.split(';');
    // Loop through each key-value pair
    for (let i = 0; i < cookiePairs.length; i++) {
      const pair = cookiePairs[i].trim(); // Remove leading/trailing whitespace
      // Split the pair into key and value
      const keyV = pair.split('=');
      cookies[decodeURIComponent(keyV[0])] = decodeURIComponent(keyV[1]);
      // Decode the value (optional, in case the value was encoded)
    }
    // Return the object containing cookies
    return cookies;
  }

  function setCookie(key, value, expires = 7, path = '/') {
    // first read the cookies
    const cookies = parseCookee();
    cookies[key] = value;
    // set cookie as a string
    let cookieString = "";
    cookies[key] = value;
    for (const key of Object.keys(cookies)) {
      cookieString += `${key}=${cookies[key]};`;
    }
    // Add optional attributes (expires and path)
    if (expires) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expires); // Set expiration in days
      cookieString += ` expires=${expirationDate.toUTCString()}`;
    }
    if (path) {
      cookieString += `; path=${path}`;
    }
    // Set the cookie
    document.cookie = cookieString;
  }

  function showCities(cities) {
    const cityTemplateUrl = "../_page_blocks/citie_card.html";
    const currentDay = new Date().getDay();
    $(".content-data").empty(); // Clear existing content (optional)
    // Load the city template asynchronously
    $.get(cityTemplateUrl, function(response, status) {
      if (status === "success") {
        let columns; // Define columns container
        // Iterate over cities
        let i = 0 // counter
        for (const key of Object.keys(cities)) {
          // Convert response to jQuery object and clone the template
          const cityHTML = $(response).clone();
          // Replace placeholders in the cloned template
          const replacedHTML = cityHTML.html()
          .replace("{{cityName}}", () => cities[key].name().toUpperCase())
          .replace(/{{cityLink}}/g, "city-focus/?name="+cities[key].name())
          .replace("{{cityLinkPic}}", "city") // Replace other placeholders as needed
          .replace("{{cityLinkTitle}}", "city")
          .replace("{{cityImageUrl}}", citiesPics[cities[key].name()])
          .replace("{{minT}}", cities[key].minT()[currentDay])
          .replace("{{maxT}}", cities[key].maxT()[currentDay])
          .replace("{{sunrise}}", cities[key].sunrise()[currentDay].split("T")[2])
          .replace("{{sunset}}", cities[key].sunset()[currentDay].split("T")[2]);

          // Set the HTML content of the cloned template with replaced placeholders
          cityHTML.html(replacedHTML);

          // If i is a multiple of 3, start a new column
          if (i % 3 === 0) {
            columns = $("<div class='columns'></div>");
            $(".content-data").append(columns);
          }
          // Append the city HTML to the current column
          columns.append(cityHTML);
          i++;
        }
      } else {
        console.error("Error loading city template:", status);
      }
    });
  }

  function parseHourlyCitiesData(){
    const data = $.ajax({
      url: '../_data/complete_data.json',
      dataType: 'json',
      async: false, // Make the request synchronous
    }).responseJSON;
    // console.log(data);
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

  function parseDailyCitiesData() {
    const data = $.ajax({
      url: '../_data/complete_data.json',
      dataType: 'json',
      async: false, // Make the request synchronous
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

  function getUrlParams(url) {
    // Initialize an empty object to store the parameters
    var params = {};
    // Get the query string part of the URL
    var queryString = url.split('?')[1];
    if (queryString) {
      // Split the query string into individual key-value pairs
      var keyValuePairs = queryString.split('&');
      // Loop through each key-value pair
      keyValuePairs.forEach(function(keyValuePair) {
        // Split the key-value pair into key and value
        var keyValue = keyValuePair.split('=');
        // Decode the key and value (in case they're URL encoded)
        var key = decodeURIComponent(keyValue[0]);
        var value = decodeURIComponent(keyValue[1]);
        // Store the key-value pair in the params object
        params[key] = value;
      });
    }
    // Return the params object
    return params;
  }

  let citiesPics = {"amsterdam":"https://a.cdn-hotels.com/gdcs/production112/d1899/d77bcff2-a859-4785-bdb1-3b15a0887607.jpg?impolicy=fcrop&w=800&h=533&q=medium",
  "berlin":"https://www.telegraph.co.uk/content/dam/Travel/hotels/2023/july/Berlin%20Brandenburg%20gate%20getty.jpg",
  "copenhagen":"https://gdkfiles.visitdenmark.com/files/382/164757_Nyhavn_Jacob-Schjrring-og-Simon-Lau.jpg?width=987",
  "cork": "https://img.delicious.com.au/_db_tuZz/del/2019/07/cork-ireland-110336-1.jpg",
  "paris":"https://images.adsttc.com/media/images/5d44/14fa/284d/d1fd/3a00/003d/large_jpg/eiffel-tower-in-paris-151-medium.jpg?1564742900",
  "new-york":"https://www.investopedia.com/thmb/9TGuBqAcwK2UN_YgtfkQ4wbHUq0=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/LowerManhattanSkyline-900c48d4f1064a97893dbc1548d775e1.jpg",
  "san-francisco":"https://worldstrides.com/wp-content/uploads/2015/07/iStock_000061296808_Large-1.jpg",
  "tromso":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Troms%C3%B8_sentrum_%285835702754%29.jpg/1200px-Troms%C3%B8_sentrum_%285835702754%29.jpg",
  "waterford":"https://www.telegraph.co.uk/content/dam/travel/Spark/tourism-ireland/Waterford-Quay.jpg?imwidth=680"

}

});
