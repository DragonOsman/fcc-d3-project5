"use strict";
const margin = { top: 10, right: 10, bottom: 10, left: 10 };
const svgWidth = 445 - margin.left - margin.right;
const svgHeight = 445 - margin.top - margin.bottom;
const svgContainer = d3.select("#svg-container")
    .append("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)
    .attr("x", 0)
    .attr("y", 0);
const tooltip = d3.selectAll(".container")
    .append("div")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .style("opacity", 0);
const legendContainer = d3.select("main")
    .append("div")
    .attr("id", "legend-container")
    .attr("class", "legend-container");
d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json", {
    method: "GET",
    mode: "cors"
})
    .then(data => {
    const sumBySize = d => d.value;
    const root = d3.hierarchy(data)
        .eachBefore(d => d.data.id = (d.parent ? `${d.parent.data.id}.` : "") + d.data.name)
        .sum(sumBySize)
        .sort((a, b) => b.height - a.height || b.value - a.value);
    let categories = root.leaves().map(nodes => nodes.data.category);
    categories = categories.filter((category, index, self) => self.indexOf(category) === index);
    const color = d3.scaleOrdinal()
        .domain(categories)
        .range(d3.schemeCategory10);
    const treemap = d3.treemap()
        .size([svgWidth, svgHeight]);
    treemap(root);
    const cell = svgContainer.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("class", "group")
        .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
        .attr("x", d => d.x0)
        .attr("y", d => d.y0);
    cell.append("rect")
        .attr("class", "tile")
        .attr("height", d => {
        const height = d.y1 - d.y0;
        return d.value / height;
    })
        .attr("width", d => {
        const width = d.x1 - d.x0;
        return d.value / width;
    })
        .attr("data-name", d => d.data.name)
        .attr("data-category", d => d.data.category)
        .attr("data-value", d => d.data.value)
        .attr("fill", d => color(d.data.category))
        .on("mouseover", (event, d) => {
        tooltip.style("opacity", 0.9);
        tooltip.html(`Name: ${d.data.name}<br />
                      Category: ${d.data.category}<br />
                      Value: ${d.data.value}`)
            .attr("data-value", d.data.value)
            .style("left", `${event.pageX + 28}px`)
            .style("top", `${event.pageY - 10}px`);
    })
        .on("mouseout", () => {
        tooltip.style("opacity", 0);
    });
    cell.append("text")
        .attr("class", "tile-text")
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .text((d) => d)
        .attr("fill", "#fff");
    const legendWidth = (svgWidth + margin.left + margin.right) + 50;
    const legend = legendContainer.append("svg")
        .attr("id", "legend")
        .attr("width", legendWidth);
    const legendOffset = 10;
    const legendRectSize = 15;
    const legendHSpacing = 150;
    const legendVSpacing = legendOffset;
    const legendTextXOffset = legendRectSize + 3;
    const legendTextYOffset = legendOffset + 2;
    const legendElemsPerRow = Math.floor(legendWidth / legendHSpacing);
    legend.attr("height", (legendRectSize + legendVSpacing) * 3);
    const legendElem = legend.append("g")
        .attr("transform", `translate(60, ${legendOffset})`)
        .selectAll("g")
        .data(categories)
        .enter()
        .append("g")
        .attr("transform", (d, i) => {
        return (`translate(${(i % legendElemsPerRow) * legendHSpacing}, 
          ${(Math.floor(i / legendElemsPerRow)) * legendRectSize + legendVSpacing *
            Math.floor(i / legendElemsPerRow)})`);
    });
    legendElem.append("rect")
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .attr("class", "legend-item")
        .attr("fill", d => color(d));
    legendElem.append("text")
        .attr("x", legendTextXOffset)
        .attr("y", legendTextYOffset)
        .text(d => d)
        .style("fill", "#fff");
});
