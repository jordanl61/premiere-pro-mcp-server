// trimClipByFrames.jsx
// ExtendScript for Adobe Premiere Pro CEP extension
// Trims or extends the in/out point of a video or audio clip by a specified number of frames

function trimClipByFrames(sequenceId, clipId, framesDelta, direction, trackType) {
    var sequence = app.project.sequences[sequenceId];
    if (!sequence) return { success: false, error: 'Sequence not found' };

    var frameRate = sequence.timebase || 24; // fallback to 24 if undefined
    var secondsDelta = framesDelta / frameRate;

    var tracks = (trackType === 'audio') ? sequence.audioTracks : sequence.videoTracks;

    for (var t = 0; t < tracks.numTracks; t++) {
        var track = tracks[t];
        for (var c = 0; c < track.clips.numItems; c++) {
            var clip = track.clips[c];
            // Use .nodeId or .projectItem.nodeId depending on your API
            if (clip.nodeId == clipId || (clip.projectItem && clip.projectItem.nodeId == clipId)) {
                if (direction === 'in') {
                    clip.inPoint.seconds += secondsDelta;
                } else if (direction === 'out') {
                    clip.outPoint.seconds += secondsDelta;
                }
                return { success: true };
            }
        }
    }
    return { success: false, error: 'Clip not found' };
}
