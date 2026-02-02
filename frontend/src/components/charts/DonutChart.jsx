import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { PieChart as PieChartIcon, Info } from 'lucide-react';

export const DonutChart = ({
  data,
  width = 400,
  height = 400,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  title = '',
  showLegend = true,
  showLabels = true,
  innerRadius = 0.6,
  padAngle = 0.02,
  cornerRadius = 4,
  showTooltip = true
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const legendRef = useRef();
  const [selectedSlice, setSelectedSlice] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    // Set up dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const radius = Math.min(innerWidth, innerHeight) / 2;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left + centerX},${margin.top + centerY})`);

    // Create color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(colors);

    // Create pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null)
      .padAngle(padAngle);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(radius * innerRadius)
      .outerRadius(radius)
      .cornerRadius(cornerRadius);

    // Create arcs
    const arcs = chart.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .on('mouseover', function(event, d) {
        if (!showTooltip) return;
        
        const slice = d3.select(this).select('path');
        slice.transition()
          .duration(200)
          .attr('transform', 'scale(1.05)');

        const percentage = ((d.data.value / d3.sum(data, d => d.value)) * 100).toFixed(1);
        
        tooltip
          .style('opacity', 1)
          .html(`
            <div class="font-bold">${d.data.label}</div>
            <div class="text-sm">Value: ${d3.format(',')(d.data.value)}</div>
            <div class="text-sm">Percentage: ${percentage}%</div>
          `)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);

        setSelectedSlice(d.data);
      })
      .on('mouseout', function() {
        if (!showTooltip) return;
        
        const slice = d3.select(this).select('path');
        slice.transition()
          .duration(200)
          .attr('transform', 'scale(1)');

        tooltip.style('opacity', 0);
        setSelectedSlice(null);
      });

    // Add paths (slices)
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .transition()
      .duration(1000)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    // Add labels
    if (showLabels) {
      const labelArc = d3.arc()
        .innerRadius(radius * 0.8)
        .outerRadius(radius * 0.8);

      arcs.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#374151')
        .style('pointer-events', 'none')
        .text(d => {
          const percentage = ((d.data.value / d3.sum(data, d => d.value)) * 100);
          return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
        });
    }

    // Add center text
    const totalValue = d3.sum(data, d => d.value);
    chart.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text(d3.format(',')(totalValue));

    chart.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.5em')
      .style('font-size', '14px')
      .style('fill', '#6b7280')
      .text('Total');

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

    // Create legend
    if (showLegend && legendRef.current) {
      const legend = d3.select(legendRef.current);
      legend.selectAll('*').remove();

      const legendItems = legend.selectAll('.legend-item')
        .data(data)
        .enter()
        .append('div')
        .attr('class', 'legend-item flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer')
        .on('mouseover', function(event, d) {
          const correspondingArc = chart.selectAll('.arc')
            .filter(arcData => arcData.data.label === d.label)
            .select('path');
          
          correspondingArc.transition()
            .duration(200)
            .attr('transform', 'scale(1.05)');

          setSelectedSlice(d);
        })
        .on('mouseout', function(event, d) {
          const correspondingArc = chart.selectAll('.arc')
            .filter(arcData => arcData.data.label === d.label)
            .select('path');
          
          correspondingArc.transition()
            .duration(200)
            .attr('transform', 'scale(1)');

          setSelectedSlice(null);
        });

      legendItems.append('div')
        .style('width', '12px')
        .style('height', '12px')
        .style('border-radius', '50%')
        .style('background-color', d => colorScale(d.label));

      legendItems.append('div')
        .html(d => {
          const percentage = ((d.value / totalValue) * 100).toFixed(1);
          return `
            <div class="flex justify-between items-center w-full">
              <span class="font-medium">${d.label}</span>
              <span class="text-sm text-gray-500">${percentage}%</span>
            </div>
          `;
        });
    }

    // Clean up
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
      if (legendRef.current) {
        d3.select(legendRef.current).selectAll('*').remove();
      }
    };
  }, [data, width, height, margin, colors, title, showLegend, showLabels, innerRadius, padAngle, cornerRadius, showTooltip]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8"
    >
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-full"
        />
        {showTooltip && (
          <div
            ref={tooltipRef}
            className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm pointer-events-none opacity-0 z-50 transition-opacity duration-200"
            style={{ minWidth: '160px' }}
          />
        )}
      </div>

      {showLegend && (
        <div
          ref={legendRef}
          className="w-full lg:w-auto lg:max-w-xs space-y-2"
        />
      )}

      {/* Selected slice details */}
      {selectedSlice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg mt-4 lg:mt-0"
        >
          <div className="flex items-center space-x-2 mb-3">
            <PieChartIcon className="text-indigo-500" size={20} />
            <h3 className="font-semibold text-gray-800">Selected Category</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Label:</span>
              <span className="font-medium">{selectedSlice.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Value:</span>
              <span className="font-medium">
                {d3.format(',')(selectedSlice.value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-medium">
                {((selectedSlice.value / d3.sum(data, d => d.value)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Mini donut chart for dashboards
export const MiniDonutChart = ({ data, size = 120, color = '#4f46e5', label = '' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const total = d3.sum(data, d => d.value);
    const percentage = data[0].value / total;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = size / 2;
    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .startAngle(0)
      .endAngle(2 * Math.PI * percentage);

    const backgroundArc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .startAngle(2 * Math.PI * percentage)
      .endAngle(2 * Math.PI);

    svg.append('path')
      .attr('d', backgroundArc)
      .attr('transform', `translate(${radius},${radius})`)
      .attr('fill', '#e5e7eb');

    svg.append('path')
      .attr('d', arc)
      .attr('transform', `translate(${radius},${radius})`)
      .attr('fill', color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    svg.append('text')
      .attr('x', radius)
      .attr('y', radius)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .text(`${Math.round(percentage * 100)}%`);

    if (label) {
      svg.append('text')
        .attr('x', radius)
        .attr('y', radius * 2 - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#6b7280')
        .text(label);
    }
  }, [data, size, color, label]);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-block"
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
      />
    </motion.div>
  );
};

export default DonutChart;