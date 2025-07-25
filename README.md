# Premiere Pro MCP Server

![Premiere Pro Timeline Example](timeline1e.jpg)

**Unofficial MCP (Model Context Protocol) Server for Adobe Premiere Pro**

<a href="https://glama.ai/mcp/servers/@jordanl61/premiere-pro-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@jordanl61/premiere-pro-mcp-server/badge" alt="Premiere Pro Server MCP server" />
</a>

---

## Overview

This project provides an MCP-compatible server that enables advanced automation, querying, and remote control of Adobe Premiere Pro projects. It is designed for power users, workflow automation, and integration with AI or scripting tools.

> **Disclaimer**  
> This project is **not affiliated with, endorsed by, or supported by Adobe Inc.** in any way. It is a third-party tool developed independently for use with Adobe Premiere Pro.  
> **Use at your own risk.** No guarantees are made regarding functionality, compatibility, or safety. The author(s) accept no liability for any loss, damage, or data corruption that may result from use of this software.  
> Always back up your projects before use.

---

## Features & Available Tools

The server exposes the following tools via MCP API:

- **get_project_info**: Get basic information about the current Premiere Pro project
- **get_active_sequence_info**: Get detailed information about the currently active sequence
- **list_all_sequences**: List all sequences in the current project with basic info
- **get_sequence_details**: Get detailed information about a specific sequence including tracks, effects, and markers
- **get_timeline_structure**: Get the track structure of the active sequence
- **get_timeline_clips**: Get all clips in the active sequence with detailed information
- **get_project_media**: Get all media items in the project browser with file information
- **get_project_bins**: Get project bin structure and organization
- **get_playhead_info**: Get current playhead position and playback state
- **get_selection_info**: Get information about currently selected clips or time range
- **get_export_presets**: Get available export presets and their settings
- **get_render_queue**: Get current render queue status and items
- **create_sequence**: Create a new sequence in Premiere Pro
- **export_project**: Export the current project or sequence
- **trim_clip_by_frames**: Trim (or extend) the in/out point of a video or audio clip by a specified number of frames.
  - Parameters: sequenceId, clipId, framesDelta, direction ('in'|'out'), trackType ('video'|'audio')

---

## UI Integration Example

To add a UI for trimming clips by frames, include the following snippet in your CEP panel:

```html
<div>
  <label>Track Type:
    <select id="trackType">
      <option value="video">Video</option>
      <option value="audio">Audio</option>
    </select>
  </label>
  <label>Direction:
    <select id="direction">
      <option value="in">In</option>
      <option value="out">Out</option>
    </select>
  </label>
  <label>Frames Delta:
    <input type="number" id="framesDelta" value="10" />
  </label>
  <button onclick="trimClipUI()">Trim Clip</button>
</div>
<script>
async function trimClipUI() {
  // Replace with actual logic to get selected sequence/clip IDs
  const sequenceId = 0; // Example: active sequence index
  const clipId = getSelectedClipId(); // Implement this function based on your panel logic
  const framesDelta = parseInt(document.getElementById('framesDelta').value, 10);
  const direction = document.getElementById('direction').value;
  const trackType = document.getElementById('trackType').value;

  const response = await fetch('http://localhost:5000/trim_clip_by_frames', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sequenceId, clipId, framesDelta, direction, trackType })
  });
  const result = await response.json();
  alert(result.content[0].text);
}
</script>
```

Replace `getSelectedClipId()` with your actual logic for getting the selected clip.
- Adobe Premiere Pro (tested on latest versions)
- Node.js (LTS recommended)
- MCP-compatible client (optional, for automation)

## What is CEP?

