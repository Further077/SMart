var vishna = (function() {

    var urls = {      //API urls
        crimes  : "http://localhost:8080/crimes.json"
    },
        thread = /^(item[?]id[=][0-9]+)/,               //regexp for HN thread posts
        w = Math.max( $(window).width(), 960 ),  //width
        h = Math.max( $(window).height(), 600 ), //height
        m = 20,                                         //margin
        center = {                                      //gravity center
            x : ( w - m ) / 2,
            y : ( h - m ) / 2
        },
        posts,        //content
        next,         //next page
        o,            //opacity scale
        r,            //radius scale
        z,            //color scale
        g,            //gravity scale
        t = {         //time factors
            minutes : 1,
            hour    : 60,
            hours   : 60,
            day     : 1440,
            days    : 1440
        },
        gravity  = -0.01,//gravity constants
        damper   = 0.2,
        friction = 0.9,
        force = d3       //gravity engine
            .layout
            .force()
            .size([ w - m,
                    h - m ]),
        svg = d3         //container
            .select("body article")
            .append("svg")
            .attr("height", h + "px")
            .attr("width", w + "px"),
        circles,         //data representation
        tooltip = CustomTooltip( "posts_tooltip", 240 );

    function init() {
        
            load( "http://localhost:8080/crimes.json", function() {
                launch();

            });

    }

    function update( category ) {
        if ( "http://localhost:8080/crimes.json" ) {
            load( "http://localhost:8080/crimes.json", function() {
                circles
                    .transition()
                    .duration( 750 )
                    .attr("r", function(d) { return r(d) + 100; })
                    .delay( 250 )
                    .style("opacity", function(d) { return 0; })
                    .remove();

                launch();
            });
        }
    }

    function load( url, callback ){
        $.getJSON(url, function( data ) {

            posts = data.items;
            next = posts.pop();

            posts.map( function(d) {
                var comments = 0,
                    score    = parseInt( d.score ),
                    time     = "0";

                d.comments = comments ? comments : 0;
                d.score = score ? score : 0;
                d.time = 100; // number * factor


                return d;
            });

            // Defining the scales
            r = d3.scale.linear()
                .domain([ d3.min(posts, function(d) { return d.score; }),
                          d3.max(posts, function(d) { return d.score; }) ])
                .range([ 10, 130 ])
                .clamp(true);

            z = d3.scale.linear()
                .domain([ d3.min(posts, function(d) { return d.comments; }),
                          d3.max(posts, function(d) { return d.comments; }) ])
                .range([ '#ff7f0e', '#ff7f0e' ]);

            o = d3.scale.linear()
                .domain([ d3.min(posts, function(d) { return d.time; }),
                          d3.max(posts, function(d) { return d.time; }) ])
                .range([ 1, 0.2 ]);

            g = function(d) { return -r(d) * r(d) / 2.5; };

            callback();
        });
    }

    function launch() {

        force
            .nodes( posts );

        circles = svg
            .append("g")
            .attr("id", "circles")
            .selectAll("a")
            .data(force.nodes());

        // Init all circles at random places on the canvas
        force.nodes().forEach( function(d, i) {
            d.x = Math.random() * w;
            d.y = Math.random() * h;
        });

        var node = circles
                .enter()
                .append("a")
                .attr("xlink:href", function(d) { return d.url; })
                .append("circle")
                .attr("r", 0)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("fill", function(d) { return z( d.comments ); })
                .attr("stroke-width", 2)
                .attr("stroke", function(d) { return d3.rgb(z( d.comments )).darker(); })
                .attr("id", function(d) { return "5" })
                .attr("title", function(d) { return d.title; })
                .style("opacity", function(d) { return o( d.time ); })
                .on("mouseover", function(d, i) { force.resume(); highlight( d, i, this ); })
                .on("mouseout", function(d, i) { downlight( d, i, this ); })
                .attr("text-anchor", "middle")
                .text(function(d) { return d.title;})
                ;

        d3.selectAll("circle")
            .transition()
            .delay(function(d, i) { return i * 10; })
            .duration( 1000 )
            .attr("r", function(d) { return r( d.score ); });

        loadGravity( moveCenter );

        //Loads gravity
        function loadGravity( generator ) {
            force
                .gravity(gravity)
                .charge( function(d) { return g( d.score ); })
                .friction(friction)
                .on("tick", function(e) {
                    generator(e.alpha);
                    node
                        .attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
                }).start();
        }

        // Generates a gravitational point in the middle
        function moveCenter( alpha ) {
            force.nodes().forEach(function(d) {
                d.x = d.x + (center.x - d.x) * (damper + 0.02) * alpha;
                d.y = d.y + (center.y - d.y) * (damper + 0.02) * alpha;
            });
        }
    }

    function legend() {

        var linearGradient = svg.append("defs")
                .append("linearGradient")
                .attr("id", "legendGradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")
                .attr("spreadMethod", "pad");

        linearGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#ff7f0c")
            .attr("stop-opacity", "0.1");

        linearGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ff7f0c")
            .attr("stop-opacity", "1");

        var legend = svg.append("g")
                .attr("id", "legend");

        legend
            .append("rect")
            .attr("x", "20")
            .attr("y", "20")
            .attr("width", "20")
            .attr("height", "200")
            .attr("style", "fill:url(#legendGradient);");

        legend
            .append("text")
            .attr("x", 45)
            .attr("y", 30)
            .text("Oldest");

        legend
            .append("text")
            .attr("x", 45)
            .attr("y", 220)
            .text("Newest");

    }

    function highlight( data, i, element ) {
        d3.select( element ).attr( "stroke", "black" );

        var description ='<span class=\"title\"><a href=\"' + data.url + '\">' + data.title + '</a></span><br/>' +
                       data.description + "<br/>" +
                      '<a href=\"http://www.cityofchicago.org/city/en/about/wards/' +data.title.substring(5, data.title.length) + '/ward_'+data.title.substring(5, data.title.length) +'_boundaries.html\">View Map</a>';

        tooltip.showTooltip(description, d3.event);
    }

    function downlight( data, i, element ) {
        d3.select(element).attr("stroke", function(d) { return d3.rgb( z( d.comments )).darker(); });
    }

    //Register category selectors
    $("a.category").on("click", function(e) { update( $(this).attr("value") ); });

    return {
        categories : [""],
        init : init,
        update : update
    };
})();

vishna.init();