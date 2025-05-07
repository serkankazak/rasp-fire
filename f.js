const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const { exec, execSync, spawn } = require('child_process');

const ccblu = '\x1b[34m';
const ccred = '\x1b[31m';
const ccgre = '\x1b[32m';
const ccres = '\x1b[0m';

const tail = spawn('tail', ['-n0', '-f', '/var/log/kern.log']);
tail.stderr.on('data', (data) => { console.log(`[!]: stderr: ${data}`); });
tail.on('close', (code) => { console.log(`[!]: child process exited with code ${code}`); });

execSync("sudo service dnsmasq restart || echo ''");
const dns = spawn('sudo', ['tcpdump', '-l', '-v', '-i', 'eth0', 'udp', 'port', '53']);
dns.stderr.on('data', (data) => { console.log(`[!]: stderr: ${data}`); });
dns.on('close', (code) => { console.log(`[!]: child process exited with code ${code}`); });

var cdns = {};

const server = https.createServer({
	cert: fs.readFileSync('cert/cert.pem'),
	key: fs.readFileSync('cert/key.pem')
}, (req, res) => {
	res.writeHead(200);
	res.end('hi\n');
});
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {

	console.log(ccblu + "[*]: connected" + ccres);

	var whites = [];
	var whitesd = [];
	execSync("sudo iptables -L FORWARD -n | grep '^ACCEPT' | awk '{print $5}' | grep -v '^0\\.0\\.0\\.0/0$' || echo ''").toString().split(/\n/).forEach(x => {
		if (x.indexOf('.') != -1) {
			whites.push(x);
		}
	});
	execSync("sudo iptables -L FORWARD | grep '^ACCEPT' | awk '{print $5}' | grep -v '^anywhere$' || echo ''").toString().split(/\n/).forEach(x => {
		if (x.indexOf('.') != -1) {
			whitesd.push(x);
		}
	});

	var go = [];
	whites.forEach((x, i) => {
		go.push([x, whitesd[i]]);
	});
	ws.send(JSON.stringify(go));

	ws.on('message', function incoming(mm) {
	
		var m = Buffer.from(mm).toString();

		console.log(m);

		if (m.length > 9 && m.slice(0, 10) == "secret1234") {
			var jo = m.slice(10).split(/,/);
			if (jo[0] == 'allow' && jo[1].match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/)) {
				if (whites.indexOf(jo[1]) == -1) {
					console.log(ccgre + '[*]: allow: ' + jo[1] + ccres);
					whites.push(jo[1]);
					exec('sudo iptables -I FORWARD 2 -i wlan0 -o eth0 -d ' + jo[1] + ' -j ACCEPT; sudo iptables -I FORWARD 2 -i eth0 -o wlan0 -s ' + jo[1] + ' -m state --state RELATED,ESTABLISHED -j ACCEPT; sudo iptables -S | grep ' + jo[1].replace(/\./g, "\\.") + ' | wc -l | tr -d "\n"', (e, so, se) => {
						ws.send(`add${so},${jo[1]}`);
					});
				} else {
					ws.send('already exists');
				}
			}
			if (jo[0] == 'remove' && jo[1].match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/)) {
				if (whites.indexOf(jo[1]) != -1) {
					console.log(ccred + '[*]: remove: ' + jo[1] + ccres);
					whites.splice(whites.indexOf(jo[1]), 1);
					exec('sudo iptables -D FORWARD -i wlan0 -o eth0 -d ' + jo[1] + ' -j ACCEPT; sudo iptables -D FORWARD -i eth0 -o wlan0 -s ' + jo[1] + ' -m state --state RELATED,ESTABLISHED -j ACCEPT; sudo iptables -S | grep ' + jo[1].replace(/\./g, "\\.") + ' | wc -l | tr -d "\n"', (e, so, se) => {
						ws.send(`rem${so},${jo[1]}`);
					});
				} else {
					ws.send('doesn\'t exists');
				}
			}
		}
	
	});

	tail.stdout.on('data', (data) => {

		`${data}`.split(/\n/).forEach(xx => {
			if (xx.indexOf('<<firefire>') != -1) {

				var x = xx.replace(/^.* DST=/, '').replace(/ .*$/, '');
				if (x.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/)) {
					ws.send("ipip," + x);
				} else {
					console.log("[!]: " + x);
					console.log("[!!]: " + xx);
				}
			}
		});

	});

	dns.stdout.on('data', (data) => {

		console.log("========================");
		console.log(`${data}`.replace(/\n/g, "\n\n"));
		console.log("========================");

		`${data}`.replace(/([^ ]+\. A [0-9.]+)/g, "$1\n").split(/\n/).forEach(x => {
			if (x.indexOf(". A ") != -1) {
				var ip = x.split("").reverse().join("").replace(/^([^ ]+) [^ ]+.*$/, "$1").split("").reverse().join("");
				var dd = x.split("").reverse().join("").replace(/^[^ ]+ A \./, "").replace(/^([^ ]+) .*$/, "$1").split("").reverse().join("");
				if (cdns[ip] == null) { cdns[ip] = []; }				
				if (cdns[ip] && cdns[ip].indexOf(dd) == -1) { cdns[ip].push(dd); console.log(cdns); }
				ws.send("dnss," + ip + "," + dd);
			}
		});

	});

});

server.listen(8765);
