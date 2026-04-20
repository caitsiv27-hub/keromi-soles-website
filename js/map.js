/* =============================================
   KEROMI SOLES — AFRICA D3 MAP
   ============================================= */

(async function africaMap() {
  const container = document.getElementById('africa-map-container');
  const tooltip = document.getElementById('map-tooltip');
  if (!container) return;

  // SADC country ISO numeric codes
  const SADC_COUNTRIES = {
    710: { name: 'South Africa', primary: true },
    716: { name: 'Zimbabwe', primary: true },
    894: { name: 'Zambia', primary: true },
    72:  { name: 'Botswana', primary: true },
    508: { name: 'Mozambique', primary: true },
    516: { name: 'Namibia', primary: false },
    426: { name: 'Lesotho', primary: false },
    748: { name: 'Eswatini', primary: false },
    834: { name: 'Tanzania', primary: false },
    454: { name: 'Malawi', primary: false },
    24:  { name: 'Angola', primary: false },
    180: { name: 'DR Congo', primary: false },
    450: { name: 'Madagascar', primary: false },
  };

  // Africa bounding box (roughly)
  const AFRICA_IDS = new Set([
    12, 24, 50, 204, 72, 854, 108, 120, 132, 140, 144, 148, 174,
    178, 180, 204, 231, 232, 266, 270, 288, 324, 328, 384, 404,
    426, 430, 434, 450, 454, 466, 478, 480, 504, 508, 516, 562,
    566, 646, 678, 686, 694, 706, 710, 716, 724, 732, 748, 762,
    768, 788, 800, 818, 834, 894, 716, 894, 180
  ]);

  try {
    const [d3Resp, topoResp] = await Promise.all([
      new Promise(resolve => {
        // d3 and topojson are loaded via script tags; just resolve
        resolve(window.d3);
      }),
      fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(r => r.json())
    ]);

    const d3 = window.d3;
    const topojson = window.topojson;
    if (!d3 || !topojson) return fallbackMap();

    const countries = topojson.feature(topoResp, topoResp.objects.countries);
    const africaCountries = countries.features.filter(f => AFRICA_IDS.has(+f.id));

    const W = container.offsetWidth;
    const H = W * 1.1;

    const svg = d3.select('#africa-svg-map')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('width', W)
      .attr('height', H);

    const projection = d3.geoMercator()
      .fitExtent([[20, 20], [W - 20, H - 20]], { type: 'FeatureCollection', features: africaCountries });

    const path = d3.geoPath().projection(projection);

    // Subtle grid
    const defs = svg.append('defs');
    const gridPattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 20).attr('height', 20)
      .attr('patternUnits', 'userSpaceOnUse');
    gridPattern.append('circle')
      .attr('cx', 10).attr('cy', 10).attr('r', 0.6)
      .attr('fill', 'rgba(255,255,255,0.08)');

    svg.append('rect')
      .attr('width', W).attr('height', H)
      .attr('fill', 'url(#grid)');

    // Draw countries
    svg.selectAll('.map-country')
      .data(africaCountries)
      .enter()
      .append('path')
      .attr('class', d => {
        const id = +d.id;
        if (SADC_COUNTRIES[id]?.primary) return 'map-country primary';
        if (SADC_COUNTRIES[id]) return 'map-country sadc';
        return 'map-country';
      })
      .attr('d', path)
      .on('mouseenter', function(event, d) {
        const id = +d.id;
        const info = SADC_COUNTRIES[id];
        if (!info) return;
        tooltip.textContent = info.name + (info.primary ? ' ★' : '');
        tooltip.style.opacity = '1';
        tooltip.style.left = (event.offsetX + 12) + 'px';
        tooltip.style.top = (event.offsetY - 30) + 'px';
      })
      .on('mousemove', function(event) {
        tooltip.style.left = (event.offsetX + 12) + 'px';
        tooltip.style.top = (event.offsetY - 30) + 'px';
      })
      .on('mouseleave', function() {
        tooltip.style.opacity = '0';
      });

    // Add glow circles on primary countries
    africaCountries
      .filter(d => SADC_COUNTRIES[+d.id]?.primary)
      .forEach(d => {
        const centroid = path.centroid(d);
        if (!centroid || isNaN(centroid[0])) return;
        // Pulsing dot
        const g = svg.append('g').attr('transform', `translate(${centroid[0]},${centroid[1]})`);
        g.append('circle')
          .attr('r', 12)
          .attr('fill', 'rgba(232,25,122,0.12)')
          .attr('class', 'pulse-ring');
        g.append('circle')
          .attr('r', 4)
          .attr('fill', '#e8197a')
          .attr('opacity', 0.9);
        // Animate pulse
        function pulsate(el) {
          d3.select(el)
            .transition().duration(1500).ease(d3.easeSinInOut)
            .attr('r', 18).attr('opacity', 0)
            .transition().duration(0)
            .attr('r', 10).attr('opacity', 0.15)
            .on('end', function() { pulsate(this); });
        }
        pulsate(g.select('.pulse-ring').node());
      });

  } catch (err) {
    console.warn('Map load failed:', err);
    fallbackMap();
  }

  function fallbackMap() {
    // Minimal SVG Africa silhouette fallback
    const svg = document.getElementById('africa-svg-map');
    svg.innerHTML = `
      <text x="50%" y="50%" text-anchor="middle" 
        fill="rgba(232,25,122,0.4)" font-family="monospace" font-size="12">
        [ Interactive Africa map ]
      </text>`;
  }
})();
