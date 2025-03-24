/**
 * AudioManager class - Handles all game audio including background music and sound effects
 */
export class AudioManager {
    constructor() {
        this.audioEnabled = false;
        this.backgroundMusic = null;
        this.sounds = {};
        
        // Try to load audio files
        this.loadAudioFiles();
    }
    
    loadAudioFiles() {
        try {
            this.backgroundMusic = new Audio('assets/audio/background.wav');
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = 0.5;
            
            // Sound effects
            this.sounds = {
                shoot: new Audio('assets/audio/shoot.wav'),
                explosion: new Audio('assets/audio/explosion.wav'),
                powerup: new Audio('assets/audio/powerup.wav'),
                gameOver: new Audio('assets/audio/gameover.wav')
            };
            
            // Set volume for sound effects
            Object.values(this.sounds).forEach(sound => {
                sound.volume = 0.3;
            });
            
            this.audioEnabled = true;
        } catch (error) {
            console.warn('Audio files could not be loaded. Game will run without sound.');
            this.audioEnabled = false;
        }
        
        // Initialize audio context on user interaction
        this.audioContext = null;
        this.initialized = false;
    }
    
    initialize() {
        if (!this.initialized && this.audioEnabled) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        }
    }
    
    playBackgroundMusic() {
        if (!this.audioEnabled || !this.backgroundMusic) return;
        this.initialize();
        this.backgroundMusic.play().catch(error => {
            console.warn('Background music playback failed:', error);
        });
    }
    
    stopBackgroundMusic() {
        if (!this.audioEnabled || !this.backgroundMusic) return;
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }
    
    playSound(soundName) {
        if (!this.audioEnabled || !this.sounds[soundName]) return;
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch(error => {
            console.warn(`Sound ${soundName} playback failed:`, error);
        });
    }
    
    stopAllSounds() {
        if (!this.audioEnabled) return;
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }
} 