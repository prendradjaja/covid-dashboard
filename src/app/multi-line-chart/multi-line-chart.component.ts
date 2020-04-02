import { Component, OnInit, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import * as d3Array from 'd3-array';
import times from 'lodash/times';

export type Series = {
  name: string;
  values: number[];
  comments?: string[];
};

@Component({
  selector: 'multi-line-chart',
  templateUrl: './multi-line-chart.component.html',
  styleUrls: ['./multi-line-chart.component.less'],
})
export class MultiLineChartComponent implements OnInit {
  @Input() yAxisLabel: string;
  @Input() xAxisLabel: string;
  // TODO: fix these bad assumptions:
  // - all the dates are contiguous
  // - all the serieses are of the same length & the same dates
  @Input() data: Series[];
  @Input() animate: boolean = false;
  @Input() locations: string[];
  @Input() xAxisBounds?: [number, number];
  @Input() yAxisBounds?: [number, number];

  private xScale: d3.ScaleContinuousNumeric<number, number>;
  private yScale: d3.ScaleContinuousNumeric<number, number>;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    let self = this;
    const rawData = `name	2000-01	2000-02	2000-03	2000-04	2000-05
    Line1 FOOBAR	200.6	2000.6	20.6	2.6	2.7
    Line2 BOOFAR	300.7	30.6	3.6	-10.5 2000.4`;

    const width = 800;
    const height = 600;

    const margin = { top: 20, right: 20, bottom: 30, left: 60 };

    const data = {
      y: this.yAxisLabel,
      x: this.xAxisLabel,
      series: this.data,
      dates: times(Math.max(...this.data.map(v => v.values.length)), Number),
    };

    this.yScale = d3
      .scaleLog()
      .domain(
        this.yAxisBounds || [1, d3.max(data.series, d => d3.max(d.values))]
      )
      .range([height - margin.bottom, margin.top]);

    this.xScale = d3
      .scaleLinear()
      .domain(this.xAxisBounds || d3.extent(data.dates as Number[]))
      .range([margin.left, width - margin.right]);

    console.log(this.xScale.domain(), this.yScale.domain());

    const xAxis = g =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(
        d3
          .axisBottom(this.xScale)
          .tickValues(this.getDayTicks())
          .tickSizeOuter(0)
      );

    const yAxis = g =>
      g.attr('transform', `translate(${margin.left},0)`).call(
        d3
          .axisLeft(this.yScale)
          .tickValues(this.getCasesTicks())
          .tickFormat(x => x.toLocaleString())
      );

    const line = d3
      .line()
      .defined(d => !isNaN(d as any))
      .x((d, i) => this.xScale(data.dates[i]))
      .y(d => this.yScale(d as any));

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
        const boundingRect = (self.elementRef
          .nativeElement as Element).getBoundingClientRect();
        d3.event.preventDefault();
        const ym = self.yScale.invert(d3.event.layerY - boundingRect.top);
        const xm = self.xScale.invert(d3.event.layerX - boundingRect.left);
        const i1 = d3.bisectLeft(data.dates, xm, 1);
        const i0 = i1 - 1;
        // @ts-ignore
        const i = xm - data.dates[i0] > data.dates[i1] - xm ? i1 : i0;
        const s = (d3Array as any).least(data.series, d =>
          Math.abs(Math.log10(d.values[i]) - Math.log10(ym))
        );
        path
          .attr('stroke', d => (d === s ? null : '#ddd'))
          .filter(d => d === s)
          .raise();
        dot.attr(
          'transform',
          `translate(${self.xScale(data.dates[i])},${self.yScale(s.values[i])})`
        );
        const comment = s.comments ? '— ' + s.comments[i] : '';
        dot
          .select('text')
          .text(`${s.name}: ${s.values[i].toLocaleString()}${comment}`);
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

      if (self.animate) {
        // @ts-ignore
        path._groups[0].forEach(node => {
          let length = node.getTotalLength();
          d3.select(node)
            .attr('stroke-dasharray', length)
            .attr('stroke-dashoffset', length)
            .transition()
            .duration(2000)
            .attr('stroke-dashoffset', 0);
        });
      }

      // Grid lines
      svg.append('g').call(g =>
        g
          .attr('stroke', 'black')
          .attr('stroke-opacity', 0.1)
          .call(g =>
            g
              .append('g')
              .selectAll('line')
              .data(self.getDayTicks())
              .join('line')
              .attr('x1', d => 0.5 + self.xScale(d))
              .attr('x2', d => 0.5 + self.xScale(d))
              .attr('y1', margin.top)
              .attr('y2', height - margin.bottom)
          )
          .call(g =>
            g
              .append('g')
              .selectAll('line')
              .data(self.getCasesTicks())
              .join('line')
              .attr('y1', d => 0.5 + self.yScale(d))
              .attr('y2', d => 0.5 + self.yScale(d))
              .attr('x1', margin.left)
              .attr('x2', width - margin.right)
          )
      );

      svg.call(hover, path);

      return svg.node();
    }

    this.elementRef.nativeElement.appendChild(makeChart());
  }

  private getDayTicks(): number[] {
    const [min, max] = this.xScale.domain();
    const result = [];
    for (let i = 0; i <= max; i += 7) {
      if (i >= min) {
        result.push(i);
      }
    }
    return result;
  }

  private getCasesTicks(): number[] {
    const [min, max] = this.yScale.domain();
    const result = [];
    for (let i = 1; i <= max; i *= 10) {
      if (i >= min) {
        result.push(i);
      }
    }
    return result;
  }
}
