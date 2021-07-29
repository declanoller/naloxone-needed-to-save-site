
class MapLegend {


  constructor(map_div_id, legend_div_id, map_data, update_fn) {

    this.plot_w = 500;
    this.plot_h = this.plot_w/1.6;

    this.margin = {top: 0*this.plot_h/6, right: 0*this.plot_w/12, bottom: 0*this.plot_h/3, left: 0*this.plot_w/5};

    this.svg_w = this.plot_w + this.margin.left + this.margin.right;
    this.svg_h = this.plot_h + this.margin.top + this.margin.bottom;

    // Define linear scale for output
    // more washed out colors: ['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3']
    // really vivid colors: ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00']
    // saturated but less flashy: ['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0']
    // from: https://colorbrewer2.org/
    var color_list = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00'];
    var colorMap = d3.scale.linear().range(color_list);

    this.projection = d3.geo.albersUsa()
    				   .translate([this.plot_w/2, this.plot_h/2])    // translate to center of screen
    				   .scale([1.2*this.plot_w]);          // scale things down so see entire US

    // Define path generator
    this.path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
    		  	 .projection(this.projection);  // tell path generator to use albersUsa projection


    this.legendText = ["Fentanyl", "Fentanyl/RX", "Fentanyl/heroin", "Heroin/RX", "RX", "Heroin"];
    var legendText = this.legendText;
    colorMap.domain([...Array(legendText.length).keys()]); // setting the range of the input data
    //colorMap.domain(this.legendText);

    //Create SVG element and append map to the SVG
    this.svg_map = d3.select(map_div_id)
      .classed("svg-container", true)
      .append("svg")
        .attr("viewBox", (-this.margin.left) + " " + (-this.margin.top) + " " + this.svg_w + " " + this.svg_h)
        .classed("svg-content-responsive", true)
      .append("g");

    // map_data should now be json.features
    // Bind the data to the SVG and create one path per GeoJSON feature
    this.svg_map.selectAll("path")
                    	.data(map_data)
                    	.enter()
                    	.append("path")
                    	.attr("d", this.path)
                      .attr("id", "map_path")
                    	.style("stroke", "black")
                    	.style("stroke-width", "0.5")
                    	.style("fill", function(d) {

                    	// Get data value
                    	var value = d.properties.epidemic_type;
                      //If value exists…
                    	if ((legendText).includes(value)) {
                        var ind = legendText.indexOf(value);
                        if (d.properties.model_nonmodel == 'model'){
                          return color_list[ind];
                        }
                        else {
                          return 'url(#diagonalHatch_' + ind + ')';
                        }
                    	} else {
                    	  //If value is undefined…
                    	  return "white";
                    	}
                    });

    this.svg_map.selectAll("path")

        .on("click", function(d) {
                  update_fn(d.properties.name);
                  updateSelected(d.properties.name);
        });


      // Add hashing
      var defs = this.svg_map
          .append('defs');

      color_list.forEach((d,i) => {

          defs.append('pattern')
            .attr('id', 'diagonalHatch_' + i)
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4)

            .append('rect')
            .attr('width', 4)
            .attr('height', 4)
            .attr('x', 0)
            .attr('x', 0)
            .attr('fill', d);

          d3.select('pattern#diagonalHatch_' + i).append('path')
            .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
            .attr('stroke', '#000000')
            .attr('stroke-width', 0.8);
      });

    // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
    this.legend = d3.select(legend_div_id).append("svg")
                .attr("class", "legend")
                .attr("width", 160)
                .attr("height", 100)
                .selectAll("g")
                .data(colorMap.domain().slice())
                .enter()
                .append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        this.legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", colorMap);

        this.legend.append("text")
            .data(this.legendText)
              .attr("x", 24)
              .attr("y", 9)
              .attr("dy", ".35em")
              .text(function(d) { return d; });

  }

}
  function updateSelected(new_state){

    d3.selectAll("#map_path")
          .style("stroke-width", function(d){
            return (d.properties.name == new_state) ? 3 : 0.5; });
  }
