LaunchesByProvider = JSON.parse(LaunchesByProvider);
LaunchResultsByProvider = JSON.parse(LaunchResultsByProvider);


let plots = [LaunchesByProvider, LaunchResultsByProvider];


for (let i = 0; i < plots.length; i++) {
    document.body.innerHTML += `<div id=${plots[i].name} />`;

    Plotly.newPlot(plots[i].name, plots[i].data, plots[i].layout)
}
