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

// Subscribe to the player break block event
world.afterEvents.playerBreakBlock.subscribe(event => {
    const { brokenBlockPermutation, player } = event;

    if (brokenBlockPermutation.type.id === blockId) {
        try {
            // Award a coin to the player
            const scoreboard = world.scoreboard.getObjective(scoreboardObjectiveId);
            scoreboard.addScore(player, 1);
            player.onScreenDisplay.setActionBar("You found a coin!");
        } catch (error) {
            console.error("Failed to add score:", error);
            player.onScreenDisplay.setActionBar("Error: Could not award a coin. Is the scoreboard set up correctly?");
        }
    }
});
