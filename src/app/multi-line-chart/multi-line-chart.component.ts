import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';

@Component({
  selector: 'multi-line-chart',
  templateUrl: './multi-line-chart.component.html',
  styleUrls: ['./multi-line-chart.component.less'],
})
export class MultiLineChartComponent implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const rawData = `name	2000-01	2000-02	2000-03	2000-04	2000-05	2000-06	2000-07	2000-08	2000-09	2000-10	2000-11	2000-12	2001-01	2001-02	2001-03	2001-04	2001-05	2001-06	2001-07	2001-08	2001-09	2001-10	2001-11	2001-12	2002-01	2002-02	2002-03	2002-04	2002-05	2002-06	2002-07	2002-08	2002-09	2002-10	2002-11	2002-12	2003-01	2003-02	2003-03	2003-04	2003-05	2003-06	2003-07	2003-08	2003-09	2003-10	2003-11	2003-12	2004-01	2004-02	2004-03	2004-04	2004-05	2004-06	2004-07	2004-08	2004-09	2004-10	2004-11	2004-12	2005-01	2005-02	2005-03	2005-04	2005-05	2005-06	2005-07	2005-08	2005-09	2005-10	2005-11	2005-12	2006-01	2006-02	2006-03	2006-04	2006-05	2006-06	2006-07	2006-08	2006-09	2006-10	2006-11	2006-12	2007-01	2007-02	2007-03	2007-04	2007-05	2007-06	2007-07	2007-08	2007-09	2007-10	2007-11	2007-12	2008-01	2008-02	2008-03	2008-04	2008-05	2008-06	2008-07	2008-08	2008-09	2008-10	2008-11	2008-12	2009-01	2009-02	2009-03	2009-04	2009-05	2009-06	2009-07	2009-08	2009-09	2009-10	2009-11	2009-12	2010-01	2010-02	2010-03	2010-04	2010-05	2010-06	2010-07	2010-08	2010-09	2010-10	2010-11	2010-12	2011-01	2011-02	2011-03	2011-04	2011-05	2011-06	2011-07	2011-08	2011-09	2011-10	2011-11	2011-12	2012-01	2012-02	2012-03	2012-04	2012-05	2012-06	2012-07	2012-08	2012-09	2012-10	2012-11	2012-12	2013-01	2013-02	2013-03	2013-04	2013-05	2013-06	2013-07	2013-08	2013-09	2013-10
    Bethesda-Rockville-Frederick, MD Met Div	2.6	2.6	2.6	2.6	2.7	2.7	2.7	2.6	2.6	2.6	2.6	2.6	2.7	2.7	2.8	2.8	2.9	3	3.1	3.3	3.4	3.5	3.5	3.6	3.6	3.6	3.6	3.6	3.6	3.5	3.5	3.4	3.4	3.4	3.4	3.4	3.4	3.4	3.4	3.4	3.4	3.4	3.4	3.3	3.3	3.3	3.3	3.3	3.2	3.2	3.2	3.2	3.2	3.2	3.2	3.2	3.2	3.2	3.2	3.3	3.3	3.3	3.3	3.2	3.2	3.1	3.1	3	3	3	2.9	2.9	2.8	2.8	2.8	2.8	2.9	3	3	3	2.9	2.9	2.9	2.9	2.8	2.8	2.7	2.7	2.6	2.6	2.6	2.6	2.6	2.6	2.6	2.5	2.5	2.6	2.7	2.8	2.9	3.1	3.2	3.4	3.6	3.9	4.2	4.5	4.9	5.2	5.5	5.7	5.8	5.9	6	6	6.1	6.2	6.2	6.3	6.3	6.3	6.2	6.1	6	5.9	5.9	5.9	5.9	5.9	5.8	5.8	5.7	5.6	5.5	5.5	5.5	5.6	5.6	5.6	5.6	5.5	5.4	5.4	5.3	5.3	5.3	5.3	5.3	5.3	5.3	5.3	5.2	5.2	5.2	5.2	5.2	5.2	5.1	5.2	5.3	5.5	5.5	5.3	5.2	5.2
    Boston-Cambridge-Quincy, MA NECTA Div	2.7	2.6	2.6	2.5	2.4	2.4	2.3	2.3	2.3	2.3	2.3	2.4	2.5	2.6	2.8	2.9	3	3.2	3.4	3.6	3.8	4	4.2	4.4	4.6	4.7	4.8	4.9	4.9	5	5	5	5.1	5.1	5.2	5.2	5.3	5.3	5.4	5.4	5.5	5.6	5.6	5.6	5.5	5.4	5.3	5.2	5.1	5.1	5	4.9	4.9	4.8	4.7	4.6	4.5	4.5	4.4	4.4	4.4	4.4	4.4	4.3	4.3	4.2	4.2	4.3	4.3	4.3	4.3	4.3	4.3	4.3	4.3	4.3	4.3	4.3	4.3	4.2	4.2	4.2	4.2	4.1	4.1	4.1	4	4	3.9	3.9	3.9	3.9	3.9	3.9	3.9	3.9	3.9	4	4.1	4.2	4.3	4.5	4.7	4.8	5	5.3	5.6	5.9	6.2	6.5	6.7	6.9	7.1	7.3	7.4	7.5	7.6	7.6	7.6	7.6	7.6	7.5	7.5	7.4	7.3	7.2	7.1	7	7	6.9	6.9	6.8	6.6	6.5	6.4	6.3	6.3	6.2	6.2	6.1	6.1	6	5.9	5.8	5.7	5.7	5.6	5.6	5.6	5.6	5.6	5.6	5.6	5.6	5.6	5.6	5.6	5.5	5.4	5.5	5.6	5.9	6	6	5.9	6`;

    const width = 800;
    const height = 600;

    const margin = { top: 20, right: 20, bottom: 30, left: 30 };

    const data = (() => {
      const data = d3.tsvParse(rawData);
      const columns = data.columns.slice(1);
      return {
        y: '% Unemployment',
        series: data.map(d => ({
          name: d.name.replace(/, ([\w-]+).*/, ' $1'),
          values: columns.map(k => +d[k]),
        })),
        dates: columns.map(d3.utcParse('%Y-%m')),
      };
    })();

    const y = d3
      .scaleLog()
      // .base(10)
      // .scaleLinear()
      .domain([2, d3.max(data.series, d => d3.max(d.values))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const x = d3
      .scaleUtc()
      .domain(d3.extent(data.dates))
      .range([margin.left, width - margin.right]);

    const xAxis = g =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickSizeOuter(0)
      );

    const yAxis = g =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select('.domain').remove())
        .call(g =>
          g
            .select('.tick:last-of-type text')
            .clone()
            .attr('x', 3)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text(data.y)
        );

    const line = d3
      .line()
      .defined(d => !isNaN(d as any))
      .x((d, i) => x(data.dates[i]))
      .y(d => y(d as any));

    function hover(svg, path) {
      if ('ontouchstart' in document)
        svg
          .style('-webkit-tap-highlight-color', 'transparent')
          .on('touchmove', moved)
          .on('touchstart', entered)
          .on('touchend', left);
      else
        svg
          .on('mousemove', moved)
          .on('mouseenter', entered)
          .on('mouseleave', left);

      const dot = svg.append('g').attr('display', 'none');

      dot.append('circle').attr('r', 2.5);

      dot
        .append('text')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'middle')
        .attr('y', -8);

      function moved() {
        d3.event.preventDefault();
        const ym = y.invert(d3.event.layerY);
        const xm = x.invert(d3.event.layerX);
        const i1 = d3.bisectLeft(data.dates, xm, 1);
        const i0 = i1 - 1;
        // @ts-ignore
        const i = xm - data.dates[i0] > data.dates[i1] - xm ? i1 : i0;
        const s = (d3Array as any).least(data.series, d =>
          Math.abs(d.values[i] - ym)
        );
        path
          .attr('stroke', d => (d === s ? null : '#ddd'))
          .filter(d => d === s)
          .raise();
        dot.attr(
          'transform',
          `translate(${x(data.dates[i])},${y(s.values[i])})`
        );
        dot.select('text').text(s.name);
      }

      function entered() {
        path.style('mix-blend-mode', null).attr('stroke', '#ddd');
        dot.attr('display', null);
      }

      function left() {
        path.style('mix-blend-mode', 'multiply').attr('stroke', null);
        dot.attr('display', 'none');
      }
    }

    function makeChart() {
      const svg = d3
        .create('svg')
        .attr('viewBox', [0, 0, width, height] as any)
        .style('overflow', 'visible');

      svg.append('g').call(xAxis);

      svg.append('g').call(yAxis);

      const path = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .selectAll('path')
        .data(data.series)
        .join('path')
        .style('mix-blend-mode', 'multiply')
        .attr('d', d => line(d.values as any));

      svg.call(hover, path);

      return svg.node();
    }

    console.log('ngoninit');

    this.elementRef.nativeElement.appendChild(makeChart());
  }
}
