const svg= d3.select('svg');
const g= svg.append('g');

const projection = d3.geoEquirectangular();
const pathGenerator = d3.geoPath().projection(projection);

let color = d3.scaleOrdinal(d3.schemeTableau10);

Promise.all([

  d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/110m.tsv'),
  d3.json('https://unpkg.com/world-atlas@1/world/110m.json'),
  d3.csv('https://covid.ourworldindata.org/data/ecdc/total_deaths.csv')
  ]).then(([tsvData, topoJSONdata, covidData]) => {
    
    const rowById = tsvData.reduce((accumulator, d) => {
        accumulator[d.iso_n3] = d;
        return accumulator;
    }, {});

    const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);
    countries.features.forEach(d => {
        Object.assign(d.properties, rowById[d.id]);
    });

    svg.selectAll('path').data(countries.features)
      .enter().append('path')
      .attr('fill', d=> color(d.properties.DM))
        .attr('class', 'country')
        .attr('d', d=> pathGenerator(d))
        .attr('fill', d=> color(d.properties.name))
      .append('title')
        .text(d => d=>d.properties.name + ': ' +d.properties.Total_Cases+' cases | ' +d.properties.deaths 
        +' deaths | '+d.properties.Lat14_cases +' cases in the last 14 days'); 
});
