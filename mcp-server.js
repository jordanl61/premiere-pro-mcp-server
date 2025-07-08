#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

class PremiereProMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'premiere-pro-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [
        {
          name: "get_project_info",
          description: "Get basic information about the current Premiere Pro project",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_active_sequence_info", 
          description: "Get detailed information about the currently active sequence",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "list_all_sequences",
          description: "List all sequences in the current project with basic info",
          inputSchema: {
            type: "object", 
            properties: {},
            required: []
          }
        },
        {
          name: "get_sequence_details",
          description: "Get detailed information about a specific sequence including tracks, effects, and markers",
          inputSchema: {
            type: "object",
            properties: {
              sequence_name: {
                type: "string",
                description: "Name of the sequence to get details for"
              }
            },
            required: ["sequence_name"]
          }
        },
        {
          name: "get_timeline_structure",
          description: "Get the track structure of the active sequence",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_timeline_clips", 
          description: "Get all clips in the active sequence with detailed information",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_project_media",
          description: "Get all media items in the project browser with file information",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_project_bins",
          description: "Get project bin structure and organization",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_playhead_info",
          description: "Get current playhead position and playback state",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_selection_info",
          description: "Get information about currently selected clips or time range",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_export_presets",
          description: "Get available export presets and their settings",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "get_render_queue",
          description: "Get current render queue status and items",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          }
        },
        {
          name: "trim_clip_by_frames",
          description: "Trim or extend the in/out point of a video or audio clip by a number of frames.",
          inputSchema: {
            type: "object",
            properties: {
              sequenceId: { type: "number", description: "Index of the sequence (0-based)" },
              clipId: { type: "string", description: "ID of the clip to trim" },
              framesDelta: { type: "number", description: "Number of frames to trim (positive or negative)" },
              direction: { type: "string", enum: ["in", "out"], description: "Which edit point to trim ('in' or 'out')" },
              trackType: { type: "string", enum: ["video", "audio"], description: "Track type ('video' or 'audio')" }
            },
            required: ["sequenceId", "clipId", "framesDelta", "direction", "trackType"]
          }
        },
        {
          name: 'create_sequence',
          description: 'Create a new sequence in Premiere Pro',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the new sequence',
              },
              width: {
                type: 'number',
                description: 'Width in pixels (default: 1920)',
              },
              height: {
                type: 'number', 
                description: 'Height in pixels (default: 1080)',
              },
              framerate: {
                type: 'number',
                description: 'Frame rate (default: 23.976)',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'export_project',
          description: 'Export the current project or sequence',
          inputSchema: {
            type: 'object',
            properties: {
              output_path: {
                type: 'string',
                description: 'Output file path',
              },
              preset_name: {
                type: 'string',
                description: 'Export preset name (default: H.264 High Quality)',
              },
              include_audio: {
                type: 'boolean',
                description: 'Include audio in export (default: true)',
              },
            },
            required: ['output_path'],
          },
        },
      ];

      return {
        tools,
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_project_info':
            return await this.getProjectInfo();
          
          case 'get_active_sequence_info':
            return await this.getActiveSequenceInfo();
            
          case 'list_all_sequences':
            return await this.listAllSequences();
            
          case 'get_sequence_details':
            return await this.getSequenceDetails(args.sequence_name);
            
          case 'get_timeline_structure':
            return await this.getTimelineStructure();
            
          case 'get_timeline_clips':
            return await this.getTimelineClips();
            
          case 'get_project_media':
            return await this.getProjectMedia();
            
          case 'get_project_bins':
            return await this.getProjectBins();
            
          case 'get_playhead_info':
            return await this.getPlayheadInfo();
            
          case 'get_selection_info':
            return await this.getSelectionInfo();
            
          case 'get_export_presets':
            return await this.getExportPresets();
            
          case 'get_render_queue':
            return await this.getRenderQueue();

          case 'create_sequence':
            return await this.createSequence(args);

          case 'export_project':
            return await this.exportProject(args);

          case 'trim_clip_by_frames': {
            // Dynamically import and call the ExtendScript function
            const { sequenceId, clipId, framesDelta, direction, trackType } = args;
            // Here you would use your existing bridge to call the ExtendScript file
            // For demonstration, we'll assume a function runExtendScriptFile exists
            const { runExtendScriptFile } = require('./runExtendScriptFile');
            const result = await runExtendScriptFile('trimClipByFrames.jsx', 'trimClipByFrames', [sequenceId, clipId, framesDelta, direction, trackType]);
            if (result && result.success) {
              return {
                content: [
                  { type: 'text', text: `✅ Clip trimmed successfully.` }
                ]
              };
            } else {
              return {
                content: [
                  { type: 'text', text: `❌ Failed to trim clip: ${result && result.error ? result.error : 'Unknown error'}` }
                ],
                isError: true
              };
            }
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `\u274c Error executing ${name}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async getProjectInfo() {
    try {
      // Fetch real project info from HTTP server which communicates with Premiere Pro
      const response = await fetch('http://localhost:3001/api/project-stats');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const projectData = await response.json();
      
      return {
        content: [
          {
            type: 'text',
            text: `**Current Premiere Pro Project Information:**

📽️ **Project**: ${projectData.projectName || 'Unknown Project'}
🎬 **Sequences**: ${projectData.sequences || 0}
🎥 **Clips**: ${projectData.clips || 0}
📁 **Bins**: ${projectData.bins || 0}  
🛤️ **Tracks**: ${projectData.tracks || 0}
⏱️ **Duration**: ${projectData.duration || 'Unknown'}

*Retrieved from active Premiere Pro instance*`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Error getting project info**: ${error.message}

**Troubleshooting:**
- Ensure Premiere Pro is running
- Check that HTTP server is running on port 3001
- Verify the MCP extension is loaded in Premiere Pro
- Make sure a project is open in Premiere Pro`,
          },
        ],
        isError: true,
      };
    }
  }

  async getActiveSequenceInfo() {
    try {
      const response = await fetch('http://localhost:3001/api/active-sequence');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}\n\n🔧 **Troubleshooting Steps:**\n1. Make sure Premiere Pro is running\n2. Open a project with an active sequence\n3. Ensure the CEP extension is loaded\n4. Click "Refresh Project Info" in the extension`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text', 
            text: `🎬 **Active Sequence Details**\n\n**Name:** ${data.sequence_name}\n**Duration:** ${data.duration}\n**Frame Rate:** ${data.frame_rate} fps\n**Resolution:** ${data.resolution.width}x${data.resolution.height}\n**Audio Sample Rate:** ${data.audio_sample_rate} Hz\n**Timecode Start:** ${data.timecode_start}\n**Playhead Position:** ${data.playhead_position}\n**Video Tracks:** ${data.track_count.video_tracks}\n**Audio Tracks:** ${data.track_count.audio_tracks}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get active sequence info**\n\nError: ${error.message}\n\n🔧 **Troubleshooting:**\n1. Check that the HTTP server is running on port 3001\n2. Ensure Premiere Pro is open with an active sequence\n3. Verify CEP extension is loaded and functional`,
          },
        ],
        isError: true,
      };
    }
  }

  async listAllSequences() {
    try {
      const response = await fetch('http://localhost:3001/api/sequences');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      const sequenceList = data.sequences.map(seq => 
        `• **${seq.name}** (${seq.duration}) - ${seq.resolution} @ ${seq.frame_rate}fps - ${seq.clip_count} clips ${seq.is_active ? '✅ ACTIVE' : ''}`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎬 **All Sequences (${data.total_sequences})**\n\n${sequenceList}\n\n**Active Sequence:** ${data.active_sequence}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to list sequences**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getSequenceDetails(sequenceName) {
    try {
      const response = await fetch(`http://localhost:3001/api/sequence-details?name=${encodeURIComponent(sequenceName)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      const videoTracks = data.tracks.video_tracks.map(track => 
        `  • Track ${track.track_number}: ${track.track_name} (${track.clip_count} clips) ${track.is_locked ? '🔒' : ''} ${track.is_visible ? '👁️' : '🙈'}`
      ).join('\n');

      const audioTracks = data.tracks.audio_tracks.map(track => 
        `  • Track ${track.track_number}: ${track.track_name} (${track.clip_count} clips) ${track.is_locked ? '🔒' : ''} ${track.is_muted ? '🔇' : '🔊'} ${track.is_solo ? '🎯' : ''}`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎬 **Sequence Details: ${data.sequence_name}**\n\n**Settings:**\n• Resolution: ${data.settings.resolution.width}x${data.settings.resolution.height}\n• Frame Rate: ${data.settings.frame_rate} fps\n• Audio: ${data.settings.audio_sample_rate} Hz\n\n**Video Tracks:**\n${videoTracks}\n\n**Audio Tracks:**\n${audioTracks}\n\n**Applied Effects:** ${data.effects_applied.join(', ')}\n**Markers:** ${data.markers.length}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get sequence details**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getTimelineStructure() {
    try {
      const response = await fetch('http://localhost:3001/api/timeline-structure');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text', 
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      const videoTracks = data.video_tracks.map(track => 
        `  • V${track.track_index}: ${track.track_name} ${track.is_locked ? '🔒' : ''} ${track.is_visible ? '👁️' : '🙈'} (${track.blend_mode})`
      ).join('\n');

      const audioTracks = data.audio_tracks.map(track => 
        `  • A${track.track_index}: ${track.track_name} ${track.is_locked ? '🔒' : ''} ${track.is_muted ? '🔇' : '🔊'} ${track.is_solo ? '🎯' : ''} (Vol: ${track.volume}dB, Pan: ${track.pan})`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎬 **Timeline Structure: ${data.sequence_name}**\n\n**Video Tracks:**\n${videoTracks}\n\n**Audio Tracks:**\n${audioTracks}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get timeline structure**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getTimelineClips() {
    try {
      const response = await fetch('http://localhost:3001/api/timeline-clips');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      const clipsList = data.clips.slice(0, 20).map(clip => 
        `• **${clip.clip_name}** (${clip.track_type}${clip.track_number})\n  📍 ${clip.timeline_in} → ${clip.timeline_out} (${clip.duration})\n  📁 ${clip.source_file_path.split('\\').pop()}\n  ⚡ ${clip.speed}% ${clip.effects.length > 0 ? `| Effects: ${clip.effects.join(', ')}` : ''}`
      ).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎬 **Timeline Clips (${data.total_clips} total${data.total_clips > 20 ? ', showing first 20' : ''})**\n\n${clipsList}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get timeline clips**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getProjectMedia() {
    try {
      const response = await fetch('http://localhost:3001/api/project-media');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      const mediaList = data.media_items.slice(0, 15).map(media => 
        `• **${media.file_name}** (${media.duration})\n  📐 ${media.resolution.width}x${media.resolution.height} @ ${media.frame_rate}fps\n  💾 ${media.file_size_mb}MB | 🎵 ${media.audio_channels}ch @ ${media.audio_sample_rate}Hz\n  📁 ${media.bin_location} | Used: ${media.usage_count}x ${media.is_offline ? '❌ OFFLINE' : '✅'}`
      ).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `📁 **Project Media (${data.total_media_count} items${data.total_media_count > 15 ? ', showing first 15' : ''})**\n\n${mediaList}\n\n**Total Duration:** ${data.total_duration}\n**Offline Media:** ${data.offline_media_count} items`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get project media**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getProjectBins() {
    try {
      const response = await fetch('http://localhost:3001/api/project-bins');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      const binsList = data.bins.map(bin => {
        const indent = bin.parent_bin ? '  ' : '';
        const subBins = bin.sub_bins.length > 0 ? ` (${bin.sub_bins.length} sub-bins)` : '';
        return `${indent}📁 **${bin.bin_name}** - ${bin.media_count} items${subBins} ${bin.color_label ? `🏷️ ${bin.color_label}` : ''}`;
      }).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `📁 **Project Bins (${data.total_bins} total)**\n\n${binsList}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get project bins**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getPlayheadInfo() {
    try {
      const response = await fetch('http://localhost:3001/api/playhead');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `⏱️ **Playhead Info**\n\n**Sequence:** ${data.sequence_name}\n**Timecode:** ${data.timecode}\n**Frame:** ${data.frame_number}\n**Progress:** ${data.percentage_complete}%\n**Status:** ${data.is_playing ? '▶️ Playing' : '⏸️ Paused'}\n**Speed:** ${data.playback_speed}x`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get playhead info**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getSelectionInfo() {
    try {
      const response = await fetch('http://localhost:3001/api/selection');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      if (data.selection_type === 'none') {
        return {
          content: [
            {
              type: 'text',
              text: `🎯 **Selection Info**\n\nNo clips or time range currently selected.`,
            },
          ],
        };
      }

      const selectedClips = data.selected_clips.map(clip => 
        `• **${clip.clip_name}** (${clip.track_type}${clip.track_number})`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎯 **Selection Info**\n\n**Type:** ${data.selection_type}\n**Selected Clips:**\n${selectedClips}\n\n**Time Range:** ${data.selection_in} → ${data.selection_out}\n**Duration:** ${data.selection_duration}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get selection info**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getExportPresets() {
    try {
      const response = await fetch('http://localhost:3001/api/export-presets');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      const presetsList = data.presets.map(preset => 
        `• **${preset.preset_name}** (${preset.format})\n  📐 ${preset.resolution.width}x${preset.resolution.height} @ ${preset.frame_rate}fps\n  📊 Video: ${preset.bitrate} | Audio: ${preset.audio_codec} @ ${preset.audio_bitrate}`
      ).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎥 **Export Presets**\n\n${presetsList}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get export presets**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getRenderQueue() {
    try {
      const response = await fetch('http://localhost:3001/api/render-queue');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      if (data.total_queue_items === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `🎬 **Render Queue**\n\nNo items in render queue.`,
            },
          ],
        };
      }

      const queueList = data.queue_items.map(item => {
        const statusEmoji = {
          'queued': '⏳',
          'rendering': '🔄',
          'complete': '✅',
          'error': '❌'
        }[item.status] || '❓';
        
        return `${statusEmoji} **${item.sequence_name}**\n  📁 ${item.output_path}\n  ⚙️ ${item.preset} | Progress: ${item.progress_percentage}%\n  ⏱️ ETA: ${item.estimated_time_remaining}`;
      }).join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `🎬 **Render Queue (${data.total_queue_items} items)**\n\n${queueList}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to get render queue**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async createSequence(args) {
    const { name, width = 1920, height = 1080, framerate = 23.976 } = args;
    
    try {
      const response = await fetch('http://localhost:3001/api/create-sequence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          width,
          height,
          framerate
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ **Sequence Created Successfully**\n\n**Name:** ${data.sequence_name}\n**Resolution:** ${data.resolution.width}x${data.resolution.height}\n**Frame Rate:** ${data.frame_rate} fps\n**Created:** ${data.created_timestamp}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to create sequence**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async exportProject(args) {
    const { output_path, preset_name = "H.264 High Quality", include_audio = true } = args;
    
    try {
      const response = await fetch('http://localhost:3001/api/export-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          output_path,
          preset_name,
          include_audio
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.error) {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️  ${data.error}`,
            },
          ],
        };
      }

      if (data.status === 'queued') {
        return {
          content: [
            {
              type: 'text',
              text: `🎬 **Export Queued Successfully**\n\n**Output Path:** ${data.output_path}\n**Preset:** ${data.preset_name}\n**Sequence:** ${data.sequence_name}\n**Queue Position:** ${data.queue_position}\n**Estimated Duration:** ${data.estimated_duration}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `✅ **Export Started Successfully**\n\n**Output Path:** ${data.output_path}\n**Preset:** ${data.preset_name}\n**Sequence:** ${data.sequence_name}\n**Status:** ${data.status}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **Failed to export project**\n\nError: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Premiere Pro MCP server running on stdio');
  }
}

const server = new PremiereProMCPServer();
server.run().catch(console.error);
