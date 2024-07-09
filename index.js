require('dotenv').config()
const fs = require('fs');
const { Chart, registerables } = require('chart.js');
const { createCanvas } = require('canvas');

Chart.register(...registerables);

const apiUrl  = process.env.URL
const apiKey  = process.env.KEY
const serverId = process.env.SERVERID
const cookie = process.env.COOKIE

async function getMaxRam() {
    const url = `${apiUrl}/servers/${serverId}`;

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "cookie": `pterodactyl_session=${cookie}`
    };

    try {
        const response = await fetch(url, { headers: headers });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resourcesInfo = await response.json();
        return await resourcesInfo.attributes.limits.memory;
    } catch (error) {
        console.error(`Error fetching server resources: ${error}`);
    }

}

function get_uptime(resourcesInfo) {
    const time = resourcesInfo.attributes.resources.uptime / 1000;
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    return `${hours}h ${minutes}m`;
}
async function getServerResources(serverId) {
    const url = `${apiUrl}/servers/${serverId}/resources`;

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "cookie": `pterodactyl_session=${cookie}`
    };

    try {
        const response = await fetch(url, { headers: headers });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resourcesInfo = await response.json();
        return resourcesInfo;
    } catch (error) {
        console.error(`Error fetching server resources: ${error}`);
    }
}
let maxRam = 0;
getMaxRam(serverId).then(Ram => {
    maxRam = Ram;
});
setInterval(() => {
    getServerResources(serverId).then(resourcesInfo => {
        const stats = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
        const uptime = get_uptime(resourcesInfo);
        if (resourcesInfo) {
            if (stats[serverId]) {
                stats[serverId]["value"].push(resourcesInfo.attributes.resources.memory_bytes / (1024 ** 2));
                stats[serverId]["time"].push(uptime);
            } else {
                stats[serverId] = {};
                stats[serverId]["value"] = [resourcesInfo.attributes.resources.memory_bytes / (1024 ** 2)];
                stats[serverId]["time"] = [uptime];
            }

        } else {
            if (stats[serverId]) {
                stats[serverId]["value"].push(null);
                stats[serverId]["time"].push(uptime);
            } else {
                stats[serverId] = {};
                stats[serverId]["value"] = [null];
                stats[serverId]["time"] = [uptime];
            }
            console.error('Error fetching server resources');
        }
        const canvas = createCanvas(800, 600);
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: stats[serverId]["time"],
                datasets: [
                    {
                        label: 'Memory used',
                        data: stats[serverId]["value"],
                        spanGaps: true,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        type: 'category',
                        display: true,
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        min: 0,
                        max: maxRam
                    }
                }
            }
        });
        const out = fs.createWriteStream(__dirname + '/output.png');
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        fs.writeFileSync('stats.json', JSON.stringify(stats, null, 4), 'utf8', (err) => {
            if (err) {
                console.error(`Can't write stats.json :`, err);
                return;
            }
    });})
}, 60000);
