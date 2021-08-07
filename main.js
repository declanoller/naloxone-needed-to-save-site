function stateStatsOverview(data, state){

  if (Object.keys(data).includes(state)) {
    var text = ("<br/>Total deaths: " + data[state]["data_overview"]["yearly_deaths"]);
    text += ("<br/>Fentanyl deaths: " + data[state]["data_overview"]["yearly_fentanyl_deaths"]);
    text += ("<br/>Heroin deaths: " + data[state]["data_overview"]["yearly_heroin_deaths"]);
    text += ("<br/>prescriber-based kits deaths: " + data[state]["data_overview"]["yearly_rx_deaths"]);
    text += ("<br/>community based program kits distributed: " + data[state]["data_overview"]["yearly_THN_kits_dist"]);
    text += ("<br/>Naloxone kits used: " + data[state]["data_overview"]["kits_used"]);

    return text;

  }
  else {
    return '';
  }


}





d3.json("all_states.json", function(error, nns_data) {
    // List of groups (here I have one group per column)
    //console.log(nns_data);
    //console.log(Object.keys(nns_data));
    var statesWithData = Object.keys(nns_data);

    var state_selected = statesWithData[0];
    var quick_info_title = "Quick stats: ";
    var state_sel = d3.select("#stats_state_label")
                    .append("text")
                    .text(quick_info_title + state_selected);

    var state_info = d3.select("#state_stats_overview")
                    .append("text")
                    .html(stateStatsOverview(nns_data, state_selected));








// Load GeoJSON data and merge with states data
d3.json("us-states.json", function(geo_json_data) {



// Find the corresponding state inside the GeoJSON
for (var j = 0; j < geo_json_data.features.length; j++)  {
	var geo_json_dataState = geo_json_data.features[j].properties.name;

    if (statesWithData.includes(geo_json_dataState)) {
      var epidemic_type = nns_data[geo_json_dataState]["epidemic_type"];
      var model_nonmodel = nns_data[geo_json_dataState]["model_nonmodel"];
      geo_json_data.features[j].properties.epidemic_type = epidemic_type;
      geo_json_data.features[j].properties.model_nonmodel = model_nonmodel;
    }
    else {
      geo_json_data.features[j].properties.epidemic_type = "Unknown";
      geo_json_data.features[j].properties.model_nonmodel = 'nonmodel';
    }

}



var plot_1 = new PlotNNS("#plot_1", nns_data, "deaths_averted_curve", "community based program kits  distributed", "Deaths averted", state_selected);
var plot_2 = new PlotNNS("#plot_2", nns_data, "deaths_averted_RX_curve", "prescriber-based kits distributed", "Deaths averted", state_selected);
var plot_3 = new PlotNNS("#plot_3", nns_data, "deaths_averted_standing_order_curve", "pharmacy-initiated kits distributed", "Deaths averted", state_selected);

var plot_4 = new PlotNNS("#plot_4", nns_data, "pNX_vary_THN", "community based program kits distributed", "Probability of naloxone use", state_selected);
var plot_5 = new PlotNNS("#plot_5", nns_data, "pNX_vary_RX", "prescriber-based kits distributed", "Probability of naloxone use", state_selected);
var plot_6 = new PlotNNS("#plot_6", nns_data, "pNX_vary_standing_order", "pharmacy-initiated kits distributed", "Probability of naloxone use", state_selected);


//////////////////////////////////
//        UPDATE FUNCTIONS
//////////////////////////////////

function update(selectedGroup) {

  if (statesWithData.includes(selectedGroup)){


    console.log('updating to state: ' + selectedGroup);
    state_selected = selectedGroup;
    state_sel.text(quick_info_title + state_selected);
    state_info.html(stateStatsOverview(nns_data, state_selected));

    d3.select('#selectButton').property('value', state_selected);

    plot_1.updateData(state_selected);
    plot_2.updateData(state_selected);
    plot_3.updateData(state_selected);
    plot_4.updateData(state_selected);
    plot_5.updateData(state_selected);
    plot_6.updateData(state_selected);

    // update non model div 
    document.getElementById("non_model_note").style.display = "none";
  }else{
    // update non model div 
    document.getElementById("non_model_note").style.display = "block";
  }

}

var map_legend_obj = new MapLegend("#state_map", "#state_map_legend_box", geo_json_data.features, update);


// add the options to the button
d3.select("#selectButton")
  .selectAll('myOptions')
  .data(geo_json_data.features)
  .enter()
  .append('option')
  .text(function (d) { return d.properties.name; }) // text showed in the menu
  .attr("value", function (d) { return d.properties.name; }) // corresponding value returned by the button

d3.select('#selectButton').property('value', state_selected);

// When the button is changed, run the updateChart function
d3.select("#selectButton").on("change", function(d) {
    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value");
    // run the updateChart function with this selected option
    update(selectedOption);
})



  update(state_selected);


	});//us-states.json


});//all_states.csv
