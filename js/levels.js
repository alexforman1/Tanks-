/**
 * Level Definitions for Tanks! game
 * Contains map layouts, enemy configurations, and level progression
 */

class LevelManager {
    constructor(game) {
        this.game = game;
        this.currentLevel = 0;
        this.levelDefinitions = [
            // Level 1 - Simple introduction
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X          X",
                    "X  B    B  X",
                    "X          X",
                    "X     P    X",
                    "X          X",
                    "X  B    B  X",
                    "X          X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "basic", position: { x: 3, z: 2 } }
                ],
                difficulty: 1
            },
            
            // Level 2 - L-shape corridor
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X    XXXXXXX",
                    "X    XXXXXXX",
                    "X       XXXX",
                    "X  P    XXXX",
                    "X       XXXX",
                    "XXXXX      X",
                    "XXXXX    B X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "basic", position: { x: 9, z: 7 } },
                    { type: "basic", position: { x: 9, z: 6 } }
                ],
                difficulty: 1
            },
            
            // Level 3 - Central blocks
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X          X",
                    "X  B  B  B X",
                    "X   XXXX   X",
                    "X P XXXX  EX",
                    "X   XXXX   X",
                    "X  B  B  B X",
                    "X          X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "basic", position: { x: 9, z: 4 } },
                    { type: "basic", position: { x: 3, z: 2 } },
                    { type: "basic", position: { x: 3, z: 6 } }
                ],
                difficulty: 2
            },
            
            // Level 4 - Zigzag
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP  X     XX",
                    "X   X  B  XX",
                    "XX  XXXX  XX",
                    "XX         X",
                    "XXXXX  XXXXX",
                    "X         XX",
                    "X  B  X   EX",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "basic", position: { x: 9, z: 7 } },
                    { type: "basic", position: { x: 3, z: 7 } },
                    { type: "faster", position: { x: 6, z: 2 } }
                ],
                difficulty: 2
            },
            
            // Level 5 - Scattered blocks
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X    X     X",
                    "X B  X  B  X",
                    "X    X     X",
                    "X  P   E   X",
                    "X    X     X",
                    "X B  X  B  X",
                    "X    X     X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "basic", position: { x: 8, z: 4 } },
                    { type: "faster", position: { x: 9, z: 2 } },
                    { type: "faster", position: { x: 9, z: 6 } },
                    { type: "basic", position: { x: 2, z: 2 } }
                ],
                difficulty: 3
            },
            
            // Level 6 - Center arena
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XXX      XXX",
                    "X          X",
                    "X  XXXXXX  X",
                    "X PX    XE X",
                    "X  XXXXXX  X",
                    "X          X",
                    "XXX      XXX",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "faster", position: { x: 9, z: 4 } },
                    { type: "faster", position: { x: 9, z: 3 } },
                    { type: "basic", position: { x: 9, z: 5 } },
                    { type: "minelayer", position: { x: 6, z: 3 } }
                ],
                difficulty: 3
            },
            
            // Level 7 - Cross pattern
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X    X     X",
                    "X    X     X",
                    "XXXX X XXXXX",
                    "X  P X E   X",
                    "XXXX X XXXXX",
                    "X    X     X",
                    "X    X     X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "basic", position: { x: 8, z: 4 } },
                    { type: "faster", position: { x: 8, z: 6 } },
                    { type: "faster", position: { x: 8, z: 2 } },
                    { type: "minelayer", position: { x: 8, z: 1 } },
                    { type: "minelayer", position: { x: 8, z: 7 } }
                ],
                difficulty: 4
            },
            
            // Level 8 - Maze
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP X    X  X",
                    "X  X XX X  X",
                    "X XX    XX X",
                    "X     E    X",
                    "X XXXXXXXX X",
                    "X        X X",
                    "XXXX     X X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "basic", position: { x: 6, z: 4 } },
                    { type: "faster", position: { x: 9, z: 1 } },
                    { type: "minelayer", position: { x: 9, z: 6 } },
                    { type: "minelayer", position: { x: 3, z: 3 } },
                    { type: "faster", position: { x: 6, z: 7 } }
                ],
                difficulty: 4
            },
            
            // Level 9 - Checkerboard
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X X X X X XX",
                    "X          X",
                    "X X X X X XX",
                    "XP        EX",
                    "X X X X X XX",
                    "X          X",
                    "X X X X X XX",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "faster", position: { x: 9, z: 4 } },
                    { type: "faster", position: { x: 7, z: 2 } },
                    { type: "faster", position: { x: 5, z: 6 } },
                    { type: "minelayer", position: { x: 7, z: 6 } },
                    { type: "minelayer", position: { x: 9, z: 2 } },
                    { type: "basic", position: { x: 9, z: 6 } }
                ],
                difficulty: 5
            },
            
            // Level 10 - Fortress
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X P        X",
                    "X XXXXXXXX X",
                    "X X      X X",
                    "X X XXXX X X",
                    "X X XE X X X",
                    "X X XXXX X X",
                    "X          X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 6, z: 5 } },
                    { type: "faster", position: { x: 8, z: 7 } },
                    { type: "minelayer", position: { x: 4, z: 7 } },
                    { type: "basic", position: { x: 9, z: 1 } },
                    { type: "basic", position: { x: 9, z: 4 } },
                    { type: "minelayer", position: { x: 3, z: 4 } }
                ],
                difficulty: 5
            },
            
            // Level 11 - Spiral
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP        EX",
                    "XXXXXXXXXX X",
                    "X          X",
                    "X XXXXXXXXXX",
                    "X X        X",
                    "X XXXXXXXX X",
                    "X          X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 9, z: 1 } },
                    { type: "faster", position: { x: 8, z: 3 } },
                    { type: "faster", position: { x: 4, z: 5 } },
                    { type: "minelayer", position: { x: 8, z: 7 } },
                    { type: "sniper", position: { x: 2, z: 3 } },
                    { type: "minelayer", position: { x: 2, z: 7 } }
                ],
                difficulty: 6
            },
            
            // Level 12 - Chambers
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP  XX    EX",
                    "X   XX     X",
                    "XX       XXX",
                    "XX  XXX  XXX",
                    "XX       XXX",
                    "X    XX    X",
                    "X    XX    X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 9, z: 1 } },
                    { type: "faster", position: { x: 8, z: 3 } },
                    { type: "faster", position: { x: 7, z: 6 } },
                    { type: "minelayer", position: { x: 3, z: 6 } },
                    { type: "sniper", position: { x: 9, z: 6 } },
                    { type: "basic", position: { x: 8, z: 5 } },
                    { type: "basic", position: { x: 4, z: 3 } }
                ],
                difficulty: 6
            },
            
            // Level 13 - Cross fire
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X    XX    X",
                    "X    XX    X",
                    "X    XX   EX",
                    "XP        EX",
                    "X    XX   EX",
                    "X    XX    X",
                    "X    XX    X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 9, z: 3 } },
                    { type: "sniper", position: { x: 9, z: 4 } },
                    { type: "sniper", position: { x: 9, z: 5 } },
                    { type: "minelayer", position: { x: 3, z: 1 } },
                    { type: "minelayer", position: { x: 3, z: 7 } },
                    { type: "faster", position: { x: 2, z: 2 } },
                    { type: "faster", position: { x: 2, z: 6 } }
                ],
                difficulty: 7
            },
            
            // Level 14 - Small rooms
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP  X  X   X",
                    "X   X  X   X",
                    "XXXXX  XXXXX",
                    "X          X",
                    "XXXXX  XXXXX",
                    "X   X  X   X",
                    "X   X  X  EX",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 9, z: 7 } },
                    { type: "faster", position: { x: 5, z: 4 } },
                    { type: "faster", position: { x: 7, z: 4 } },
                    { type: "minelayer", position: { x: 9, z: 1 } },
                    { type: "minelayer", position: { x: 3, z: 4 } },
                    { type: "basic", position: { x: 9, z: 4 } },
                    { type: "sniper", position: { x: 3, z: 7 } },
                    { type: "basic", position: { x: 3, z: 1 } }
                ],
                difficulty: 7
            },
            
            // Level 15 - Zigzag maze
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP         X",
                    "XXXXXX XXX X",
                    "X      X   X",
                    "X XXXX XXX X",
                    "X X        X",
                    "X XXXX XXXXX",
                    "X     E    X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 7, z: 7 } },
                    { type: "minelayer", position: { x: 8, z: 5 } },
                    { type: "faster", position: { x: 2, z: 3 } },
                    { type: "faster", position: { x: 9, z: 3 } },
                    { type: "sniper", position: { x: 5, z: 1 } },
                    { type: "basic", position: { x: 3, z: 5 } },
                    { type: "basic", position: { x: 9, z: 1 } },
                    { type: "minelayer", position: { x: 4, z: 7 } }
                ],
                difficulty: 8
            },
            
            // Level 16 - Open field with blocks
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP   B B   X",
                    "X     B    X",
                    "X B B   B  X",
                    "X   B   B  X",
                    "X  B   B   X",
                    "X    B     X",
                    "X   B B   EX",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 9, z: 7 } },
                    { type: "faster", position: { x: 8, z: 3 } },
                    { type: "faster", position: { x: 8, z: 5 } },
                    { type: "sniper", position: { x: 8, z: 1 } },
                    { type: "minelayer", position: { x: 2, z: 3 } },
                    { type: "minelayer", position: { x: 2, z: 5 } },
                    { type: "basic", position: { x: 2, z: 7 } },
                    { type: "basic", position: { x: 5, z: 7 } },
                    { type: "basic", position: { x: 5, z: 1 } }
                ],
                difficulty: 8
            },
            
            // Level 17 - Narrow passages
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP    X    X",
                    "XXXXX X XXXX",
                    "X     X    X",
                    "X XXX XXX XX",
                    "X X       XX",
                    "X X XXXXX XX",
                    "X       E XX",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 8, z: 7 } },
                    { type: "faster", position: { x: 7, z: 5 } },
                    { type: "faster", position: { x: 4, z: 3 } },
                    { type: "minelayer", position: { x: 8, z: 1 } },
                    { type: "minelayer", position: { x: 8, z: 3 } },
                    { type: "basic", position: { x: 3, z: 3 } },
                    { type: "basic", position: { x: 3, z: 7 } },
                    { type: "sniper", position: { x: 5, z: 7 } },
                    { type: "sniper", position: { x: 7, z: 3 } }
                ],
                difficulty: 9
            },
            
            // Level 18 - Two fortresses
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP XXX  XXXX",
                    "X  X      EX",
                    "X  X  XXX  X",
                    "X        X X",
                    "X  XXX  X  X",
                    "XE      X  X",
                    "XXXX  XXX  X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 9, z: 2 } },
                    { type: "sniper", position: { x: 2, z: 6 } },
                    { type: "faster", position: { x: 6, z: 6 } },
                    { type: "faster", position: { x: 6, z: 2 } },
                    { type: "minelayer", position: { x: 5, z: 4 } },
                    { type: "minelayer", position: { x: 7, z: 4 } },
                    { type: "basic", position: { x: 9, z: 6 } },
                    { type: "basic", position: { x: 9, z: 4 } },
                    { type: "basic", position: { x: 3, z: 2 } },
                    { type: "basic", position: { x: 3, z: 4 } }
                ],
                difficulty: 9
            },
            
            // Level 19 - Concentric rings
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "X          X",
                    "X XXXXXXXX X",
                    "X XP    EX X",
                    "X X XXXX X X",
                    "X X X  X X X",
                    "X X XXXX X X",
                    "X X      X X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "sniper", position: { x: 7, z: 3 } },
                    { type: "faster", position: { x: 7, z: 7 } },
                    { type: "faster", position: { x: 5, z: 7 } },
                    { type: "minelayer", position: { x: 5, z: 5 } },
                    { type: "minelayer", position: { x: 7, z: 5 } },
                    { type: "basic", position: { x: 3, z: 7 } },
                    { type: "basic", position: { x: 3, z: 5 } },
                    { type: "sniper", position: { x: 3, z: 3 } },
                    { type: "sniper", position: { x: 5, z: 3 } },
                    { type: "faster", position: { x: 6, z: 4 } }
                ],
                difficulty: 10
            },
            
            // Level 20 - Final Boss Arena
            {
                layout: [
                    "XXXXXXXXXXXX",
                    "XP         X",
                    "X  XXX XXX  X",
                    "X  X     X  X",
                    "X  X  E  X  X",
                    "X  X     X  X",
                    "X  XXX XXX  X",
                    "X          X",
                    "XXXXXXXXXXXX"
                ],
                enemies: [
                    { type: "boss", position: { x: 6, z: 4 } },
                    { type: "sniper", position: { x: 2, z: 7 } },
                    { type: "sniper", position: { x: 9, z: 7 } },
                    { type: "minelayer", position: { x: 2, z: 1 } },
                    { type: "minelayer", position: { x: 9, z: 1 } },
                    { type: "basic", position: { x: 3, z: 3 } },
                    { type: "basic", position: { x: 8, z: 3 } },
                    { type: "basic", position: { x: 3, z: 5 } },
                    { type: "basic", position: { x: 8, z: 5 } },
                    { type: "faster", position: { x: 5, z: 7 } },
                    { type: "faster", position: { x: 5, z: 1 } }
                ],
                difficulty: 10
            }
        ];
    }
    
    /**
     * Gets the current level data
     * @returns {Object} Level data
     */
    getCurrentLevel() {
        const levelIndex = this.currentLevel % this.levelDefinitions.length;
        const cycle = Math.floor(this.currentLevel / this.levelDefinitions.length);
        
        // Get base level
        const baseLevel = Utils.deepClone(this.levelDefinitions[levelIndex]);
        
        // Increase difficulty for cycles beyond the first
        if (cycle > 0) {
            // Add more enemies based on cycle number
            const additionalEnemies = Math.min(cycle * 2, 10);
            
            for (let i = 0; i < additionalEnemies; i++) {
                const enemyTypes = ["basic", "faster", "minelayer", "sniper"];
                const type = Utils.randomElement(enemyTypes);
                
                // Find an empty space for the enemy
                const layout = baseLevel.layout;
                let position = null;
                let attempts = 0;
                
                while (!position && attempts < 50) {
                    attempts++;
                    const x = Utils.random(1, layout[0].length - 2);
                    const z = Utils.random(1, layout.length - 2);
                    
                    // Check if position is empty (not a wall, player, or existing enemy)
                    if (layout[z][x] === ' ' && 
                        !(x === 2 && z === 1) && // Not on player start
                        !baseLevel.enemies.some(e => e.position.x === x && e.position.z === z)) {
                        position = { x, z };
                    }
                }
                
                if (position) {
                    baseLevel.enemies.push({ type, position });
                }
            }
            
            // Increase movement and attack speed
            baseLevel.speedMultiplier = 1 + (cycle * 0.2);
            
            // Increase difficulty value
            baseLevel.difficulty += cycle;
        }
        
        return baseLevel;
    }
    
    /**
     * Advances to the next level
     * @returns {Object} New level data
     */
    nextLevel() {
        this.currentLevel++;
        return this.getCurrentLevel();
    }
    
    /**
     * Resets to the first level
     */
    reset() {
        this.currentLevel = 0;
    }
    
    /**
     * Gets the current level number (1-based)
     * @returns {number} Current level number
     */
    getLevelNumber() {
        return this.currentLevel + 1;
    }
    
    /**
     * Parse a level definition and create the level in the game world
     * @param {Object} level - Level definition object
     * @param {THREE.Scene} scene - Three.js scene
     * @param {Function} createEnemy - Function to create enemy tanks
     * @returns {Object} Level data
     */
    parseLevel(level, scene, createEnemy) {
        const layout = level.layout;
        const height = layout.length;
        const width = layout[0].length;
        const tileSize = 2; // Size of each grid tile in world units
        
        // Create result object
        const result = {
            playerStart: null,
            enemies: []
        };
        
        // Create grid for pathfinding
        const grid = [];
        for (let z = 0; z < height; z++) {
            grid[z] = [];
            for (let x = 0; x < width; x++) {
                const char = layout[z][x];
                
                // Mark walls in grid (for pathfinding)
                if (char === 'X') {
                    grid[z][x] = 1; // Wall
                } else {
                    grid[z][x] = 0; // Passable
                }
            }
        }
        
        // Check if a position has a valid path to another position
        const hasValidPath = (startX, startZ, endX, endZ, grid) => {
            // Simple breadth-first search for pathfinding
            const queue = [{x: startX, z: startZ, path: []}];
            const visited = {};
            
            // Directions: up, right, down, left
            const dirs = [{x: 0, z: -1}, {x: 1, z: 0}, {x: 0, z: 1}, {x: -1, z: 0}];
            
            while (queue.length > 0) {
                const current = queue.shift();
                const key = `${current.x},${current.z}`;
                
                // If we reached the target, return true
                if (current.x === endX && current.z === endZ) {
                    return true;
                }
                
                // Skip if already visited
                if (visited[key]) continue;
                visited[key] = true;
                
                // Try all four directions
                for (const dir of dirs) {
                    const newX = current.x + dir.x;
                    const newZ = current.z + dir.z;
                    
                    // Check bounds
                    if (newX < 0 || newX >= width || newZ < 0 || newZ >= height) continue;
                    
                    // Check if passable
                    if (grid[newZ][newX] === 0) {
                        queue.push({x: newX, z: newZ, path: [...current.path, {x: newX, z: newZ}]});
                    }
                }
            }
            
            // No path found
            return false;
        };
        
        // Track player and enemy positions for pathfinding
        let playerX = -1, playerZ = -1;
        const enemyPositions = [];
        
        // First pass: Find player and enemy positions
        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const char = layout[z][x];
                
                if (char === 'P') {
                    playerX = x;
                    playerZ = z;
                    result.playerStart = {
                        x: (x - width/2) * tileSize,
                        z: (z - height/2) * tileSize
                    };
                    
                    // Ensure player isn't spawning on a wall or block
                    if (grid[z][x] === 1) {
                        // Move player to a safe position if needed
                        for (let testZ = 0; testZ < height; testZ++) {
                            for (let testX = 0; testX < width; testX++) {
                                if (grid[testZ][testX] === 0) {
                                    result.playerStart = {
                                        x: (testX - width/2) * tileSize,
                                        z: (testZ - height/2) * tileSize
                                    };
                                    playerX = testX;
                                    playerZ = testZ;
                                    break;
                                }
                            }
                            if (playerX !== x || playerZ !== z) break;
                        }
                    }
                } 
                else if (char === 'E') {
                    enemyPositions.push({x, z});
                }
            }
        }
        
        // Second pass: Create level objects
        for (let z = 0; z < height; z++) {
            for (let x = 0; x < width; x++) {
                const worldX = (x - width/2) * tileSize;
                const worldZ = (z - height/2) * tileSize;
                const char = layout[z][x];
                
                if (char === 'X') {
                    // Create a wall
                    this.game.createObstacle(worldX, worldZ, 'wall');
                } 
                else if (char === 'B') {
                    // Check if this block would block critical paths
                    grid[z][x] = 1; // Temporarily mark as wall
                    
                    // Check if player can still reach all enemies with this block
                    let blocksCriticalPath = false;
                    for (const enemy of enemyPositions) {
                        if (!hasValidPath(playerX, playerZ, enemy.x, enemy.z, grid)) {
                            blocksCriticalPath = true;
                            break;
                        }
                    }
                    
                    grid[z][x] = 0; // Reset to passable
                    
                    // Only place block if it doesn't block critical paths
                    if (!blocksCriticalPath) {
                        this.game.createObstacle(worldX, worldZ, 'block');
                    }
                }
            }
        }
        
        // Add enemies
        if (level.enemies) {
            const difficultyMultiplier = Math.ceil(this.currentLevel / 20) * 0.1 + 1;
            
            level.enemies.forEach(enemyDef => {
                if (enemyDef.position) {
                    const enemyX = (enemyDef.position.x - width/2) * tileSize;
                    const enemyZ = (enemyDef.position.z - height/2) * tileSize;
                    
                    const enemy = createEnemy(
                        enemyDef.type || 'basic',
                        enemyX,
                        enemyZ,
                        difficultyMultiplier
                    );
                    
                    result.enemies.push(enemy);
                }
            });
        }
        
        return result;
    }
    
    /**
     * Validate and adjust spawn position to avoid obstacles
     * @param {Object} position - {x, z} position to validate
     * @param {Array} obstacles - Array of obstacles to check against
     * @returns {Object} - Adjusted position that doesn't overlap with obstacles
     */
    validateSpawnPosition(position, obstacles) {
        if (!position || !obstacles) return position;
        
        // Check if position overlaps with any obstacle
        const tankSize = { x: 1.0, z: 1.0 }; // Slightly larger than actual tank size for safety
        
        // Create a box for the tank position
        const tankBox = {
            position: position,
            size: tankSize
        };
        
        // Check for collisions with all obstacles
        let hasCollision = false;
        for (const obstacle of obstacles) {
            if (!obstacle || !obstacle.position || !obstacle.userData || !obstacle.userData.size) {
                continue;
            }
            
            const obstacleBox = {
                position: obstacle.position,
                size: obstacle.userData.size
            };
            
            if (Utils.boxCollision(tankBox, obstacleBox)) {
                hasCollision = true;
                break;
            }
        }
        
        // If there's a collision, find a safe position
        if (hasCollision) {
            // Try different positions in a spiral pattern until a safe spot is found
            const spiralCoords = [
                { x: -2, z: 0 }, { x: -2, z: -2 }, { x: 0, z: -2 }, { x: 2, z: -2 },
                { x: 2, z: 0 }, { x: 2, z: 2 }, { x: 0, z: 2 }, { x: -2, z: 2 },
                { x: -4, z: 0 }, { x: -4, z: -4 }, { x: 0, z: -4 }, { x: 4, z: -4 },
                { x: 4, z: 0 }, { x: 4, z: 4 }, { x: 0, z: 4 }, { x: -4, z: 4 }
            ];
            
            for (const offset of spiralCoords) {
                const testPosition = {
                    x: position.x + offset.x,
                    z: position.z + offset.z
                };
                
                const testBox = {
                    position: testPosition,
                    size: tankSize
                };
                
                let testCollision = false;
                for (const obstacle of obstacles) {
                    if (!obstacle || !obstacle.position || !obstacle.userData || !obstacle.userData.size) {
                        continue;
                    }
                    
                    const obstacleBox = {
                        position: obstacle.position,
                        size: obstacle.userData.size
                    };
                    
                    if (Utils.boxCollision(testBox, obstacleBox)) {
                        testCollision = true;
                        break;
                    }
                }
                
                // If no collision is found, use this position
                if (!testCollision) {
                    return testPosition;
                }
            }
        }
        
        // If all else fails, return the original position
        return position;
    }
} 