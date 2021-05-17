//Url
var loc = window.location.href;
var Url = loc + "/data/samples.json";
console.log(`URL: ${Url}`);
//Variables
var meta = null;
var samples = null;
var otu_Id_to_degrees = 0;

if (Url.includes("index.html"))
	Url = Url.replace("index.html", "");

d3.json(Url).then(function (data_from_samples) {
	meta = data_from_samples.metadata;
    samples = data_from_samples.samples;
	
	var maximum_ID = 1;

	samples.forEach(sample => {

		var new_maximum_ID = Math.max(sample.otu_ids);
		
        if (new_maximum_ID > maximum_ID)
			maximum_ID = new_maximum_ID;

	});
	otu_Id_to_degrees = 0.9 / maximum_ID;

    add_selection_options(data_from_samples.names);
});


function add_selection_options(names) {
    console.log('Adding Selection Options');
	var target_body = d3.select("#selDataset");

	target_body.selectAll("option")
		.data(names)
		.enter()
		.append("option")
		.attr("value", data => data)
		.text(data => data);

	optionChanged();
}

function optionChanged() {
    
    var value_property = d3.select("#selDataset").property("value");
    console.log(`OptionChanged Function. Value: ${value_property}`);
    if (samples != null) {
		var len = samples.length;
		var i;
		for (i = 0; i < len; i++)
			if (value_property == samples[i].id) {
				update_bar_chart(samples[i]);
				update_bubble_chart(samples[i]);
				break;
			}
	}
	if (meta != null) {
		var len = meta.length;
		var i;
		for (i = 0; i < len; i++)
			if (value_property == meta[i].id) {
				update_selection_table(meta[i]);
				break;
			}
	}
}

function update_selection_table(meta) {
    console.log('Update selection table Function');
	var target_body = d3.select("#sample-meta");
	target_body.text("");
	if (meta == null) return;

	var text = [
		`id: ${meta.id}`,
		`ethnicity: ${meta.ethnicity}`,
		`gender: ${meta.gender}`,
		`age: ${meta.age}`,
		`location: ${meta.location}`,
		`bbtype: ${meta.bbtype}`,
		`wfreq: ${meta.wfreq}`
	];
	target_body.append("body").html(text.join("<br>"));
}

function update_bar_chart(sample) {
    console.log('Update Bar Chart Function');
	if (sample == null) {
		d3.select("bar").text("");
		return;
	}

    var top_ten_OTS_found = sorttop_ten_OTS_found(sample);

	var data = [{
		x: top_ten_OTS_found.map(object => object.sample_values),
        y: top_ten_OTS_found.map(object => `OTU ${object.otu_ids} `),
		
        text: top_ten_OTS_found.map(object => object.otu_labels.split(";").join("<br>")),
		marker: {
			color: top_ten_OTS_found.map(object => OTU_ID_to_RGB(object.otu_ids))
		},

		type: "bar",
		orientation: "h"
	}];

    var layout = {
		title: "Top 10 OTUs in Sample",
	};

	Plotly.newPlot("bar", data, layout);
}

function sorttop_ten_OTS_found(sample) {
    console.log('Sort Top Ten Function');
	var sorted = [];
	var length = sample.sample_values.length;
	var i;
	for (i = 0; i < length; i++)
		sorted.push({
			otu_ids: sample.otu_ids[i],
			otu_labels: sample.otu_labels[i],
			sample_values: sample.sample_values[i]
		});
	sorted = sorted.sort((a, b) => b.sample_values - a.sample_values);
	if (length > 10)
		sorted = sorted.slice(0, 10);
	sorted = sorted.reverse();
	return sorted;
}

function update_bubble_chart(sample) {
    console.log('Update the Bubble Chart Function');
	if (sample == null) {
		d3.select("bubble").text("");
		return;
	}
	var data = [{
		x: sample.otu_ids,
		y: sample.sample_values,
		text: sample.otu_labels.map(object => object.split(";").join("<br>")),
		mode: 'markers',
		marker: {
			color: sample.otu_ids.map(object => OTU_ID_to_RGB(object)),
			size: sample.sample_values
		}
	}];
	var layout = {
		title: `Test Subject ${sample.id} Samples`
	};
	Plotly.newPlot("bubble", data, layout);
}


 function OTU_ID_to_RGB(id) {
     console.log('ID to RGB Function');
	var color = HSV_to_RGB(id * otu_Id_to_degrees, 1.0, 1.0);
	return `rgb(${color.r},${color.g},${color.b})`;
}

// https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
function HSV_to_RGB(h, s, v) {
    console.log('HSV to RGB Function');
	var r, g, b, i, f, p, q, t;

	if (arguments.length === 1) {
		s = h.s, v = h.v, h = h.h;
	}

	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);

	switch (i % 6) {

		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}