import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart as PieChartIcon,
  Download,
  Filter,
  Eye,
  EyeOff,
  TrendingUp,
  Info,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import { Badge } from '../../ui/Badge/Badge';
import { ChartTooltip } from './ChartTooltip';

export const PieChart = ({
  data = [],
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  colors = [
    '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4'
  ],
  title = 'Pie Chart',
  valueField = 'value',
  labelField = 'label',
  showLegend = true,
  showLabels = true,
  showTooltip = true,
  donut = false,
  donutWidth = 60,
  sort = true,
  startAngle = 0,
  endAngle = 2 * Math.PI,
  padAngle = 0.01,
  cornerRadius = 4,
  className = '',
  onSliceClick = null
}) => {
  const svgRef = useRef();
  const legendRef = useRef();
  const [selectedSlice, setSelectedSlice] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hiddenCategories, setHiddenCategories] = useState(new Set());
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Filter and sort data
  const filteredData = data.filter(d => !hiddenCategories.has(d[labelField]));
  const sortedData = sort
    ? [...filteredData].sort((a, b) => b[valueField] - a[valueField])
    : filteredData;

  const totalValue = d3.sum(sortedData, d => d[valueField]);

  useEffect(() => {
    if (!sortedData || sortedData.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

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
      .domain(sortedData.map(d => d[labelField]))
      .range(colors);

    // Create pie generator
    const pie = d3.pie()
      .value(d => d[valueField])
      .sort(sort ? null : (a, b) => 0)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(padAngle);

    // Create arc generator
    const arc = d3.arc()
      .innerRadius(donut ? radius - donutWidth : 0)
      .outerRadius(radius)
      .cornerRadius(cornerRadius);

    // Create arcs
    const arcs = chart.selectAll('.arc')
      .data(pie(sortedData))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        if (onSliceClick) {
          onSliceClick(d.data);
        }
        setSelectedSlice(d.data);
      })
      .on('mouseover', function(event, d) {
        if (!showTooltip) return;
        
        const slice = d3.select(this).select('path');
        slice.transition()
          .duration(200)
          .attr('transform', 'scale(1.05)');

        setHoveredSlice(d.data);
        
        const percentage = ((d.data[valueField] / totalValue) * 100).toFixed(1);
        setTooltipData({
          label: d.data[labelField],
          value: d.data[valueField],
          percentage,
          color: colorScale(d.data[labelField]),
          ...d.data
        });
        setTooltipPosition({ x: event.pageX, y: event.pageY });
      })
      .on('mouseout', function() {
        if (!showTooltip) return;
        
        const slice = d3.select(this).select('path');
        slice.transition()
          .duration(200)
          .attr('transform', 'scale(1)');

        setHoveredSlice(null);
        setTooltipData(null);
      });

    // Add paths (slices)
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data[labelField]))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .attr('class', d => `pie-slice slice-${d.data[labelField].replace(/\s+/g, '-')}`)
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
        .innerRadius(donut ? radius - donutWidth / 2 : radius * 0.5)
        .outerRadius(donut ? radius - donutWidth / 2 : radius * 0.5);

      arcs.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', '600')
        .style('fill', '#374151')
        .style('pointer-events', 'none')
        .text(d => {
          const percentage = ((d.data[valueField] / totalValue) * 100);
          return percentage > 5 ? `${percentage.toFixed(0)}%` : '';
        });
    }

    // Add donut hole text
    if (donut) {
      chart.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .style('fill', '#374151')
        .text(totalValue.toLocaleString());

      chart.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.5em')
        .style('font-size', '14px')
        .style('fill', '#6b7280')
        .text('Total');
    }

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(title);

    // Create legend
    if (showLegend && legendRef.current) {
      const legend = d3.select(legendRef.current);
      legend.selectAll('*').remove();

      const legendItems = legend.selectAll('.legend-item')
        .data(sortedData)
        .enter()
        .append('div')
        .attr('class', 'legend-item flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all')
        .on('click', function(event, d) {
          event.stopPropagation();
          if (onSliceClick) {
            onSliceClick(d);
          }
          setSelectedSlice(d);
        })
        .on('mouseover', function(event, d) {
          const slice = chart.select(`.slice-${d[labelField].replace(/\s+/g, '-')}`);
          slice.transition()
            .duration(200)
            .attr('transform', 'scale(1.05)');
          
          setHoveredSlice(d);
        })
        .on('mouseout', function(event, d) {
          const slice = chart.select(`.slice-${d[labelField].replace(/\s+/g, '-')}`);
          slice.transition()
            .duration(200)
            .attr('transform', 'scale(1)');
          
          if (hoveredSlice?.label === d[labelField]) {
            setHoveredSlice(null);
          }
        });

      legendItems.append('div')
        .attr('class', 'flex items-center space-x-3')
        .html(d => {
          const percentage = ((d[valueField] / totalValue) * 100).toFixed(1);
          const isHidden = hiddenCategories.has(d[labelField]);
          return `
            <div class="flex items-center space-x-3">
              <div class="w-4 h-4 rounded-full" style="background-color: ${colorScale(d[labelField])}"></div>
              <div class="flex items-center space-x-2">
                <span class="font-medium ${isHidden ? 'line-through text-gray-400' : 'text-gray-700'}">${d[labelField]}</span>
                <button class="text-gray-400 hover:text-gray-600 transition-colors">
                  ${isHidden ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>' : '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>'}
                </button>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="font-bold text-gray-900">${d[valueField].toLocaleString()}</span>
              <span class="text-sm text-gray-500">${percentage}%</span>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          `;
        });

      // Add click handlers for hide/show buttons
      legend.selectAll('.legend-item button').on('click', function(event, d) {
        event.stopPropagation();
        const newHidden = new Set(hiddenCategories);
        if (newHidden.has(d[labelField])) {
          newHidden.delete(d[labelField]);
        } else {
          newHidden.add(d[labelField]);
        }
        setHiddenCategories(newHidden);
      });
    }

    // Clean up
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
      if (legendRef.current) {
        d3.select(legendRef.current).selectAll('*').remove();
      }
    };
  }, [sortedData, width, height, margin, colors, hiddenCategories, hoveredSlice]);

  const handleDownload = () => {
    const svgElement = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = width;
    canvas.height = height;
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${title.replace(/\s+/g, '_')}_pie_chart.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleReset = () => {
    setHiddenCategories(new Set());
    setSelectedSlice(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">
            {sortedData.length} categories, Total: {totalValue.toLocaleString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="flex items-center space-x-1"
          >
            <Eye size={16} />
            <span>Show All</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="flex items-center space-x-1"
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center">
        {/* Chart */}
        <div className="flex-1">
          <div className="relative">
            <svg
              ref={svgRef}
              width={width}
              height={height}
              className="w-full h-auto"
            />
            
            {showTooltip && tooltipData && (
              <ChartTooltip
                data={tooltipData}
                visible={!!tooltipData}
                position={tooltipPosition}
                config={{
                  title: tooltipData.label,
                  showPercentage: true
                }}
              />
            )}
          </div>

          {/* Statistics */}
          {selectedSlice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-800 flex items-center space-x-2">
                  <Info size={18} />
                  <span>Selected: {selectedSlice[labelField]}</span>
                </h4>
                <Badge variant="primary">
                  {((selectedSlice[valueField] / totalValue) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-blue-600">Value</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {selectedSlice[valueField].toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-600">Share of Total</div>
                  <div className="text-2xl font-bold text-blue-800">
                    {((selectedSlice[valueField] / totalValue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="lg:ml-6 lg:w-80 w-full mt-6 lg:mt-0">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700">Categories</h4>
                <Badge variant="outline">
                  {sortedData.length} items
                </Badge>
              </div>
              
              <div
                ref={legendRef}
                className="space-y-2 max-h-80 overflow-y-auto pr-2"
              />
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-bold text-gray-900">
                    {totalValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Hidden Categories</span>
                  <span className="font-bold text-red-600">
                    {hiddenCategories.size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-blue-500" size={20} />
            <div className="text-sm font-medium text-blue-700">Top Category</div>
          </div>
          {sortedData[0] && (
            <>
              <div className="text-lg font-bold text-gray-900">
                {sortedData[0][labelField]}
              </div>
              <div className="text-sm text-gray-600">
                {((sortedData[0][valueField] / totalValue) * 100).toFixed(1)}% of total
              </div>
            </>
          )}
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <PieChartIcon className="text-green-500" size={20} />
            <div className="text-sm font-medium text-green-700">Distribution</div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {sortedData.length} Categories
          </div>
          <div className="text-sm text-gray-600">
            {totalValue.toLocaleString()} total value
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="text-amber-500" size={20} />
            <div className="text-sm font-medium text-amber-700">Data Quality</div>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {data.length - sortedData.length} Hidden
          </div>
          <div className="text-sm text-gray-600">
            Click legend items to toggle visibility
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Mini pie chart for dashboards
export const MiniPieChart = ({ data, size = 120, colors = ['#4f46e5', '#10b981', '#f59e0b'], label = '' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const total = d3.sum(data, d => d.value);
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = size / 2;
    const pie = d3.pie().value(d => d.value);
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(colors);

    const arcs = svg.selectAll('.mini-arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('transform', `translate(${radius},${radius})`);

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', 'white')
      .attr('stroke-width', 1);

    if (label) {
      svg.append('text')
        .attr('x', radius)
        .attr('y', size + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#6b7280')
        .text(label);
    }
  }, [data, size, colors, label]);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-block"
    >
      <svg
        ref={svgRef}
        width={size}
        height={size + (label ? 20 : 0)}
      />
    </motion.div>
  );
};

export default PieChart;