
const SERVERS = [
    'https://de1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://at1.api.radio-browser.info',
    'https://us1.api.radio-browser.info'
];

async function fetchStation(name) {
    for (const server of SERVERS) {
        try {
            console.log(`Checking ${server}...`);
            const response = await fetch(`${server}/json/stations/search?name=${encodeURIComponent(name)}&limit=10`);
            if (!response.ok) { continue; }
            const data = await response.json();
            if (data && data.length > 0) {
                console.log(`Found ${data.length} stations for "${name}"`);
                data.forEach(s => {
                    console.log(`- [${s.bitrate}k] ${s.name} (${s.country}): ${s.url_resolved}`);
                });
                return;
            }
        } catch (e) {
            console.error(e.message);
        }
    }
}

fetchStation('REYFM');
