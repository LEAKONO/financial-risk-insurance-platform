import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  curveLinear,
  curveMonotoneX,
  curveMonotoneY,
  curveNatural,
  curveStep,
  curveBasis,
  curveCardinal,
  curveCatmullRom
} from 'd3-shape';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Download,
  Maximize2,
  Minimize2,
  Info,
  AlertCircle,
  RefreshCw
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
  className = '',
  isLoading = false,
  error = null
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [activeSeries, setActiveSeries] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomTransform, setZoomTransform] = useState(null);
  const [localData, setLocalData] = useState([]);

  // Curve function mapping
  const curveMap = {
    linear: curveLinear,
    monotoneX: curveMonotoneX,
    monotoneY: curveMonotoneY,
    natural: curveNatural,
    step: curveStep,
    basis: curveBasis,
    cardinal: curveCardinal,
    catmullRom: curveCatmullRom
  };

  // Validate and normalize data with NaN protection
  useEffect(() => {
    if (!data) {
      setLocalData([]);
      return;
    }

    // If data is already an array, use it with NaN protection
    if (Array.isArray(data)) {
      const cleanedData = data.map(item => {
        if (!item || typeof item !== 'object') return null;
        
        const cleanedItem = { ...item };
        
        // Ensure xField exists and is valid
        if (xField && !cleanedItem[xField]) {
          cleanedItem[xField] = new Date().toISOString().split('T')[0];
        }
        
        // Ensure yField exists and is a valid number
        if (yField) {
          const yValue = cleanedItem[yField];
          if (yValue === null || yValue === undefined || isNaN(yValue)) {
            cleanedItem[yField] = 0;
          } else {
            cleanedItem[yField] = Number(yValue);
            if (isNaN(cleanedItem[yField])) cleanedItem[yField] = 0;
          }
        }
        
        return cleanedItem;
      }).filter(item => item !== null);
      
      setLocalData(cleanedData);
      return;
    }

    // If data is an object with datasets property (Chart.js format)
    if (data.datasets && Array.isArray(data.datasets)) {
      const chartData = [];
      data.datasets.forEach((dataset, index) => {
        const seriesName = dataset.label || `Series ${index + 1}`;
        
        if (data.labels && Array.isArray(data.labels)) {
          data.labels.forEach((label, i) => {
            const value = dataset.data && Array.isArray(dataset.data) ? dataset.data[i] : 0;
            chartData.push({
              [seriesField]: seriesName,
              [xField]: label,
              [yField]: isNaN(Number(value)) ? 0 : Number(value)
            });
          });
        }
      });
      
      setLocalData(chartData);
      return;
    }

    // If data is an object, convert to array with fallback
    if (typeof data === 'object' && !Array.isArray(data)) {
      try {
        // Try to extract data from common formats
        const dataArray = Object.entries(data).map(([key, value]) => {
          const cleanValue = {
            [xField]: key,
            [yField]: isNaN(Number(value)) ? 0 : Number(value)
          };
          
          if (typeof value === 'object') {
            Object.assign(cleanValue, value);
          }
          
          return cleanValue;
        });
        
        setLocalData(dataArray.filter(item => item !== null));
        return;
      } catch (error) {
        console.error('Error converting object data:', error);
        setLocalData([]);
        return;
      }
    }

    // Fallback to empty array
    setLocalData([]);
  }, [data, isMultiSeries, seriesField, xField, yField]);

  // Prepare data with additional NaN protection
  const prepareData = () => {
    if (!localData || !Array.isArray(localData) || localData.length === 0) return [];
    
    try {
      if (isMultiSeries && seriesField) {
        // Group data by series with validation
        const grouped = new Map();
        
        localData.forEach(item => {
          if (!item || typeof item !== 'object') return;
          
          const key = item[seriesField] || 'default';
          const xValue = item[xField];
          const yValue = item[yField];
          
          // Ensure values are valid
          const cleanItem = {
            ...item,
            [xField]: xValue || new Date().toISOString().split('T')[0],
            [yField]: isNaN(Number(yValue)) ? 0 : Number(yValue)
          };
          
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key).push(cleanItem);
        });
        
        const series = Array.from(grouped, ([key, values]) => ({
          key,
          values: values.sort((a, b) => {
            try {
              const aDate = new Date(a[xField]);
              const bDate = new Date(b[xField]);
              return aDate - bDate;
            } catch {
              return a[xField]?.localeCompare?.(b[xField]) || 0;
            }
          })
        }));
        
        return series;
      } else {
        // Single series with validation
        const cleanedValues = localData.map(item => {
          const xValue = item?.[xField];
          const yValue = item?.[yField];
          
          return {
            ...item,
            [xField]: xValue || new Date().toISOString().split('T')[0],
            [yField]: isNaN(Number(yValue)) ? 0 : Number(yValue)
          };
        }).sort((a, b) => {
          try {
            const aDate = new Date(a[xField]);
            const bDate = new Date(b[xField]);
            return aDate - bDate;
          } catch {
            return a[xField]?.localeCompare?.(b[xField]) || 0;
          }
        });
        
        return [{
          key: 'default',
          values: cleanedValues
        }];
      }
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return [];
    }
  };

  const preparedData = prepareData();
  
  // Get all values with validation
  const allValues = preparedData.flatMap(d => 
    (d?.values || []).filter(v => 
      v && 
      v[xField] !== undefined && 
      v[yField] !== undefined &&
      !isNaN(v[yField])
    )
  );
  
  useEffect(() => {
    if (!allValues || allValues.length === 0) {
      // Clear chart if no valid data
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);

    // Set up dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    try {
      // Create scales with NaN protection
      const xValues = allValues.map(d => {
        try {
          const date = new Date(d[xField]);
          return isNaN(date.getTime()) ? new Date() : date;
        } catch {
          return new Date();
        }
      });
      
      const yValues = allValues.map(d => {
        const val = Number(d[yField]);
        return isNaN(val) ? 0 : val;
      }).filter(v => v !== null && v !== undefined);

      const xScale = d3.scaleTime()
        .domain(d3.extent(xValues))
        .range([0, innerWidth])
        .nice();

      const yMax = d3.max(yValues) || 1;
      const yMin = d3.min(yValues) || 0;
      
      const yScale = d3.scaleLinear()
        .domain([Math.min(0, yMin), yMax * 1.1])
        .range([innerHeight, 0])
        .nice();

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

      // Create line generator with proper curve function
      const selectedCurve = curveMap[curveType] || curveMonotoneX;
      const lineGenerator = d3.line()
        .curve(selectedCurve)
        .x(d => {
          const xVal = d[xField];
          try {
            const date = new Date(xVal);
            return xScale(isNaN(date.getTime()) ? new Date() : date);
          } catch {
            return xScale(new Date());
          }
        })
        .y(d => {
          const yVal = Number(d[yField]);
          return yScale(isNaN(yVal) ? 0 : yVal);
        });

      // Draw lines for each series
      preparedData.forEach((series, index) => {
        if (activeSeries && activeSeries !== series.key) return;

        const color = colors[index % colors.length];
        
        // Filter out invalid points for this series
        const validSeriesValues = (series.values || []).filter(v => 
          v && 
          v[xField] !== undefined && 
          v[yField] !== undefined &&
          !isNaN(Number(v[yField]))
        );

        if (validSeriesValues.length === 0) return;
        
        // Draw line
        chart.append('path')
          .datum(validSeriesValues)
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
            .data(validSeriesValues)
            .enter()
            .append('circle')
            .attr('class', `point point-${series.key}`)
            .attr('cx', d => {
              const xVal = d[xField];
              try {
                const date = new Date(xVal);
                return xScale(isNaN(date.getTime()) ? new Date() : date);
              } catch {
                return xScale(new Date());
              }
            })
            .attr('cy', d => {
              const yVal = Number(d[yField]);
              return yScale(isNaN(yVal) ? 0 : yVal);
            })
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
    } catch (error) {
      console.error('Error rendering chart:', error);
      // Render error state in chart area
      chart.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('fill', '#ef4444')
        .text('Error rendering chart');
    }

    // Clean up
    return () => {
      d3.select(svgRef.current).selectAll('*').remove();
    };
  }, [localData, width, height, margin, colors, activeSeries, zoomTransform, isZoomed, curveType, preparedData, allValues]);

  // Calculate statistics with validation
  const calculateStats = () => {
    if (!allValues || allValues.length === 0) return null;
    
    const values = allValues
      .map(d => Number(d[yField]))
      .filter(v => v != null && !isNaN(v));
    
    if (values.length === 0) return null;
    
    const mean = d3.mean(values) || 0;
    const median = d3.median(values) || 0;
    const min = d3.min(values) || 0;
    const max = d3.max(values) || 0;
    const latest = values[values.length - 1] || 0;
    const first = values[0] || 0;
    const growth = first !== 0 ? ((latest - first) / first) * 100 : 0;

    return {
      mean: isNaN(mean) ? 0 : mean,
      median: isNaN(median) ? 0 : median,
      min: isNaN(min) ? 0 : min,
      max: isNaN(max) ? 0 : max,
      latest: isNaN(latest) ? 0 : latest,
      growth: isFinite(growth) ? growth : 0
    };
  };

  const stats = calculateStats();

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
          <p className="text-red-500 font-medium">Error loading chart</p>
          <p className="text-gray-500 text-sm mt-2">{error.message || 'Failed to load data'}</p>
        </div>
      </div>
    );
  }

  // Empty data state
  if (!localData || localData.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No data available</p>
          <p className="text-gray-400 text-sm mt-2">Data will appear here once available</p>
        </div>
      </div>
    );
  }

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
            onClick={() => setIsZoomed(!isZoomed)}
            className="flex items-center space-x-1"
          >
            {isZoomed ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            <span>{isZoomed ? 'Reset' : 'Zoom'}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Simple download fallback
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, width, height);
              
              const dataUrl = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = dataUrl;
              link.download = `${title.replace(/\s+/g, '_')}.png`;
              link.click();
            }}
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
                {series.values?.length || 0}
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
    </motion.div>
  );
};

