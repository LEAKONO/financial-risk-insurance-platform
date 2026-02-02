import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

export const BarChart = ({
  data,
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 40 },
  color = '#10b981',
  title = '',
  xField = 'category',
  yField = 'value',
  showGrid = true,
  showValues = true,
  horizontal = false,
  barPadding = 0.2
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

    // Create scales
    let xScale, yScale;
    
    if (horizontal) {
      xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yField]) * 1.1])
        .range([0, innerWidth]);

      yScale = d3.scaleBand()
        .domain(data.map(d => d[xField]))
        .range([0, innerHeight])
        .padding(barPadding);
    } else {
      xScale = d3.scaleBand()
        .domain(data.map(d => d[xField]))
        .range([0, innerWidth])
        .padding(barPadding);

      yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yField]) * 1.1])
        .range([innerHeight, 0]);
    }

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid
    if (showGrid) {
      if (horizontal) {
        chart.append('g')
          .attr('class', 'grid')
          .call(d3.axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickFormat('')
          )
          .style('stroke', '#e5e7eb')
          .style('stroke-dasharray', '3,3')
          .style('opacity', 0.5);
      } else {
        chart.append('g')
          .attr('class', 'grid')
          .call(d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat('')
          )
          .style('stroke', '#e5e7eb')
          .style('stroke-dasharray', '3,3')
          .style('opacity', 0.5);
      }
    }

    // Create bars
    const bars = chart.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', color)
      .attr('rx', 4) // Rounded corners
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);

        tooltip
          .style('opacity', 1)
          .html(`
            <div class="font-semibold">${d[xField]}</div>
            <div>Value: $${d3.format(',.0f')(d[yField])}</div>
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);

        tooltip.style('opacity', 0);
      });

    if (horizontal) {
      bars
        .attr('x', 0)
        .attr('y', d => yScale(d[xField]))
        .attr('width', d => xScale(d[yField]))
        .attr('height', yScale.bandwidth());
    } else {
      bars
        .attr('x', d => xScale(d[xField]))
        .attr('y', d => yScale(d[yField]))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d[yField]));
    }

    // Add value labels
    if (showValues) {
      const labels = chart.selectAll('.bar-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#374151')
        .text(d => `$${d3.format(',.0f')(d[yField])}`);

      if (horizontal) {
        labels
          .attr('x', d => xScale(d[yField]) - 10)
          .attr('y', d => yScale(d[xField]) + yScale.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'end');
      } else {
        labels
          .attr('x', d => xScale(d[xField]) + xScale.bandwidth() / 2)
          .attr('y', d => yScale(d[yField]) - 10)
          .attr('dy', '0.35em');
      }
    }

    // Create axes
    if (horizontal) {
      const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `$${d3.format(',.0f')(d)}`);

      const yAxis = d3.axisLeft(yScale);

      chart.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#6b7280');

      chart.append('g')
        .call(yAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#6b7280');
    } else {
      const xAxis = d3.axisBottom(xScale);

      const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => `$${d3.format(',.0f')(d)}`);

      chart.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '12px')
        .style('fill', '#6b7280');

      chart.append('g')
        .call(yAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#6b7280');
    }

    // Add axis labels
    if (horizontal) {
      chart.append('text')
        .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
        .style('text-anchor', 'middle')
        .style('fill', '#6b7280')
        .text('Value');

      chart.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left)
        .attr('x', -innerHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', '#6b7280')
        .text('Category');
    } else {
      chart.append('text')
        .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
        .style('text-anchor', 'middle')
        .style('fill', '#6b7280')
        .text('Category');

      chart.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left)
        .attr('x', -innerHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', '#6b7280')
        .text('Value');
    }

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
  }, [data, width, height, margin, color, title, xField, yField, showGrid, showValues, horizontal, barPadding]);

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

export default BarChart;