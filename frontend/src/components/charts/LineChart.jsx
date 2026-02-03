import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Download,
  Filter,
  Maximize2,
  Minimize2,
  Info,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChartTooltip } from './ChartTooltip';

export const LineChart = ({
  data = [],
  width = 800,
  height = 400,
  margin = { top: 20, right: 30, bottom: 40, left: 50 },
  colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  title = 'Line Chart',
  xField = 'date',
  yField = 'value',
  seriesField = 'category',
  showGrid = true,
  showPoints = true,
  showLegend = true,
  showTooltip = true,
  curveType = 'monotoneX',
  strokeWidth = 2,
  pointSize = 4,
  isMultiSeries = false,
  timeFormat = '%Y-%m-%d',
  yAxisFormat = d => `$${d3.format(',.0f')(d)}`,
  className = ''
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [activeSeries, setActiveSeries] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomTransform, setZoomTransform] = useState(null);

  // Prepare data based on chart type
  const prepareData = () => {
    if (!data || data.length === 0) return [];
    
    if (isMultiSeries && seriesField) {
      // Group data by series
      const grouped = d3.group(data, d => d[seriesField]);
      const series = Array.from(grouped, ([key, values]) => ({
        key,
        values: values.map(d => ({
          ...d,
          [xField]: d3.timeParse(timeFormat)(d[xField]) || d[xField]
        })).sort((a, b) => a[xField] - b[xField])
      }));
      return series;
    } else {
      // Single series
      return [{
        key: 'default',
        values: data.map(d => ({
          ...d,
          [xField]: d3.timeParse(timeFormat)(d[xField]) || d[xField]
        })).sort((a, b) => a[xField] - b[xField])
      }];
    }
  };

  const preparedData = prepareData();
  const allValues = preparedData.flatMap(d => d.values);
  
  useEffect(() => {
    if (!allValues || allValues.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    // Set up dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Parse dates
    const parseDate = d3.timeParse(timeFormat);
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(allValues, d => d[xField]))
      .range([0, innerWidth]);

    const yMax = d3.max(allValues, d => d[yField]) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([innerHeight, 0]);

    // Apply zoom if active
    if (zoomTransform) {
      xScale.domain(zoomTransform.rescaleX(d3.scaleTime().range([0, innerWidth])).domain());
      yScale.domain(zoomTransform.rescaleY(d3.scaleLinear().range([innerHeight, 0])).domain());
    }

    // Create chart group
    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid
    if (showGrid) {
      // Horizontal grid
      chart.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat('')
        )
        .style('stroke', '#e5e7eb')
        .style('stroke-dasharray', '3,3')
        .style('opacity', 0.5);

      // Vertical grid
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

    // Create line generator
    const lineGenerator = d3.line()
      .curve(d3[curveType])
      .x(d => xScale(d[xField]))
      .y(d => yScale(d[yField]));

    // Draw lines for each series
    preparedData.forEach((series, index) => {
      if (activeSeries && activeSeries !== series.key) return;

      const color = colors[index % colors.length];
      
      // Draw line
      chart.append('path')
        .datum(series.values)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth)
        .attr('d', lineGenerator)
        .attr('class', `line-series line-${series.key}`)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setActiveSeries(series.key))
        .on('mouseleave', () => setActiveSeries(null));

      // Draw points
      if (showPoints) {
        chart.selectAll(`.point-${series.key}`)
          .data(series.values)
          .enter()
          .append('circle')
          .attr('class', `point point-${series.key}`)
          .attr('cx', d => xScale(d[xField]))
          .attr('cy', d => yScale(d[yField]))
          .attr('r', pointSize)
          .attr('fill', 'white')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .on('mouseover', function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', pointSize * 1.5);

            setTooltipData({
              series: series.key,
              x: d[xField],
              y: d[yField],
              ...d
            });
            setTooltipPosition({ x: event.pageX, y: event.pageY });
          })
          .on('mouseout', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('r', pointSize);
            
            setTooltipData(null);
          });
      }
    });

    // Add axes
    // X-axis
    const xAxis = chart.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(Math.min(allValues.length, 6))
        .tickFormat(d3.timeFormat(timeFormat.includes('Y') ? '%b %Y' : '%b %d'))
      );

    xAxis.selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .attr('transform', 'rotate(-45)')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .style('text-anchor', 'end');

    // Y-axis
    const yAxis = chart.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(6)
        .tickFormat(yAxisFormat)
      );

    yAxis.selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6b7280');

    // Add axis labels
    chart.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text(xField);

    chart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -innerHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .text(yField);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(title);

    // Add zoom behavior
    if (isZoomed) {
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .translateExtent([[0, 0], [innerWidth, innerHeight]])
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on('zoom', (event) => {
          setZoomTransform(event.transform);
        });

      chart.call(zoom);
    }

    // Clean up
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [data, width, height, margin, colors, activeSeries, zoomTransform, isZoomed]);

  // Calculate statistics
  const calculateStats = () => {
    if (!allValues || allValues.length === 0) return null;
    
    const values = allValues.map(d => d[yField]);
    const mean = d3.mean(values) || 0;
    const median = d3.median(values) || 0;
    const min = d3.min(values) || 0;
    const max = d3.max(values) || 0;
    const latest = values[values.length - 1] || 0;
    const first = values[0] || 0;
    const growth = ((latest - first) / first) * 100;

    return {
      mean,
      median,
      min,
      max,
      latest,
      growth: isFinite(growth) ? growth : 0
    };
  };

  const stats = calculateStats();

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
      downloadLink.download = `${title.replace(/\s+/g, '_')}_chart.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed) {
      setZoomTransform(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">Interactive line chart with multiple series</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          {stats && (
            <Badge 
              variant={stats.growth >= 0 ? 'success' : 'danger'}
              className="flex items-center space-x-1"
            >
              {stats.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(1)}%</span>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomToggle}
            className="flex items-center space-x-1"
          >
            {isZoomed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isZoomed ? 'Reset' : 'Zoom'}</span>
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

      {/* Chart */}
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
              title: tooltipData.series,
              showTrend: true
            }}
          />
        )}
      </div>

      {/* Legend */}
      {showLegend && isMultiSeries && preparedData.length > 1 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {preparedData.map((series, index) => (
            <motion.button
              key={series.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveSeries(activeSeries === series.key ? null : series.key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                activeSeries === series.key || activeSeries === null
                  ? 'bg-opacity-10'
                  : 'opacity-30'
              }`}
              style={{
                backgroundColor: activeSeries === series.key || activeSeries === null
                  ? `${colors[index % colors.length]}20`
                  : 'transparent'
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-gray-700">
                {series.key}
              </span>
              <Badge variant="outline">
                {series.values.length}
              </Badge>
            </motion.button>
          ))}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Latest Value</div>
            <div className="text-2xl font-bold text-gray-900">
              {yAxisFormat(stats.latest)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Average</div>
            <div className="text-2xl font-bold text-gray-900">
              {yAxisFormat(stats.mean)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Min / Max</div>
            <div className="text-2xl font-bold text-gray-900">
              {yAxisFormat(stats.min)} / {yAxisFormat(stats.max)}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Growth</div>
            <div className={`text-2xl font-bold ${
              stats.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.growth >= 0 ? '+' : ''}{stats.growth.toFixed(1)}%
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      {isZoomed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2"
        >
          <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Zoom Mode:</span> Scroll to zoom, drag to pan. Click reset to return to normal view.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Mini line chart for dashboards
export const MiniLineChart = ({ data, width = 120, height = 40, color = '#4f46e5' }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 5, right: 5, bottom: 5, left: 5 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data), d3.max(data)])
      .range([innerHeight, 0]);

    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d));

    svg.append('path')
      .datum(data)
      .attr('transform', `translate(${margin.left},${margin.top})`)
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

export default LineChart;