// Mini line chart for dashboards
export const MiniLineChart = ({ 
  data = [],
  width = 120, 
  height = 40, 
  color = '#4f46e5',
  curveType = 'monotoneX'
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      d3.select(svgRef.current).selectAll('*').remove();
      return;
    }

    // Clean data - replace NaN/undefined with 0
    const cleanData = data.map(val => {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 5, right: 5, bottom: 5, left: 5 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
      .domain([0, cleanData.length - 1])
      .range([0, innerWidth]);

    const yMin = d3.min(cleanData);
    const yMax = d3.max(cleanData);
    
    // Ensure domain has valid range
    const yDomain = [yMin !== undefined ? yMin : 0, yMax !== undefined ? yMax : 1];
    
    const yScale = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);

    const curveMap = {
      linear: curveLinear,
      monotoneX: curveMonotoneX,
      monotoneY: curveMonotoneY,
      natural: curveNatural,
      step: curveStep,
      basis: curveBasis,
      cardinal: curveCardinal,
      catmullRom: curveCatmullRom
    };

    const selectedCurve = curveMap[curveType] || curveMonotoneX;
    const line = d3.line()
      .curve(selectedCurve)
      .x((d, i) => xScale(i))
      .y(d => yScale(d));

    svg.append('path')
      .datum(cleanData)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .attr('d', line);
  }, [data, width, height, color, curveType]);

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