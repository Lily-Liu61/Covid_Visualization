const currentPage = window.location.pathname;

mapboxgl.accessToken = 'pk.eyJ1IjoibGlseTA3IiwiYSI6ImNta3lpYTg3dzA3angzZnE3eHd0YTViZG4ifQ.f4GE26SsfN5fKe_R8KimlA';

if (currentPage.includes('map1.html')) {
    initChoroplethMap();
} else if (currentPage.includes('map2.html')) {
    initProportionalMap();
}

// Map 1: Choropleth Map
function initChoroplethMap() {
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: 3.5,
        center: [-96, 37.8],
        projection: 'albers'
    });

    // Legend - Rates
    const legend = document.getElementById('legend');
    const layers = ['0-5', '5-10', '10-20', '20-35', '35-50', '50-65', '65-80', '80+'];
    const colors = ['#ffffe5', '#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026', '#800026'];

    legend.innerHTML = "<h4>Covid Rate (%)</h4>";
    for (let i = 0; i < layers.length; i++) {
        const item = document.createElement('div');
        const key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = colors[i];
        const value = document.createElement('span');
        value.innerHTML = layers[i];
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
    }

    map.on('load', () => {
        map.addSource('covid', {
            type: 'geojson',
            data: 'assets/us-covid-2020-rates.json'
        });

        map.addLayer({
            id: 'covid-rate',
            type: 'fill',
            source: 'covid',
            paint: {
                'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'rates'],
                    0,  '#ffffe5',
                    5,  '#ffffb2',
                    10, '#fed976',
                    20, '#feb24c',
                    35, '#fd8d3c',
                    50, '#f03b20',
                    65, '#bd0026',
                    80, '#800026'
                ],
                'fill-opacity': 0.75
            }
        });

        map.addLayer({
            id: 'border',
            type: 'line',
            source: 'covid',
            paint: {
                'line-color': '#000000',
                'line-width': 1
            }
        });
    });

    map.on('mousemove', ({point}) => {
        const features = map.queryRenderedFeatures(point, {
            layers: ['covid-rate']
        });
        document.getElementById('text-description').innerHTML = features.length ?
            `<h3>${features[0].properties.county}</h3>
             <p><strong><em>${features[0].properties.rates.toFixed(2)}%</em></strong></p>` :
            `<p>Hover over a county!</p>`;
    });
}

//Map 2: Proportional Symbols Map
function initProportionalMap() {
    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v11',
        zoom: 3.5,
        center: [-96, 37.8],
        projection: 'albers'
    });

    const grades = [100, 1000, 10000, 50000, 100000];
    const colors = ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'];
    const radii = [5, 10, 15, 20, 25];

    const legend = document.getElementById('legend');
    legend.innerHTML = "<h4>Cases</h4>";

    for (let i = 0; i < grades.length; i++) {
        const item = document.createElement('div');
        item.className = 'break';

        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.style.backgroundColor = colors[i];
        const dotRadius = 2 * radii[i];
        dot.style.width = dotRadius + 'px';
        dot.style.height = dotRadius + 'px';

        const label = document.createElement('span');
        label.className = 'dot-label';
        label.style.top = (dotRadius / 2) + 'px';
        label.innerHTML = grades[i].toLocaleString();

        item.appendChild(dot);
        item.appendChild(label);
        legend.appendChild(item);
    }

    map.on('load', () => {
        map.addSource('covid-cases', {
            type: 'geojson',
            data: 'assets/us-covid-2020-counts.json'
        });

        map.addLayer({
            id: 'covid-point',
            type: 'circle',
            source: 'covid-cases',
            paint: {
                'circle-radius': {
                    property: 'cases',
                    stops: [
                        [grades[0], radii[0]],
                        [grades[1], radii[1]],
                        [grades[2], radii[2]],
                        [grades[3], radii[3]],
                        [grades[4], radii[4]]
                    ]
                },
                'circle-color': {
                    property: 'cases',
                    stops: [
                        [grades[0], colors[0]],
                        [grades[1], colors[1]],
                        [grades[2], colors[2]],
                        [grades[3], colors[3]],
                        [grades[4], colors[4]]
                    ]
                },
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                'circle-opacity': 0.6
            }
        });
    });
    map.on('click', 'covid-point', (event) => {
        new mapboxgl.Popup()
            .setLngLat(event.features[0].geometry.coordinates)
            .setHTML(`<strong>County:</strong> ${event.features[0].properties.county}<br>
                      <strong>Cases:</strong> ${event.features[0].properties.cases.toLocaleString()}`)
            .addTo(map);
    });

}

