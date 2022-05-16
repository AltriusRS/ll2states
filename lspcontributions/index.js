const launches = require(__dirname + "/../data/fetcher")()

const fs = require("fs");

let total = {
    x: [],
    y: [],
    type: 'bar',
    text: [],
    marker: {
        color: '#8E7CC3'
    }
}

let success = {
    x: [],
    y: [],
    type: 'bar',
    text: [],
    name: "Successful",
    marker: {
        color: '#308018'
    }
}

let fail = {
    x: [],
    y: [],
    type: 'bar',
    text: [],
    name: "Failure",
    marker: {
        color: '#a11f21'
    }
}

let partFail = {
    x: [],
    y: [],
    type: 'bar',
    text: [],
    name: "Partial Failure",
    marker: {
        color: '#C37125'
    }
}


let output = {
    name: "LaunchResultsByProvider",
    data: [success, fail, partFail],
    layout: {
        title: 'Launch Results by provider',
        font: {
            family: 'Raleway, sans-serif'
        },
        showlegend: true,
        xaxis: {
            // tickangle: 0
        },
        yaxis: {
            zeroline: false,
            gridwidth: 2
        },
        bargap: 0.05
    }
}


let altOutput = {
    name: "LaunchesByProvider",
    data: [total],
    layout: {
        title: 'Launches by Provider',
        font: {
            family: 'Raleway, sans-serif'
        },
        showlegend: false,
        xaxis: {
            // tickangle: 0
        },
        yaxis: {
            zeroline: false,
            gridwidth: 2
        },
        bargap: 0.05
    }
}

let app = {
    config: {
        rotate: 90,
        align: 'left',
        verticalAlign: 'middle',
        position: 'insideBottom',
        distance: 15
    }
}

let labelOption = {
    show: true,
    position: app.config.position,
    distance: app.config.distance,
    align: app.config.align,
    verticalAlign: app.config.verticalAlign,
    rotate: app.config.rotate,
    formatter: '{c}  {name|{a}}',
    fontSize: 16,
    rich: {
        name: {}
    }
}

let s = {
    name: 'Wetland',
    type: 'bar',
    label: labelOption,
    emphasis: {
        focus: 'series'
    },
    data: [98, 77, 101, 99, 40]
}


let lsps = {};

console.log(`Fetching launches`)
launches.then((data) => {
    data.results.forEach(launch => {
        if (!lsps[launch.lsp_name]) {
            lsps[launch.lsp_name] = {
                count: 0,
                pc: 0.00,
                stats: {
                    success: 0,
                    fail: 0,
                    partFail: 0
                }
            };
        }
        ;


        lsps[launch.lsp_name].count += 1;


        switch (launch.status.id) {
            case 3:
                lsps[launch.lsp_name].stats.success += 1;
                break;
            case 4:
                lsps[launch.lsp_name].stats.fail += 1;
                break;
            case 7:
                lsps[launch.lsp_name].stats.partFail += 1;
                break;
        }


        lsps[launch.lsp_name].pc = (lsps[launch.lsp_name].count / data.count) * 100;

    });


    let keys = Object.keys(lsps);

    keys = keys.sort((a, b) => {
        if (lsps[a].pc > lsps[b].pc) {
            return -1
        } else if (lsps[a].pc < lsps[b].pc) {
            return 1
        } else {
            return 0
        }
    });

    let other = {
        whole: 0.00,
        success: 0.00,
        fail: 0.00,
        partFail: 0.00
    }

    let above = []

    for (let i = keys.length - 1; i > 0; i--) {
        if (lsps[keys[i]].pc < 1) {
            other.whole += lsps[keys[i]].count;
            other.success += lsps[keys[i]].stats.success;
            other.fail += lsps[keys[i]].stats.fail;
            other.partFail += lsps[keys[i]].stats.partFail;
        } else {
            let x = lsps[keys[i]];
            x.name = keys[i];
            above.push(x);
        }

        console.log(`${keys[i]}: ${lsps[keys[i]].pc.toFixed(2)}% (${lsps[keys[i]].count} launches)`)
    }


    for (let i = 0; i < above.length; i++) {

        // altOutput.data[0].text.push("% of Catalogued Launches");
        // output.data[1-1].text.push("Successful % of LSP launches");
        // output.data[2-1].text.push("Failure % of LSP launches");
        // output.data[3-1].text.push("Partial Failure % of LSP launches");

        altOutput.data[0].x.push(above[i].name);
        output.data[1-1].x.push(above[i].name);
        output.data[2-1].x.push(above[i].name);
        output.data[3-1].x.push(above[i].name);

        altOutput.data[0].y.push(pc(above[i].count, data.count));
        output.data[1-1].y.push(pc(above[i].stats.success, above[i].count));
        output.data[2-1].y.push(pc(above[i].stats.fail, above[i].count));
        output.data[3-1].y.push(pc(above[i].stats.partFail, above[i].count));
    }

    fs.writeFileSync(__dirname + '/../charts/ContributionsByLSP.json', JSON.stringify(altOutput))
    fs.writeFileSync(__dirname + '/../charts/LSPLaunchResults.json', JSON.stringify(output))

})


function pc(a,b) {
    let pc = parseFloat(((a/b)*100).toFixed(2));

    if(pc === 0 ) pc = 0.01

    return pc;
}