Adobe CEP (Common Extensibility Platform) is the technology that enables custom panels and extensions in Adobe Creative Cloud apps like Premiere Pro, After Effects, and Photoshop.  
Learn more and find developer resources at the [Adobe CEP GitHub Organization](https://github.com/Adobe-CEP).

---

## Prerequisites

Before you begin, make sure you have:

- **Adobe Premiere Pro** (or compatible Adobe app)
- **Node.js** (if the MCP server is Node-based) or Python (if Python-based)
- **Access to the Premiere MCP Server code**
- **The CEP extension files** (included in this repo or provided separately)

---

## Installation & Usage Guide

### 1. Install the CEP Extension

1. **Locate the extension folder**  
   (Usually named something like `com.yourcompany.premiere-mcp`)

2. **Copy the folder to the Adobe CEP extensions directory:**

   - **Windows:**  
     ```
     %APPDATA%\Adobe\CEP\extensions
     ```
   - **macOS:**  
     ```
     ~/Library/Application Support/Adobe/CEP/extensions
     ```

3. **Enable Developer Mode** in Adobe apps:  
   - Open the Creative Cloud app
   - Go to Preferences → “Plugins” → Enable “Developer Mode”
   - Or, for older versions, set the `PlayerDebugMode` registry key (see [Adobe-CEP/Getting-Started](https://github.com/Adobe-CEP/Getting-Started))

4. **Restart Premiere Pro**  
   - Open the app, go to `Window > Extensions` and select your panel.

### 2. Install & Run the MCP Server

1. **Install dependencies**  
   (e.g., for Node.js: `npm install` or for Python: `pip install -r requirements.txt`)

2. **Start the server**  
   (e.g., `npm start`, `node server.js`, or `python server.py`)

   > By default, the server runs on `localhost:PORT` (replace PORT with your config, e.g., 5000).

3. **Keep the server running** while using the extension in Premiere Pro.

### 3. Configure the Extension (if needed)

- If your extension requires specifying the server URL/port, edit the config file or use the panel’s settings.

### 4. Troubleshooting

- **Status: Error: Failed to fetch**  
  This means the MCP server is not running or is unreachable.  
  - Make sure the server is started and matches the port expected by the extension.
  - Check firewall/antivirus settings.

- **Panel not showing up in Premiere**  
  - Confirm the extension is in the correct directory.
  - Developer Mode must be enabled.
  - Restart Premiere after installation.

- **More help:**  
  See [Adobe-CEP/Getting-Started](https://github.com/Adobe-CEP/Getting-Started) and [Adobe-CEP](https://github.com/Adobe-CEP) for additional documentation and troubleshooting tips.

---

## Installation & Usage Guide for Premiere MCP Server

### 1. Prerequisites
- **Adobe Premiere Pro** (latest or supported version installed)
- **Node.js** (LTS version recommended)
- **npm** (comes with Node.js)
- (Optional) **Claude Desktop** or any AI IDE that supports MCP server integration

### 2. Installation Steps

**a. Clone the Repository**
```sh
git clone https://github.com/yourusername/premiere-mcp-server.git
cd premiere-mcp-server
```

**b. Install Dependencies**
```sh
npm install
```

### 3. Running the Server

**Start the MCP server:**
```sh
node mcp-server.js
```
- The server should output a message indicating it is running and listening for MCP connections.

### 4. Connecting to Claude Desktop or an AI IDE

**a. Open Claude Desktop (or your AI IDE).**

**b. Add the Premiere MCP Server as a new MCP server:**
   - In Claude Desktop, go to the MCP server settings or integration panel.
   - Enter the address for your MCP server (typically `http://localhost:PORT`—replace `PORT` with the port your server uses, e.g., `http://localhost:3000`).
   - Save or apply the settings.

**c. Test the Connection:**
   - Claude Desktop (or your IDE) should now list the Premiere MCP Server and its available tools.
   - Try running a simple command (like `get_project_info`) to verify connectivity.

### 5. Using the Tools
- Once connected, you can invoke any of the available tools (see above) directly from your AI IDE or automation scripts.
- Example: Ask Claude Desktop to “list all sequences” or “export the current project.”

### 6. Troubleshooting
- **Server not connecting?**
  - Make sure Premiere Pro is running.
  - Ensure the MCP server is running (no errors in the terminal).
  - Double-check the server URL and port in your IDE.
  - If using a firewall, ensure the port is open.

### 7. Security & Disclaimer
- This project is not affiliated with or endorsed by Adobe.
- Use at your own risk. Always back up your projects.
- The author provides no guarantees or support for any data loss or issues.

---


## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**This project is not produced, endorsed, or supported by Adobe.**