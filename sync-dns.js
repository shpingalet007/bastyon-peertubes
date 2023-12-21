const fs = require('fs');
const dns = require('dns');

const JSON_FILE = 'list.json';

// Read JSON file
const jsonContent = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

// Function to update IP for a given host
const updateIP = async (host) => {
	return new Promise((resolve, reject) => {
		dns.resolve4(host, (err, addresses) => {
			if (err) {
				console.error(`Failed to resolve IP for ${host}: ${err.message}`);
				resolve(null);
			} else {
				resolve(addresses[0]);
			}
		});
	});
};

// Function to update IP for each host in the JSON
const updateIPs = async () => {
	for (const swarmKey in jsonContent.swarms) {
		const swarm = jsonContent.swarms[swarmKey];
		if (swarm.list) {
			for (const entry of swarm.list) {
				const ip = await updateIP(entry.host);
				if (ip) {
					entry.ip = ip;
				}
			}
		}
	}
};

// Run the updateIPs function
updateIPs().then(() => {
	// Write updated JSON back to file
	fs.writeFileSync(JSON_FILE, JSON.stringify(jsonContent, null, 2));
	console.log('IP addresses updated successfully.');
}).catch((error) => {
	console.error('Error updating IP addresses:', error);
	process.exit(1);
});
