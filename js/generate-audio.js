// This script will generate placeholder audio files for the game
// You can run this in the browser console to generate the files

function generatePlaceholderAudio() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = 44100;
    const duration = 1; // seconds
    const numSamples = sampleRate * duration;
    
    // Create a buffer for the audio
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Generate a simple sine wave
    for (let i = 0; i < numSamples; i++) {
        channelData[i] = Math.sin(440 * Math.PI * 2 * i / sampleRate);
    }
    
    // Convert to WAV format
    const wav = audioBufferToWav(buffer);
    
    // Create download links for each sound
    const sounds = ['background', 'shoot', 'explosion', 'powerup', 'gameover'];
    sounds.forEach(sound => {
        const blob = new Blob([wav], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sound}.wav`;
        a.textContent = `Download ${sound}.wav`;
        document.body.appendChild(a);
        document.body.appendChild(document.createElement('br'));
    });
}

// Helper function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const wav = new ArrayBuffer(44 + buffer.length * blockAlign);
    const view = new DataView(wav);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * blockAlign, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * blockAlign, true);
    
    // Write audio data
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
    }
    
    return wav;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Run the generator
generatePlaceholderAudio(); 