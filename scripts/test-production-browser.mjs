// Compare real browser rendering of development sources and generated dist.
// Requires Chrome's existing CDP endpoint at port 9227.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const servers = [];
for (const [directory, port] of [[root, 8803], [resolve(root, 'dist'), 8804]]) {
    const server = http.createServer(async (request, response) => {
        try {
            const pathname = new URL(request.url, 'http://localhost').pathname;
            const path = resolve(directory, '.' + (pathname === '/' ? '/index.html' : pathname));
            if (!path.startsWith(directory + sep)) throw Error('Outside public directory');
            const data = await readFile(path);
            response.setHeader('Content-Type', ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' })[extname(path)] || 'application/octet-stream');
            response.end(data);
        } catch { response.writeHead(404); response.end(); }
    });
    await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));
    servers.push(server);
}
const target = await fetch('http://127.0.0.1:9227/json/new?about:blank', { method: 'PUT' }).then(response => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map(), failures = new Set(), externalFailures = new Set(), requests = new Map();
socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
        const task = pending.get(message.id); pending.delete(message.id);
        message.error ? task.reject(message.error) : task.resolve(message.result);
    }
    if (message.method === 'Network.requestWillBeSent') requests.set(message.params.requestId, message.params.request.url);
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
        const url = message.params.response.url;
        if (url.includes(':8804/') && !url.endsWith('/favicon.ico')) failures.add(url);
    }
    if (message.method === 'Network.loadingFailed') {
        const url = requests.get(message.params.requestId);
        if (url?.includes('fonts.gstatic.com') || url?.includes('fonts.googleapis.com') || message.params.corsErrorStatus) failures.add(`${url}: ${message.params.errorText}`);
        else if (url && !url.includes('127.0.0.1')) externalFailures.add(`${url.split('?')[0]}: ${message.params.errorText}`);
    }
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
};
try {
    await send('Runtime.enable'); await send('Network.enable'); await send('DOM.enable'); await send('CSS.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    for (const width of [1440, 390]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });
        for (const page of ['/', '/rengi-istanbul.html', '/rengi-antalya.html']) {
            for (const language of ['en', 'ru', 'es', 'ar', 'tr', 'nl']) {
                const snapshots = [];
                for (const port of [8803, 8804]) {
                    await send('Page.navigate', { url: `http://127.0.0.1:${port}${page}?lang=${language}` });
                    for (let attempt = 0; attempt < 100; attempt++) {
                        if (await evaluate(`document.readyState === 'complete' && window.TurkLuxxI18n?.language === '${language}'`)) break;
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                    await evaluate(`(async()=>{await TurkLuxxI18n.ready; await TurkLuxxI18n.setLanguage('${language}');await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));})()`);
                    snapshots.push(await evaluate(`(()=>{
                        const properties=['fontFamily','fontWeight','fontSize','fontStyle','letterSpacing','lineHeight','textRendering','textShadow','webkitFontSmoothing','color','backgroundColor','backgroundImage','display','position','width','height','minWidth','maxWidth','padding','margin','border','borderRadius','gap','flex','flexDirection','gridTemplateColumns','direction','textAlign','whiteSpace','overflowWrap','transform'];
                        return [...document.body.querySelectorAll('*')].filter(element=>!element.closest('script,style,noscript,iframe')&&element.tagName!=='IFRAME').map(element=>{
                            const style=getComputedStyle(element);return {tag:element.tagName,classes:element.className?.baseVal??element.className,styles:Object.fromEntries(properties.map(property=>[property,style[property].replaceAll(location.origin,'ORIGIN')]))};
                        });
                    })()`));
                    if (port === 8804 && language === 'en') {
                        await evaluate(`(()=>{
                            const link=[...document.querySelectorAll('.turkluxx-sales-nav a')].find(element=>element.getClientRects().length);link.dataset.fontProbe='nav';
                            const heading=[...document.querySelectorAll('h1,h2')].find(element=>element.getClientRects().length&&getComputedStyle(element).fontFamily.includes('Cormorant'));if(heading)heading.dataset.fontProbe='heading';
                        })()`);
                        const document = await send('DOM.getDocument');
                        for (const [probe, expected] of [['nav', 'Manrope'], ['heading', 'Cormorant']]) {
                            const node = await send('DOM.querySelector', { nodeId: document.root.nodeId, selector: `[data-font-probe="${probe}"]` });
                            assert.ok(node.nodeId, `Missing ${probe}`);
                            const fonts = await send('CSS.getPlatformFontsForNode', { nodeId: node.nodeId });
                            assert.ok(fonts.fonts.some(font => font.isCustomFont && font.familyName.includes(expected)), JSON.stringify(fonts));
                        }
                    }
                }
                assert.deepEqual(snapshots[1], snapshots[0], `${width}px ${page} ${language}: source/dist styles differ`);
                console.log(`${width}px ${page} ${language}: development/dist computed styles match`);
            }
        }
    }
    assert.equal(failures.size, 0, [...failures].join('\n'));
    console.log('Manrope and Cormorant rendered-font checks passed; no failed site resources or font/CORS requests.');
    if (externalFailures.size) console.log('External services blocked by the browser (also present in development):\n' + [...externalFailures].join('\n'));
} finally {
    await fetch(`http://127.0.0.1:9227/json/close/${target.id}`);
    socket.close(); servers.forEach(server => server.close());
}
