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

        // 2. Award the coin and show the message IMMEDIATELY
        try {
            const scoreboard = world.scoreboard.getObjective(scoreboardObjectiveId);
            scoreboard.addScore(player, 1);
            player.onScreenDisplay.setActionBar("You found a coin!");
        } catch (error) {
            console.error("Failed to add score:", error);
            player.onScreenDisplay.setActionBar("Error: Could not award a coin. Is the scoreboard set up correctly?");
        }

        // 3. DEFER ONLY the block modification
        const blockLocation = block.location;
        const dimensionId = block.dimension.id;
        system.run(() => {
            const dimension = world.getDimension(dimensionId);
            const block = dimension.getBlock(blockLocation);
            if (block) {
                block.setType("minecraft:air");
            }
        });
    }
});
