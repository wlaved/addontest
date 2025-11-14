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

        // 2. THIS IS THE FIX:
        // Schedule the block to be set to air on the very next tick
        system.run(() => {
            block.setType("minecraft:air");
        });

        // 3. Manually award the coin (this is fine)
        try {
            const scoreboard = world.scoreboard.getObjective(scoreboardObjectiveId);
            scoreboard.addScore(player, 1);
            player.onScreenDisplay.setActionBar("You found a coin!");
        } catch (error) {
            console.error("Failed to add score:", error);
            player.onScreenDisplay.setActionBar("Error: Could not award a coin. Is the scoreboard set up correctly?");
        }
    }
});
