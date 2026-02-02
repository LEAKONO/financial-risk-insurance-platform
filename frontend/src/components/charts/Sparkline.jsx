import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Info,
  Maximize2,
  Download
} from 'lucide-react';
import { Badge } from '../../ui/Badge/Badge';
import { Button } from '../../ui/Button/Button';

export const Sparkline = ({
  data = [],
  width = 200,
  height = 50,
  color = '#4f46e5',
  positiveColor = '#10b981',
  negativeColor = '#ef4444',
  neutralColor = '#6b7280',
  strokeWidth = 2,
  showPoints = false,
  showArea = false,
  showTrend = true,
  showStats = false,
  animated = true,
  className = '',
  onClick = null
}) => {
  const svgRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(null);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const first = values[0];
    const last = values[values.length - 1];
    const min = d3.min(values);
    const max = d3.max(values);
    const change = last - first;
    const percentage = first !== 0 ? (change / first) * 100 : 0;
    const avg = d3.mean(values);
    
    return {
      first,
      last,
      min,
      max,
      change,
      percentage,
      avg,
      isPositive: change > 0,
      isNeutral: change === 0
    };
  }, [data]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Set up dimensions
    const margin = { top: 5, right: 5, bottom: 5, left: 5 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Prepare data
    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const xScale = d3.scaleLinear()
      .domain([0, values.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(values), d3.max(values)])
      .range([innerHeight, 0]);

    // Determine color based on trend
    const lineColor = stats?.isPositive ? positiveColor : 
                     stats?.isNeutral ? neutralColor : negativeColor;

    // Create line generator
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Create area generator
    const area = d3.area()
      .x((d, i) => xScale(i))
      .y0(innerHeight)
      .y1(d => yScale(d))
      .curve(d3.curveMonotoneX);

    // Add area if enabled
    if (showArea) {
      svg.append('path')
        .datum(values)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .attr('fill', `${lineColor}20`)
        .attr('d', area);
    }

    // Add line
    const linePath = svg.append('path')
      .datum(values)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', strokeWidth)
      .attr('d', line);

    // Add animation
    if (animated) {
      const totalLength = linePath.node().getTotalLength();
      
      linePath
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Add points if enabled
    if (showPoints || isHovered) {
      const points = svg.selectAll('.sparkline-point')
        .data(values)
        .enter()
        .append('circle')
        .attr('class', 'sparkline-point')
        .attr('cx', (d, i) => margin.left + xScale(i))
        .attr('cy', d => margin.top + yScale(d))
        .attr('r', isHovered ? 3 : 2)
        .attr('fill', 'white')
        .attr('stroke', lineColor)
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d, i) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4);
          
          setCurrentPoint({ value: d, index: i });
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', isHovered ? 3 : 2);
          
          setCurrentPoint(null);
        });
    }

    // Add hover area for interactive tooltip
    const hoverArea = svg.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseover', () => setIsHovered(true))
      .on('mouseout', () => setIsHovered(false))
      .on('mousemove', (event) => {
        if (!isHovered) return;
        
        const [x] = d3.pointer(event);
        const index = Math.floor((x / innerWidth) * (values.length - 1));
        const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
        
        setCurrentPoint({
          value: values[clampedIndex],
          index: clampedIndex
        });
      })
      .on('click', () => {
        if (onClick && stats) {
          onClick(stats);
        }
      });

    // Clean up
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [data, width, height, color, positiveColor, negativeColor, strokeWidth, showPoints, showArea, animated, isHovered, stats]);

  // Render trend icon
  const renderTrendIcon = () => {
    if (!stats) return null;
    
    if (stats.percentage > 0) {
      return <TrendingUp className="text-green-500" size={16} />;
    } else if (stats.percentage < 0) {
      return <TrendingDown className="text-red-500" size={16} />;
    } else {
      return <Minus className="text-gray-500" size={16} />;
    }
  };

  // Format value
  const formatValue = (value) => {
    if (typeof value !== 'number') return value;
    
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative ${className}`}
    >
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {/* Header with stats */}
        {showStats && stats && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {renderTrendIcon()}
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {formatValue(stats.last)}
                </div>
                <div className={`text-sm font-medium ${
                  stats.percentage > 0 ? 'text-green-600' :
                  stats.percentage < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats.percentage > 0 ? '+' : ''}{stats.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <Badge variant={stats.percentage > 0 ? 'success' : stats.percentage < 0 ? 'danger' : 'secondary'}>
              {stats.percentage > 0 ? 'Up' : stats.percentage < 0 ? 'Down' : 'Flat'}
            </Badge>
          </div>
        )}

        {/* Chart */}
        <div 
          className="relative cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onClick && stats && onClick(stats)}
        >
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="w-full h-auto"
          />

          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && currentPoint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bg-gray-900 text-white rounded-lg px-3 py-2 text-sm z-10 pointer-events-none"
                style={{
                  left: `${(currentPoint.index / (data.length - 1)) * 100}%`,
                  top: '-50px',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <div>
                    <div className="font-semibold">Point {currentPoint.index + 1}</div>
                    <div>{formatValue(currentPoint.value)}</div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <svg width="12" height="6" viewBox="0 0 12 6" fill="#1f2937">
                    <path d="M6 6L0 0H12L6 6Z" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer with additional info */}
        {showStats && stats && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-gray-500">High</div>
                <div className="font-medium text-gray-900">{formatValue(stats.max)}</div>
              </div>
              <div>
                <div className="text-gray-500">Low</div>
                <div className="font-medium text-gray-900">{formatValue(stats.min)}</div>
              </div>
              <div>
                <div className="text-gray-500">Avg</div>
                <div className="font-medium text-gray-900">{formatValue(stats.avg)}</div>
              </div>
              <div>
                <div className="text-gray-500">Change</div>
                <div className={`font-medium ${
                  stats.change > 0 ? 'text-green-600' :
                  stats.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stats.change > 0 ? '+' : ''}{formatValue(stats.change)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Click indicator */}
        {onClick && (
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-center">
            <Info size={12} className="mr-1" />
            Click for details
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Sparkline grid for multiple charts
export const SparklineGrid = ({ charts = [], columns = 3, title = 'Performance Overview' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">
            {charts.length} metrics tracked
          </p>
        </div>
        <Badge variant="primary">
          Live
        </Badge>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
        {charts.map((chart, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Sparkline {...chart} />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Positive</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Negative</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              <span className="text-gray-600">Neutral</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Mini sparkline for tables
export const TableSparkline = ({ data, width = 80, height = 30, color = '#4f46e5' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const xScale = d3.scaleLinear()
      .domain([0, values.length - 1])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(values), d3.max(values)])
      .range([height, 0]);

    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }, [data, width, height, color]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
};

export default Sparkline;