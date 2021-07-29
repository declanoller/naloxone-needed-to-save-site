

class PlotNNS {


  constructor(div_id, data, plot_key, xlabel, ylabel, init_state) {

    this.plot_w = 500;
    this.plot_h = 300;

    this.margin = {top: this.plot_h/6, right: this.plot_w/12, bottom: this.plot_h/3, left: this.plot_w/5};

    this.svg_w = this.plot_w + this.margin.left + this.margin.right;
    this.svg_h = this.plot_h + this.margin.top + this.margin.bottom;

    var allGroup = ["IA", "MA"];

    this.data = data;
    this.plot_key = plot_key;
    this.cur_state = init_state;
    this.xlabel = xlabel;
    this.ylabel = ylabel;

    //this.plot_w = Math.round(0.9*(d3.select(div_id).node().getBoundingClientRect().width - (this.margin.left + this.margin.right)));
    //this.plot_h = Math.round(this.plot_w/1.6);
    //console.log(this.plot_w);

    this.svg_plot = d3.select(div_id)
      .classed("svg-container", true)
      .append("svg")
        .attr("id", this.svg_id)
        .attr("viewBox", (-this.margin.left) + " " + (-this.margin.top) + " " + this.svg_w + " " + this.svg_h)
        .classed("svg-content-responsive", true)
      .append("g");

    var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

    // Initialise a X axis:
    this.x = d3.scaleLinear().range([0,this.plot_w]);
    this.xAxis = d3.axisBottom().scale(this.x);
    this.svg_plot.append("g")
      .attr("transform", "translate(0," + this.plot_h + ")")
      .attr("class","myXaxis");

    /*
      .selectAll("text")
      .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    */

    // Initialize an Y axis
    this.y = d3.scaleLinear().range([this.plot_h, 0]);
    this.yAxis = d3.axisLeft().scale(this.y);
    this.svg_plot.append("g")
      .attr("class","myYaxis");

    // text label for the x axis
    this.svg_plot.append("text")
    .attr("transform",
          "translate(" + (this.plot_w/2) + " ," +
                         (this.plot_h + 0.9*this.margin.bottom) + ")")
    .style("text-anchor", "middle")
    .text(this.xlabel);

    // text label for the y axis
    this.svg_plot.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - this.margin.left)
        .attr("x",0 - (this.plot_h/2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(this.ylabel);

    var x = this.x;
    var y = this.y;

    if (this.plot_key in this.data[this.cur_state]){
      var plot_data = this.data[this.cur_state][this.plot_key]["cf_vs_kits_dist"];
    }
    else {
      var plot_data = {kits: [0, 1], lc: [0, 0], m: [0, 0], uc: [0, 0]};
    }

    //var plot_data = this.data[this.cur_state][this.plot_key]["cf_vs_kits_dist"];


    // Show confidence interval
    this.plot_CI = this.svg_plot
                      .append("path")
                      .datum(plot_data)
                      .attr("fill", "#cce5df")
                      .attr("stroke", "none")
                      .attr("opacity", 0.7)
                      .attr("d", d3.area()
                        .x(function(d) { return x(d.kits); })
                        .y0(function(d) { return y(d.uc); })
                        .y1(function(d) { return y(Math.max(0, d.lc)); })
                      );

    // Add the line
    this.plot_curve = this.svg_plot
                        .append("path")
                        .datum(plot_data)
                        .attr("fill", "none")
                        .attr("stroke", "steelblue")
                        .attr("stroke-width", 1.5)
                        .attr("d", d3.line()
                          .x(function(d) { return x(d.kits) })
                          .y(function(d) { return y(d.m) })
                        );




  }



  updateData(newState) {

    this.cur_state = newState;
    //var plot_data = this.data[this.cur_state][this.plot_key]["cf_vs_kits_dist"];
    if (this.plot_key in this.data[this.cur_state]){
      var plot_data = this.data[this.cur_state][this.plot_key]["cf_vs_kits_dist"];
    }
    else {
      var plot_data = {kits: [0, 1], lc: [0, 0], m: [0, 0], uc: [0, 0]};
    }

    this.x.domain([0, d3.max(plot_data, function(d) { return d.kits }) ]);
    this.svg_plot.selectAll(".myXaxis").transition()
     .duration(1000)
     .call(this.xAxis).selectAll("text")
     .style("text-anchor", "end")
       .attr("dx", "-.8em")
       .attr("dy", ".15em")
       .attr("transform", "rotate(-45)");

    // create the Y axis
    this.y.domain([0, d3.max(plot_data, function(d) { return d.uc  }) ]);
    this.svg_plot.selectAll(".myYaxis")
     .transition()
     .duration(1000)
     .call(this.yAxis);

    var x = this.x;
    var y = this.y;


    // Show confidence interval
    this.plot_CI.datum(plot_data)
                .transition()
                .duration(500)
                 .attr("d", d3.area()
                   .x(function(d) { return x(d.kits); })
                   .y0(function(d) { return y(d.uc); })
                   .y1(function(d) { return y(Math.max(0, d.lc)); })
                 );

    // Add the line
    this.plot_curve.datum(plot_data)
                   .transition()
                   .duration(500)
                   .attr("d", d3.line()
                     .x(function(d) { return x(d.kits); })
                     .y(function(d) { return y(d.m); })
                   );

  }



}
