import { Game } from './game.js';

/**
 * Main.js - Entry point for the Tanks! game
 * Initializes the game and handles startup
 */

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short moment to ensure all scripts are loaded
    setTimeout(() => {
        // Check if required classes are available
        console.log("Checking dependencies...");
        console.log("Projectile class available:", typeof Projectile !== 'undefined');
        console.log("Tank class available:", typeof Tank !== 'undefined');
        console.log("Game class available:", typeof Game !== 'undefined');
        
        // Create a new Game instance
        const game = new Game();
        
        // Show some console info
        console.log('Tanks! game initialized');
        console.log('Game controls:');
        console.log('- W/S: Move forward/backward');
        console.log('- A/D: Turn tank left/right');
        console.log('- Mouse: Aim turret');
        console.log('- Left Mouse Button: Fire');
        console.log('- Spacebar: Drop mine');
        
        // Some browsers require a user interaction before playing audio
        // This ensures the game is ready for sounds later
        document.addEventListener('click', () => {
            // Enable audio context if we add sound later
        }, { once: true });
    }, 100);
}); 