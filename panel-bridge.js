// panel-bridge.js
// CEP panel-side bridge: exposes an HTTP API for Node.js to trigger ExtendScript
// Place this in your extension's JS bundle and load on panel startup

const csInterface = new CSInterface();
const express = require('express');
const app = express();
app.use(express.json());

// Load ExtendScript file on panel load (adjust path if needed)
csInterface.evalScript('$.evalFile("trimClipByFrames.jsx")');

app.post('/run-extendscript', (req, res) => {
  const { functionName, args } = req.body;
  const scriptCall = `${functionName}(${args.map(JSON.stringify).join(',')})`;
  csInterface.evalScript(scriptCall, (result) => {
    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (e) {
      res.json({ success: false, error: 'Failed to parse ExtendScript result', raw: result });
    }
  });
});

app.listen(4000, () => console.log('CEP panel bridge listening on port 4000'));
