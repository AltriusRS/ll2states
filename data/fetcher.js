const fs = require('fs');

const axios = require('axios');


const config = {
    headers: {
        "Authorization": "Token ed69f29f4b5ec51ece77d6e691496ce3d85598b4",
        "user-agent": "Nextlaunch Data Sync V0.0.1"
    }
}

module.exports = run;

async function run() {
    // Read existing launch cache
    let f = JSON.parse(fs.readFileSync(__dirname + `/data.json`, 'utf8'))

    if (Math.round(Date.now() / 1000) - f.fetched > (60 * 60 * 24)) {
        console.log(`Age of launchcache is > 1 day`)
        let data = await getLaunch(`https://ll.thespacedevs.com/2.2.0/launch?format=json&mode=list&limit=100`)

        let core = data;

        while (data.next !== null) {
            console.log(`Launches Stored: ${core.results.length}  | Fetching: ${data.next}`);
            data = await getLaunch(data.next);
            core.results = core.results.concat(data.results);
        }
        f = {count: core.count, results: core.results, fetched: Math.round(Date.now() / 1000)}
        fs.writeFileSync(__dirname + `/data.json`, JSON.stringify(f))
    }

    return f;
}


async function getLaunch(uri) {
    let {data} = await axios.get(uri, config);

    return data;
}
