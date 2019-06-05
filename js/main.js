// draw the world map
function drawMap(geo_data) {
    // define the margin and width and height 
    "use strict";
    var margin = 75,
        width = 500 - margin + 1300,
        height = 350 - margin + 675;

    // put a title on top of the svg
    d3.select("body").select("#map")
        .append("h3")

    //add map title
    d3.select("body").select("#map")
    .append("h2")
    .text("Location of terrorist attack(s)")

    var mapContainerSvg = d3.select("body").select("#map-container")
    .append("svg")
    .attr("width", width + margin)
    .attr("height", height + margin)
    .call(d3.behavior.zoom().on("zoom", function () {
      svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
    }))
    .append("g")
    .attr('class', 'map');

    var svg = mapContainerSvg
        .append("svg")
        .attr("width", width + margin)
        .attr("height", height + margin)
        .append('g')

    // mercator projection (like scale) geographic coordinates => (x,y) pixel range
    var projection = d3.geo.mercator()
                        .scale(295)
                        .translate([width / 2, height / 1.5]);

    // will be use to create the path that is use to make the map
    var path = d3.geo.path().projection(projection);
    

    // select all path and bind geo.json data empty selections
    var map = svg.selectAll('path')
        .data(geo_data.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', '#53A266')
        .style('stroke', 'black')
        .style('stroke-width', 0.5);

    // /* Use D3 to load the CSV file and pass the contents of it to the draw function 
    d3.csv("data/minTerroristStatisticLocation.csv",draw);
    

    function draw(data) {

        /* yearNKill(leaves): return the number of number of people killed in a certain year 
        leaves is all of the number of people killed in a given years group "worldData" */
        function yearNKill(leaves) {
            var numKilled =  d3.sum(leaves, function(d) {
            return d.nkill; 
            }); 
            
            // group data in the end to return an array with value of this {}
            return {
            'numberKilled': numKilled
            };
        }

        /*
            manipulating worldData: KEY-> year , Value -> {number of people killed in that year}
        */
        var worldData = d3.nest()
            .key(function(d) { return d.iyear; })
            // .key(function(d) { return d.country_txt})
            .rollup(yearNKill)
            .entries(data);
        
        // format the worldData
        let dateFormat = d3.time.format("%Y");
        worldData.forEach(function(d) {
            d.date = dateFormat.parse(d.key);
            d.numberKilled = +d.values.numberKilled;
        });
        
        // key function for use when needing a key 
        function key_func(d) {
            return d.key;
        }
        
        //TEST CODES
        // try nesting data of our nested data
        var nested = d3.nest()
            .key(function(d) { 
            return d.date.getUTCFullYear();
            })
            .rollup(function(leaves) {
            var totalKilled = d3.sum(leaves, function(d) {
                return d.numberKilled;
            })
            return {
                'numberKilled': totalKilled,
                };
            })
            .entries(worldData);
        
        //TEST CODES
        
        /*
        D3.js setup code
        */
            "use strict";
            var margin = 75,
                width = 1000 - margin,
                height = 600 - margin;
        
            //add line graph title
            d3.select("body").select("#line_graph")
            .append("h2")
            .text("Total Number of People Killed by Terrorists")
        
            var svg = d3.select("body").select("#line_graph")
            .append("svg")
                .attr("width", width + margin)
                .attr("height", height + margin)
            .append('g')
                .attr('class','chart');
        
            var radius = 5;
            var color = "blue";
        
    /*
    Connecting data to the SVG
    */
        // Selecting the svg
        d3.select('svg')
        .selectAll("circle")
        .data(worldData)
        .enter()
        .append("circle")
        
        // find range of date
        var time_extent = d3.extent(worldData, function(d) {
            return d.date; 
        })

        // find range of numberkill
        var count_extent = d3.extent(worldData, function(d) {
            return d.numberKilled; // value represent the number of people killed 
        })
    
        // Create x-axis scale mapping dates -> pixel
        var time_scale = d3.time.scale()
            .range([margin, width])
            .domain(time_extent);
        
        // Create y-axis scale mapping numberkilled -> pixel
        var count_scale = d3.scale.linear()
            .range([height, margin])
            .domain(count_extent);
    
        // Create x axis for date
        var time_axis = d3.svg.axis()
            .scale(time_scale)
            .orient("bottom")
            .ticks(d3.time.years, 1);
    
        // Create y axis for numberKill
        var count_axis = d3.svg.axis()
            .scale(count_scale)
            .orient("left");
    
        // put the x axis and y axis in the DOM
        d3.select("svg")
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(time_axis)
            .selectAll("text")	// roate the tick label
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", "rotate(-65)");
    
        // put the y axis and y axis in the DOM
        d3.select("svg")
            .append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + margin + ',0)')
            .call(count_axis)

        // adding x axis label
        d3.select("svg").append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width/2 + 50)
            .attr("y", height + 50)
            .text("Years");

        // adding y axis label
        svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -height/2 +30)
        .attr("y", 10)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Number of People Killed");

        // Define the line between the points
        var valueline = d3.svg.line()
            .x(function(d) { return time_scale(d.date); })
            .y(function(d) { return count_scale(d.numberKilled); });

            // Define the div for the tooltip
            var div = d3.select("body").append("div")	
                .attr("class", "tooltip")				
                .style("opacity", 0);
    
            // update(int) will update the chart according to which year is passed in
            function updateMapPoints(country,filteredCountryData) {
                // filter the data=>[{},{}...] and get only the desire country filtered =>[{}]
                var filtered = data.filter(function(d) {
                    // strip out the key and compare it to the year we want to filter
                    return new Date(d.key).getUTCFullYear() === year;
                });
    
            //PROGRAMING NOTE: MAP and FILTER works the same but filter dont return every elements but just the element that return true to the condition we give.
    
            // change h2 to year just added
            d3.select("h2")
                .text("Year " + year);
    
            // tell d3 to update the data that is in the year just in case anything data that is bound to it has change
            var circles = svg.selectAll('circle')
                .data(filtered, key_func);

            // remove any elements that dont belong in circles
            circles.exit().remove();
            
            // append circles that is in circles to DOM that is not on there already
            // NOTE: since circle is the connection between filtered and 
            //        the DOM, d represent filtered data
            circles.enter()
                .append("circle")
                // add transition when changing  circle
                .transition()
                .duration(500)
                .attr('cx', function(d) { return time_scale(d.date)})
                .attr('cy', function(d) { return count_scale(d.values.numberKilled)})
                .attr('r', radius + 10)
                .attr('fill', "red")

            }

    // TESTING CODE 
            // years[] contain all the years that that I will animate through
            var years = [];

            // put year from startingYear to endingYear into years[]
            for(var i = 1970; i <= 2017; i++) {
                years.push(i);
            };

            // add years_select that corresponds to all the years in years[]
            d3.select("body").select("#filter").select("#starting_years_select")
            .selectAll("option").select(".yearOption") //select all the options in select
                .data(years) // bind data corresponds to all the years
                .enter() // grab all the elements thats not yet on the page
                .append("option") // append option with text that equal to data by itself
                .text(function(d) {
                    return d;
                });      
                
            
            // add years_select that corresponds to all the years in years[]
            d3.select("body").select("#filter").select("#ending_years_select")
            .selectAll("option").select(".yearOption") //select all the options in select
                .data(years) // bind data corresponds to all the years
                .enter() // grab all the elements thats not yet on the page
                .append("option") // append option with text that equal to data by itself
                .text(function(d) {
                    return d;
                });

            // GLobal Country
            var country = "The World"

            // Global range Variable
            var startingYear = 2004;
            var endingYear = 2002;

            //enable interaction for change event for starting year selection
            d3.select('#starting_years_select').on("change", function() {
                // event handler
                startingYear = this.value;
                console.log(startingYear)
            }) 

            //enable interaction for change event for starting ending year selection
            d3.select('#ending_years_select').on("change", function() {
                // event handler
                endingYear = this.value;
                console.log(endingYear)
            }) 

             // load loader
             function showLoader() {
                console.log("Hello from showLoader");
                const loadingBarDiv = d3.select("body").select("#loading_bar").attr("class","loading_bar")  
            }

            function hideLoader()  {
                console.log("Hello from hideLoader");
                const loadingBarDiv = d3.select("body").select("#loading_bar").attr("class","blah blah")   
                return true
            }

            // interaction with UPDATE Button
            d3.select("#updateButton").on("click", function() {
                
                if(startingYear > endingYear){
                    alert("Please pick a correct date range! :) ");
                } else {
                    // showLoader();  //TEST
                    updateData(country,startingYear,endingYear); 
                    // hideLoader() //TEST
                }
            })




    // TESTING CODE
            
            // FILL UP countries[] with all the countries (start) 
            var countries = [];

            // nest data by country and add up all the nkill for each country
            var groupByCountryData = d3.nest()
                .key(function(d) { return d.country_txt; })
                .key(function(d) { return d.iyear})
                .rollup( function(v) {  
                    // console.log(v);  debugger;
                    let numkilled = d3.sum(v, function(d) { return d.nkill;})
                    let latitude = v.latitude;
                    let longitude = v.longitude; 
                    return  numkilled;
                    // return {
                    //     'values': numkilled,
                    //     // 'latitude': latitude,
                    //     // 'longitude': longitude
                    // }
                })
                .entries(data);
            
            // sort on key: basically put contry in alphabetical order
            groupByCountryData.sort(function(a,b){
                return a.key.localeCompare(b.key);
            });

            // format the groupByCountryData
            dateFormat = d3.time.format("%Y");

            // format groupByCountryData
            groupByCountryData.forEach(function(d) {
                d.values.forEach(function(d) {
                    d.key = dateFormat.parse(d.key);
                })
            });

            // FILL UP countries[] with all the countries (end)
            groupByCountryData.forEach( function(d) {
                countries.push(d.key)
            })


            // add years_select that corresponds to all the countries in countries
            d3.select("body").select("#filter").select(".country_select")
            .selectAll("option").select(".country_option") //select all the options in select with id #country_select
                .data(countries) // bind data corresponds to all the countries
                .enter() // grab all the elements thats not yet on the page
                .append("option") // append option with text that equal to data by itself
                .text(function(d) {
                    return d;
                });

            //enable interaction for change event
            d3.select(".country_select").on("change", function() {
                // event handler
                // d is the data from countries[]
                country = this.value;
            }) 

            // ** Update data section (Called from the onclick)
            function updateData(country,startingYear,endingYear) {

                // Set the range variables
                var startingYear = startingYear.toString();
                var endingYear = endingYear.toString();

                /* yearNKill(leaves): return the number of number of people killed in a certain year 
                leaves is all of the number of people killed in a given years group "worldData" */
                function countryNKill(leaves) {
                    var numKilled =  d3.sum(leaves, function(d) {
                    return d.nkill; 
                    }); 
                    // group data in the end to return an array with value of this {}
                    return {
                    'numberKilled': numKilled,
                    };
                }

                var filteredCountryData;
                var filteredCountryAndDateData = {'key': country};

                if (country == "The World") {

                    // manipulating worldData to fit the data structure that this function uses
                    if (typeof(worldData[0].key) === 'string') {
                        worldData.forEach(function(d) {
                            d.key = dateFormat.parse(d.key);
                            d.values = d.numberKilled;
                        })
                    }

                    filteredCountryData = [{ 'key':'The World','values': worldData}]; // need to change to newWorldData

                    filterOutDateRange(filteredCountryData);
                    
                    putLocationOfAttackOnMap(country, data); // HERE HERE HERE
                
                } else {
                    //(filter) pick the data depending on which country is selected
                    filteredCountryData = groupByCountryData.filter(function(d) {
                            return d.key === country;
                    })
                    //filter out date range
                    filterOutDateRange(filteredCountryData);

                    putLocationOfAttackOnMap(country, data);
                }

                function filterOutDateRange(filteredData) {
                    // // filter out the date range
                    filteredData.forEach(function(d) { 
                        filteredCountryAndDateData.values = d.values.filter(function(d) {
                            return d.key.getTime() >= dateFormat.parse(startingYear).getTime() && 
                                d.key.getTime() <= dateFormat.parse(endingYear).getTime();
                        })
                    })

                    // put the updated filteredData back into filteredCountryData (make sure its an array of object)
                    filteredCountryData = [filteredCountryAndDateData];
                }

                // put circle of where all terrorist attack happen on map 
                // with the radius of the circle to indicate amount of people killed 
                function putLocationOfAttackOnMap(country,data) {

                    //redefine the margin and width and height for the map
                    // WARNING: MUST MATCH THE margin and width and height in drawMap()
                    "use strict";
                    var margin = 75,
                        width = 500 - margin + 1300,
                        height = 350 - margin + 675;

                    // mercator projection (like scale) geographic coordinates => (x,y) pixel range
                    // WARNING: MUST MATCH THE PROJECTION() in drawMap()
                    var projection = d3.geo.mercator()
                        .scale(295)
                        .translate([width / 2, height / 1.5]);

                    function agg_countries(leaves) {
                        var numKilled = d3.sum(leaves, function(d) { // go through every element of leaves and add all the nkill and return the sum
                            return d.nkill;
                        })

                        // use the first attack location as the circle location and project it to pixel value
                        var location = projection([+leaves[0].longitude,+leaves[0].latitude])
                        
                        return {
                            'numKilled': numKilled,
                            // 'x': center_x,
                            // 'y': center_y
                            'x': location[0], 
                            'y': location[1],
                            
                        };
                    }

                    // filter the data=>[{},{}...] and get only the desire year filteredData =>[{}]
                    var filteredData = data.filter(function(d) {

                        // strip out the key and compare it to the year we want to filter
                        return dateFormat.parse(d.iyear).getTime() >= dateFormat.parse(startingYear).getTime() && 
                                dateFormat.parse(d.iyear).getTime() <= dateFormat.parse(endingYear).getTime();
                    });


                    // filter out the countries if it is not the world
                    if (country != 'The World') {
                        
                        //(filter) pick the data depending on which country is selected
                        filteredData = filteredData.filter(function(d) {
                            return d.country_txt === country;
                        })
                    } 




                    // draw circles logic 
                    var nested = d3.nest()
                                    .key(function(d) { // grouping by
                                        return d.country_txt;
                                    })
                                    // aggregation: do something with all the grouped up data
                                    .rollup(agg_countries)
                                    .entries(filteredData);

                    
                    // this is use to scale our circle base on numKilled
                    var numberKilled_extent = d3.extent(filteredData, function(d) {
                        return d.nkill;
                    })
                    // radius of our circle on the map
                    var radius = d3.scale.sqrt()
                                    .domain(numberKilled_extent)
                                    .range([2,9]);
                    
                    // plot circles onto the map
                    var mapSvg = d3.select("#map-container").select("svg").select('g').select('svg').select('g');

                    // remove the past bubble group so it doesnt overlapse everytime i goback to the world
                    mapSvg.selectAll(".bubble").remove();

                    
                    mapSvg.append('g')
                        .attr("class","bubble")
                        .selectAll("circle")
                        .data(filteredData.sort(function(a,b) {
                            return b.nkill - a.nkill // return < 0 : a first return > 0: b first
                        }))
                        .enter()
                        .append("circle")
                        .attr('cx', function(d) { return projection([+d.longitude,+d.latitude])[0]})
                        .attr('cy', function(d) { return projection([+d.longitude,+d.latitude])[1]})
                        .attr('r', function(d) {
                            return radius(d.nkill)
                        })
                        .attr('opacity','0.7')
                        .on("mouseover", function(d) {
                            div.transition()		
                                .duration(200)		
                                .style("opacity", .9);		
                            div	.html( 
                                "<p><strong> " + d.iyear + "</strong>" + "<br>" + "<strong>" + d.country_txt + "</strong>" 
                                + "<br>" + "<strong>#killed: </strong>" + d.nkill + "<br>" + "<strong>#wounded: </strong>" + d.nwound 
                                + "<br>" + "<strong>weapon: </strong>" + d.weaptype1_txt  + "<br>" + "<strong>type: </strong>" + d.attacktype1_txt + "</p>")	
                                .style("left", (d3.event.pageX) + "px")		
                                .style("top", (d3.event.pageY - 28) + "px");	
                            })
                        .on("mouseout", function(d) {		
                            div.transition()		
                                .duration(500)		
                                .style("opacity", 0);	
                        });		

                        //Only show the country that was selected
                        mapSvg.selectAll('path')
                            .style('fill',function(d) { 

                                if (country === "United States") { // NOTE: Data is United State but GEOData uses USA
                                    country = "USA";
                                }
                                
                                if (country.indexOf(d.properties.name) !== -1 || country === "United States") {
                                    return '#53A266';
                                } else if (country === "The World") {
                                    return '53A266';
                                } else {
                                    return 'white';
                                }
                                
                            })          

                }

                // Draw the path
                var path = d3.select("svg")
                .append("path")
                .attr("class", "line")

                // make the range using user's input
                time_extent = [dateFormat.parse(startingYear),dateFormat.parse(endingYear)];

                // find range of numberkill selected country
                count_extent = d3.extent(filteredCountryData[0].values, function(d,i) { 
                    var numberKilled = d.values;
                    return numberKilled ;// value represent the number of people killed 
                })

                // Create x-axis scale mapping dates -> pixel again
                time_scale = d3.time.scale()
                    .range([margin, width])
                    .domain(time_extent);

                // Create y-axis scale mapping numberkilled -> pixel again
                count_scale = d3.scale.linear()
                    .range([height, margin])
                    .domain(count_extent);
            
                // Create x axis for date again
                time_axis = d3.svg.axis()
                    .scale(time_scale)
                    .ticks(d3.time.years, 1);

                // Create y axis for numberKill again
                count_axis = d3.svg.axis()
                    .scale(count_scale)
                    .tickFormat(d3.format("d"))
                    .orient("left");
                    
                // Select the section we want to apply our changes to
                var svg = d3.select("body").select("#line_graph").select("svg").transition();

                // Define the line
                var newValueline = d3.svg.line()
                    .x(function(d) { return time_scale(d.key); })
                    .y(function(d) { return count_scale(d.values); });

            // Make the changes
                svg.select(".line")   // change the line
                    .duration(750)
                    .attr("d", newValueline(filteredCountryData[0].values));
                svg.select(".x.axis") // change the x axis
                    .duration(750)
                    .call(time_axis) // rotate the x axis tick labels
                    .selectAll("text")	
                        .style("text-anchor", "end")
                        .attr("dx", "-.8em")
                        .attr("dy", ".15em")
                        .attr("transform", "rotate(-65)");
                svg.select(".y.axis") // change the y axis
                    .duration(750)
                    .call(count_axis);
                            
                // Selecting the svg
                var circles =  d3.select('svg').selectAll("circle")
                                    .data(filteredCountryData[0].values);

                // Enter the circles
                circles.enter().append("circle")

                //(scatter plot update) find all the "circle" and move it to a location via x and y using scale function
                circles
                    .attr('cx', function(d) {
                    return time_scale(d.key);
                    })
                    .attr('cy', function(d) {
                    return count_scale(d.values);
                    })
                    .attr('r', radius)
                    .attr('fill', color)
                    .on("mouseover", function(d) {	
                        div.transition()		
                            .duration(200)		
                            .style("opacity", .9);		
                        div	.html( 
                            "<p> <strong> " + d.key.getFullYear() + "</strong>" + "<br>" + "# killed: " + d.values + "</p>")	
                            .style("left", (d3.event.pageX) + "px")		
                            .style("top", (d3.event.pageY - 28) + "px");	
                        })
                    .on("mouseout", function(d) {		
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0);	
                    });		

                    // remove the old circles
                    circles.exit().remove(); 

                    //add line graph title
                    d3.select("body").select("#line_graph")
                        .select("h2")
                        .text("Total Number of People Killed by Terrorist attacks (" + startingYear + " - " + endingYear + ") in " + country)
                        
                    //add map title
                    d3.select("body").select("#map")
                        .select("h2")
                        .text("Location of terrorist attack(s) in " + country)
                        
                    }
                    
        };
}
