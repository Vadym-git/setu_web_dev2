$(document).ready(function() {

  showCities(["hello", "hello1"]);
  function showCities(cities) {
    const cityTemplateUrl = "_page_blocks/citie_card.html";
    $(".columns").empty(); // Clear existing content (optional)

    $.get(cityTemplateUrl, function(response, status) {
      if (status === "success") {
        const cityTemplate = response; // The loaded template

        // Use the loaded template to construct city HTML and append
        for (let i = 0; i < cities.length; i++) {
          const cityName = cities[i];
          const cityHTML = cityTemplate.replace("{{cityName}}", cityName);
          $(".columns").append(cityHTML);
        }
      } else {
        console.error("Error loading city template:", status);
      }
    });
  }

});