var run = (function() {

    var urls = {      
        news  : "crimes2005.json"
    },
        thread = /^(item[?]id[=][0-9]+)/,               
        w = Math.max( $(window).width() -50, 960 ),  //width
        h = Math.max( $(window).height() -50, 600 ), //height
        m = 20,                                         //margin
        center = {                                      //gravity center
            x : ( w - m ) / 2,
            y : ( h - m  ) / 2
        },
        posts,        
        next,         
        o,            
        r,            
        z,            
        g,            
      
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
        
            load( "crimes2005.json", function() {
                launch();

            });

    }

    function update( category ) {
        if ( "crimes2005.json" ) {
            load( "crimes2005.json", function() {
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
                d.time = 100;
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
                .range([ '#00000', '#00000' ]);

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
            d.y = Math.random() * 200;
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
                .call(force.drag);

 var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g");

// A copy of the text with a thick white stroke for legibility.
text.append("svg:text")
    .attr("x", 0)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return d.title; });

text.append("svg:text")
    .attr("x", 0)
    .attr("y", ".31em")
    .style("color", "white")
    .text(function(d) { return d.title; });






        d3.selectAll("circle")
            .transition()
            .delay(function(d, i) { return i * 10; })
            .duration( 1000 )
            .attr("r", function(d) { return r( d.score ); });

        // d3.selectAll("text")
        //     .transition()
        //     .delay(function(d, i) { return i * 10; })
        //     .duration( 1000 )
        //     .attr("r", function(d) { return r( d.score ); });

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
                    text
                        .attr("x", function(d) {return d.x-20;})
                        .attr("y", function(d) {return d.y;})
                        .attr("transform", function(d) {
                              return "translate(" + d.x + "," + d.y + ")";
                          });
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
        // categories : [""],
         init : init,
        // update : update
    };
})();

function CalculateStarPoints(centerX, centerY, arms, outerRadius, innerRadius)
{
   var results = "";
 
   var angle = Math.PI / arms;
 
   for (var i = 0; i < 2 * arms; i++)
   {
      // Use outer or inner radius depending on what iteration we are in.
      var r = (i & 1) == 0 ? outerRadius : innerRadius;
      
      var currX = centerX + Math.cos(i * angle) * r;
      var currY = centerY + Math.sin(i * angle) * r;
 
      // Our first time we simply append the coordinates, subsequet times
      // we append a ", " to distinguish each coordinate pair.
      if (i == 0)
      {
         results = currX + "," + currY;
      }
      else
      {
         results += ", " + currX + "," + currY;
      }
   }
 
   return results;
}

run.init();