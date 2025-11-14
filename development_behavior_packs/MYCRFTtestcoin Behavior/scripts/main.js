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

        // 2. Get stable references to the block, dimension, and player
        const blockLocation = block.location;
        const dimensionId = block.dimension.id;
        const playerId = player.id;

        // 3. Schedule the actions for the next tick
        system.run(() => {
            // Re-fetch the dimension and then the block
            const dimension = world.getDimension(dimensionId);
            const block = dimension.getBlock(blockLocation);

            // Manually break the block (if it still exists)
            if (block) {
                block.setType("minecraft:air");
            }

            // Re-fetch the player using their ID
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
