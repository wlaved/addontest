import { world, system } from "@minecraft/server";

const blockId = "myname:mycrfttestcoin";
const scoreboardObjectiveId = "coins";

// Replace player-placed blocks with air
world.afterEvents.playerPlaceBlock.subscribe(event => {
    const { block } = event;
    if (block.typeId === blockId) {
        system.runTimeout(() => {
            block.setType("minecraft:air");
        }, 1);
    }
});

// Subscribe to the player break block event (BEFORE it happens)
world.beforeEvents.playerBreakBlock.subscribe(event => {
    const { block, player } = event;

    // Check if it's your coin block
    if (block.typeId === blockId) {

        // 1. Stop the game from breaking the block (this also stops the drop)
        event.cancel = true;

        // 2. Get the player's ID now, because the 'player' object will be invalid on the next tick
        const playerId = player.id;

        // 3. Schedule the actions for the next tick
        system.run(() => {
            // Manually break the block
            block.setType("minecraft:air");

            // Get a fresh reference to the player using their ID
            const player = world.getPlayer(playerId);

            // Check if the player is still online before awarding the score
            if (player) {
                try {
                    const scoreboard = world.scoreboard.getObjective(scoreboardObjectiveId);
                    scoreboard.addScore(player, 1);
                    player.onScreenDisplay.setActionBar("You found a coin!");
                } catch (error) {
                    console.error("Failed to add score:", error);
                }
            }
        });
    }
});
