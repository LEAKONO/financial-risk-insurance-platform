import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

export const AreaChart = ({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 30, left: 40 },
  color = '#4f46e5',
  title = '',
  xField = 'date',
  yField = 'value',
  showGrid = true,
  showPoints = true,
  curveType = 'monotoneX'
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    // Set up dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    const processedData = data.map(d => ({
      ...d,
      [xField]: parseDate(d[xField]) || d[xField]
    }));

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(processedData, d => d[xField]))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, d => d[yField]) * 1.1])
      .range([innerHeight, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(data.length > 10 ? 6 : data.length)
      .tickFormat(d3.timeFormat(data.length > 10 ? '%b %d' : '%b %d, %Y'));

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `$${d3.format(',.0f')(d)}`);

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid
    if (showGrid) {
      chart.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat('')
        )
        .style('stroke', '#e5e7eb')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.5);

      chart.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat('')
        )
        .style('stroke', '#e5e7eb')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.5);
    }

    // Create area generator
    const area = d3.area()
      .curve(d3[curveType])
      .x(d => xScale(d[xField]))
      .y0(innerHeight)
      .y1(d => yScale(d[yField]));

    // Add area
    chart.append('path')
      .datum(processedData)
      .attr('fill', color)
      .attr('fill-opacity', 0.2)
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', area)
      .attr('class', 'area-path');

    // Add line
    const line = d3.line()
      .curve(d3[curveType])
      .x(d => xScale(d[xField]))
      .y(d => yScale(d[yField]));

    chart.append('path')
      .datum(processedData)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('class', 'line-path');

    // Add points
    if (showPoints) {
      chart.selectAll('.point')
        .data(processedData)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => xScale(d[xField]))
        .attr('cy', d => yScale(d[yField]))
        .attr('r', 4)
        .attr('fill', 'white')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6);

          tooltip
            .style('opacity', 1)
            .html(`
              <div class="font-semibold">${d3.timeFormat('%b %d, %Y')(d[xField])}</div>
              <div>Value: $${d3.format(',.0f')(d[yField])}</div>
            `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4);

          tooltip.style('opacity', 0);
        });
    }

    // Add axes
    chart.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280');

    chart.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280');

    // Add axis labels
    chart.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('fill', '#6b7280')
      .text('Date');

    chart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -innerHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#6b7280')
      .text('Value');

    // Add title
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .style('fill', '#374151')
        .text(title);
    }

    // Clean up
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [data, width, height, margin, color, title, xField, yField, showGrid, showPoints, curveType]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="w-full h-full"
      />
      <div
        ref={tooltipRef}
        className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm pointer-events-none opacity-0 z-50 transition-opacity duration-200"
        style={{ minWidth: '120px' }}
      />
    </motion.div>
  );
};

export default AreaChart;