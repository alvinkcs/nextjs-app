'use client'

import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';

function KVCacheVisualization({ kvCacheData, layerName = "layer_0", seqList = [] }) {
    const kCacheRef = useRef();
    const vCacheRef = useRef();

    useEffect(() => {
        if (!kvCacheData || !kvCacheData[layerName]) {
            return;
        }

        // Clear previous visualizations
        d3.select(kCacheRef.current).selectAll('*').remove();
        d3.select(vCacheRef.current).selectAll('*').remove();

        const kvCache = kvCacheData[layerName];
        // Assuming kvCache is a 3D array: [seq_len, num_heads, head_dim]
        // For now, we'll visualize the first head's data as a 2D heatmap

        if (kvCache && kvCache.length > 0) {
            // Extract K and V caches (assuming they're stored as separate arrays)
            const kCache = kvCache[0]; // Shape: [seq_len, head_dim]
            const vCache = kvCache[1]; // Shape: [seq_len, head_dim]

            if (kCache && kCache.length > 0) {
                visualizeCache(kCache, kCacheRef.current, 'K Cache', seqList);
            }

            if (vCache && vCache.length > 0) {
                visualizeCache(vCache, vCacheRef.current, 'V Cache', seqList);
            }
        }
    }, [kvCacheData, layerName, seqList]);

    const visualizeCache = (cacheData, containerRef, title, seqList) => {
        if (!cacheData || cacheData.length === 0) return;

        const seqLen = cacheData.length;
        const headDim = cacheData[0].length;

        // Find min and max values for color scale
        const flatData = cacheData.flat();
        const minVal = Math.min(...flatData);
        const maxVal = Math.max(...flatData);
        const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal));

        const margin = { top: 60, right: 80, bottom: 60, left: 80 };
        const cellSize = 25;
        const width = Math.max(800, headDim * cellSize + margin.left + margin.right);
        const height = Math.max(400, seqLen * cellSize + margin.top + margin.bottom);

        const svg = d3.select(containerRef)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Color scale
        const colorScale = d3.scaleSequential(d3.interpolateRdBu)
            .domain([absMax, -absMax]);

        // Create tooltip
        const tooltip = d3.select(containerRef)
            .append('div')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background-color', 'white')
            .style('border', '1px solid #ddd')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none');

        // Add cells
        svg.selectAll('rect')
            .data(cacheData.flat())
            .enter()
            .append('rect')
            .attr('x', (d, i) => margin.left + (i % headDim) * cellSize)
            .attr('y', (d, i) => margin.top + Math.floor(i / headDim) * cellSize)
            .attr('width', cellSize)
            .attr('height', cellSize)
            .attr('fill', d => colorScale(d))
            .attr('stroke', 'none')
            .on('mouseover', function(event, d) {
                const i = d3.select(this).datum();
                const seqIdx = Math.floor(i / headDim);
                const dimIdx = i % headDim;

                tooltip.style('visibility', 'visible')
                    .html(`Seq: ${seqIdx}<br/>Dim: ${dimIdx}<br/>Value: ${d.toFixed(4)}`);
            })
            .on('mousemove', function(event) {
                tooltip.style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function() {
                tooltip.style('visibility', 'hidden');
            });

        // Add title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .text(`${title} - ${layerName}`);

        // Add axes labels
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('Head Dimension');

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .text('Sequence Position');

        // Add sequence labels if provided
        if (seqList && seqList.length > 0) {
            const yScale = d3.scaleBand()
                .domain(seqList.map((_, i) => i))
                .range([margin.top, height - margin.bottom]);

            svg.append('g')
                .attr('transform', `translate(${margin.left - 5}, 0)`)
                .call(d3.axisLeft(yScale).tickFormat((d, i) => seqList[i] || ''))
                .selectAll('text')
                .attr('font-size', '10px');
        }

        // Add colorbar
        const colorbarWidth = 20;
        const colorbarHeight = height - margin.top - margin.bottom;

        const colorbarScale = d3.scaleSequential(d3.interpolateRdBu)
            .domain([absMax, -absMax]);

        const colorbar = svg.append('g')
            .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

        const colorbarData = d3.range(0, colorbarHeight, 1);

        colorbar.selectAll('rect')
            .data(colorbarData)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => i)
            .attr('width', colorbarWidth)
            .attr('height', 1)
            .attr('fill', d => colorbarScale(absMax - (d / colorbarHeight) * (2 * absMax)));

        // Colorbar axis
        const colorbarAxis = d3.axisRight(d3.scaleLinear()
            .domain([-absMax, absMax])
            .range([colorbarHeight, 0]));

        colorbar.append('g')
            .attr('transform', `translate(${colorbarWidth}, 0)`)
            .call(colorbarAxis)
            .selectAll('text')
            .attr('font-size', '10px');
    };

    if (!kvCacheData || !kvCacheData[layerName]) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No KV cache data available for layer {layerName}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px', maxWidth: '1200px' }}>
            <div>
                <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>K Cache Visualization</h3>
                <div style={{ overflow: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: 'white' }} ref={kCacheRef}></div>
            </div>
            <div>
                <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>V Cache Visualization</h3>
                <div style={{ overflow: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', backgroundColor: 'white' }} ref={vCacheRef}></div>
            </div>
        </div>
    );
}

export default KVCacheVisualization;