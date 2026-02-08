'use client'

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function TradeView({ tradingData }) {
    const chartRef = useRef();
    const volumeRef = useRef();
    const [hoveredData, setHoveredData] = useState(null);

    useEffect(() => {
        if (tradingData && tradingData.length > 0) {
            drawChart();
        }
    }, [tradingData]);

    const drawChart = () => {
        // Clear previous charts
        d3.select(chartRef.current).selectAll('*').remove();
        d3.select(volumeRef.current).selectAll('*').remove();

        const margin = { top: 20, right: 60, bottom: 30, left: 60 };
        const chartWidth = 800;
        const chartHeight = 400;
        const volumeHeight = 100;

        // Create main chart SVG
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', chartWidth + margin.left + margin.right)
            .attr('height', chartHeight + margin.top + margin.bottom);

        const chartArea = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleBand()
            .domain(tradingData.map(d => d.date))
            .range([0, chartWidth])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([
                d3.min(tradingData, d => d.low) * 0.995,
                d3.max(tradingData, d => d.high) * 1.005
            ])
            .range([chartHeight, 0]);

        // Create candlesticks
        const candlesticks = chartArea.selectAll('.candlestick')
            .data(tradingData)
            .enter()
            .append('g')
            .attr('class', 'candlestick');

        // High-Low lines (wicks)
        candlesticks.append('line')
            .attr('class', 'wick')
            .attr('x1', d => xScale(d.date) + xScale.bandwidth() / 2)
            .attr('x2', d => xScale(d.date) + xScale.bandwidth() / 2)
            .attr('y1', d => yScale(d.high))
            .attr('y2', d => yScale(d.low))
            .attr('stroke', d => d.close > d.open ? '#26a69a' : '#ef5350')
            .attr('stroke-width', 1);

        // Open-Close bodies
        candlesticks.append('rect')
            .attr('class', 'body')
            .attr('x', d => xScale(d.date))
            .attr('y', d => yScale(Math.max(d.open, d.close)))
            .attr('width', xScale.bandwidth())
            .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)))
            .attr('fill', d => d.close > d.open ? '#26a69a' : '#ef5350')
            .attr('stroke', d => d.close > d.open ? '#26a69a' : '#ef5350')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                setHoveredData(d);
                d3.select(this).attr('stroke-width', 2);
            })
            .on('mouseout', function() {
                setHoveredData(null);
                d3.select(this).attr('stroke-width', 1);
            });

        // Add axes
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat('%m/%d'));

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d => `$${d.toFixed(2)}`);

        chartArea.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(xAxis);

        chartArea.append('g')
            .call(yAxis);

        // Volume chart
        const volumeSvg = d3.select(volumeRef.current)
            .append('svg')
            .attr('width', chartWidth + margin.left + margin.right)
            .attr('height', volumeHeight + margin.top + margin.bottom);

        const volumeArea = volumeSvg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const volumeYScale = d3.scaleLinear()
            .domain([0, d3.max(tradingData, d => d.volume)])
            .range([volumeHeight, 0]);

        // Volume bars
        volumeArea.selectAll('.volume-bar')
            .data(tradingData)
            .enter()
            .append('rect')
            .attr('class', 'volume-bar')
            .attr('x', d => xScale(d.date))
            .attr('y', d => volumeYScale(d.volume))
            .attr('width', xScale.bandwidth())
            .attr('height', d => volumeHeight - volumeYScale(d.volume))
            .attr('fill', d => d.close > d.open ? '#26a69a' : '#ef5350')
            .attr('opacity', 0.7);

        // Volume Y-axis
        const volumeYAxis = d3.axisLeft(volumeYScale)
            .tickFormat(d => `${(d / 1000000).toFixed(1)}M`);

        volumeArea.append('g')
            .call(volumeYAxis);

        volumeArea.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -40)
            .attr('x', -volumeHeight / 2)
            .attr('text-anchor', 'middle')
            .text('Volume');
    };

    return (
        <div style={{ display:"flex", background: "lightblue", padding: "20px" , height:"100vh"}}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '900px' }}>
                {/* Price Chart */}
                <div>
                    <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                        AAPL Stock Price
                    </h3>
                    <div
                        ref={chartRef}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            overflow: 'hidden'
                        }}
                    />
                </div>

                {/* Volume Chart */}
                <div>
                    <div
                        ref={volumeRef}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            overflow: 'hidden'
                        }}
                    />
                </div>

                {/* Hover Info */}
                {/* {hoveredData && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        marginTop: '10px'
                    }}>
                        <h4>Candle Information</h4>
                        <p><strong>Date:</strong> {hoveredData.date.toLocaleDateString()}</p>
                        <p><strong>Open:</strong> ${hoveredData.open.toFixed(2)}</p>
                        <p><strong>High:</strong> ${hoveredData.high.toFixed(2)}</p>
                        <p><strong>Low:</strong> ${hoveredData.low.toFixed(2)}</p>
                        <p><strong>Close:</strong> ${hoveredData.close.toFixed(2)}</p>
                        <p><strong>Volume:</strong> {hoveredData.volume.toLocaleString()}</p>
                        <p><strong>Change:</strong>
                            <span style={{ color: hoveredData.close > hoveredData.open ? 'green' : 'red' }}>
                                ${(hoveredData.close - hoveredData.open).toFixed(2)} ({((hoveredData.close - hoveredData.open) / hoveredData.open * 100).toFixed(2)}%)
                            </span>
                        </p>
                    </div>
                )} */}


                {/* Legend */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '10px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: '#26a69a' }}></div>
                        <span>Bullish (Price Up)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '20px', height: '20px', backgroundColor: '#ef5350' }}></div>
                        <span>Bearish (Price Down)</span>
                    </div>
                </div>
            </div>
            {/* Hover Info */}
            {hoveredData && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'black',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        marginTop: '10px'
                    }}>
                        <h4>Candle Information</h4>
                        <p><strong>Date:</strong> {hoveredData.date.toLocaleDateString()}</p>
                        <p><strong>Open:</strong> ${hoveredData.open.toFixed(2)}</p>
                        <p><strong>High:</strong> ${hoveredData.high.toFixed(2)}</p>
                        <p><strong>Low:</strong> ${hoveredData.low.toFixed(2)}</p>
                        <p><strong>Close:</strong> ${hoveredData.close.toFixed(2)}</p>
                        <p><strong>Volume:</strong> {hoveredData.volume.toLocaleString()}</p>
                        <p><strong>Change:</strong>
                            <span style={{ color: hoveredData.close > hoveredData.open ? 'green' : 'red' }}>
                                ${(hoveredData.close - hoveredData.open).toFixed(2)} ({((hoveredData.close - hoveredData.open) / hoveredData.open * 100).toFixed(2)}%)
                            </span>
                        </p>
                    </div>
                )}
        </div>
    );
}

export default TradeView;