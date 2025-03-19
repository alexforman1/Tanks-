/**
 * Leaderboard Management System
 * Handles user names, scores, and persistent storage
 */
class Leaderboard {
    constructor() {
        this.leaderboardData = [];
        this.currentUser = null;
        this.currentScore = 0;
        
        // Load data from local storage
        this.loadLeaderboard();
    }
    
    /**
     * Set the current user
     * @param {string} username - The player's username
     */
    setUser(username) {
        this.currentUser = username || 'Player';
        this.currentScore = 0;
    }
    
    /**
     * Add points to the current score
     * @param {number} points - Points to add
     */
    addScore(points) {
        this.currentScore += points;
        return this.currentScore;
    }
    
    /**
     * Get the current score
     * @returns {number} The current score
     */
    getScore() {
        return this.currentScore;
    }
    
    /**
     * Save the current score to the leaderboard
     * @returns {number} Position in the leaderboard (1-based)
     */
    saveScore() {
        if (!this.currentUser) return -1;
        
        // Create new entry
        const entry = {
            username: this.currentUser,
            score: this.currentScore,
            date: new Date().toISOString()
        };
        
        // Add to leaderboard
        this.leaderboardData.push(entry);
        
        // Sort by score (descending)
        this.leaderboardData.sort((a, b) => b.score - a.score);
        
        // Trim to top 100
        if (this.leaderboardData.length > 100) {
            this.leaderboardData = this.leaderboardData.slice(0, 100);
        }
        
        // Save to localStorage
        this.saveLeaderboard();
        
        // Return position (1-based)
        return this.leaderboardData.findIndex(e => 
            e.username === entry.username && 
            e.score === entry.score && 
            e.date === entry.date
        ) + 1;
    }
    
    /**
     * Get the top N scores
     * @param {number} n - Number of scores to return (default: 100)
     * @returns {Array} Array of score objects
     */
    getTopScores(n = 100) {
        return this.leaderboardData.slice(0, n);
    }
    
    /**
     * Reset the current score
     */
    resetScore() {
        this.currentScore = 0;
    }
    
    /**
     * Load leaderboard data from localStorage
     */
    loadLeaderboard() {
        try {
            const data = localStorage.getItem('tanks-leaderboard');
            if (data) {
                this.leaderboardData = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.leaderboardData = [];
        }
    }
    
    /**
     * Save leaderboard data to localStorage
     */
    saveLeaderboard() {
        try {
            localStorage.setItem('tanks-leaderboard', JSON.stringify(this.leaderboardData));
        } catch (error) {
            console.error('Error saving leaderboard:', error);
        }
    }
    
    /**
     * Render the leaderboard to a DOM element
     * @param {HTMLElement} element - The DOM element to render into
     * @param {number} highlightPos - Position to highlight (optional)
     */
    renderLeaderboard(element, highlightPos = -1) {
        if (!element) return;
        
        // Clear previous content
        element.innerHTML = '';
        
        // Get top scores
        const scores = this.getTopScores();
        
        // Create leaderboard items
        scores.forEach((score, index) => {
            const position = index + 1;
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            if (position === highlightPos) {
                item.style.backgroundColor = '#ffffd0';
                item.style.fontWeight = 'bold';
            }
            
            item.innerHTML = `
                <span class="leaderboard-rank">${position}.</span>
                <span class="leaderboard-name">${score.username}</span>
                <span class="leaderboard-score">${score.score}</span>
            `;
            
            element.appendChild(item);
        });
        
        // If empty, show message
        if (scores.length === 0) {
            const message = document.createElement('div');
            message.className = 'leaderboard-message';
            message.textContent = 'No scores yet!';
            element.appendChild(message);
        }
    }
} 