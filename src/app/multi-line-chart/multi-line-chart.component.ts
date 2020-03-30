import { Component, OnInit, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';

export type Series = {
  name: string;
  values: number[];
};

@Component({
  selector: 'multi-line-chart',
  templateUrl: './multi-line-chart.component.html',
  styleUrls: ['./multi-line-chart.component.less'],
})
export class MultiLineChartComponent implements OnInit {
  @Input() yAxisLabel: string;
  // TODO: fix these bad assumptions:
  // - all the dates are contiguous
  // - all the serieses are of the same length & the same dates
  @Input() data: Series[];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const rawData = `name	2000-01	2000-02	2000-03	2000-04	2000-05
    Line1 FOOBAR	200.6	2000.6	20.6	2.6	2.7
    Line2 BOOFAR	300.7	30.6	3.6	-10.5 2000.4`;

    const width = 800;
    const height = 600;

    const margin = { top: 20, right: 20, bottom: 30, left: 30 };

    const data = (() => {
      const data = d3.tsvParse(rawData);
      const columns = data.columns.slice(1);
      return {
        y: this.yAxisLabel,
        series: this.data,
        // data.map(d => ({
        //   name: d.name.replace(/, ([\w-]+).*/, ' $1'),
        //   values: columns.map(k => +d[k]),
        // })),
        dates: this.data[0].values.map((_, index) => index),
      };
    })();
    console.log(data);

    const y = d3
      .scaleLog()
      // .base(10)
      // .scaleLinear()
      .domain([2, d3.max(data.series, d => d3.max(d.values))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const x = d3
      .scaleLinear()
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
