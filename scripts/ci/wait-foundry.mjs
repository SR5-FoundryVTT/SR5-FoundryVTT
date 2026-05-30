/**
 * Block until a running Foundry instance is reachable, or fail after a timeout.
 * Checks both that the TCP port is open and that an HTTP request returns a
 * Foundry page (setup or join), which means the server finished booting.
 *
 * Env:
 *   FOUNDRY_URL      base URL (default http://localhost:30000)
 *   FOUNDRY_TIMEOUT  max seconds to wait (default 300)
 */
import net from 'node:net';

const url = new URL(process.env.FOUNDRY_URL || 'http://localhost:30000');
const timeoutMs = (Number(process.env.FOUNDRY_TIMEOUT) || 300) * 1000;
const intervalMs = 3000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function tcpOpen(host, port) {
    return new Promise((resolve) => {
        const socket = net.connect({ host, port }, () => {
            socket.destroy();
            resolve(true);
        });
        socket.setTimeout(2000);
        socket.on('error', () => resolve(false));
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
    });
}

async function httpReady(base) {
    try {
        const res = await fetch(base, { redirect: 'follow' });
        return res.ok || res.status === 302;
    } catch {
        return false;
    }
}

async function main() {
    const host = url.hostname;
    const port = Number(url.port) || (url.protocol === 'https:' ? 443 : 80);
    const deadline = Date.now() + timeoutMs;

    console.info(`[wait] waiting for Foundry at ${url.origin} (timeout ${timeoutMs / 1000}s)`);
    while (Date.now() < deadline) {
        if ((await tcpOpen(host, port)) && (await httpReady(url.origin))) {
            console.info('[wait] Foundry is ready.');
            return;
        }
        await sleep(intervalMs);
    }
    console.error(`[wait] Foundry not ready after ${timeoutMs / 1000}s`);
    process.exit(1);
}

main();
