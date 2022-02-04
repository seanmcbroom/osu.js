const { osu } = require("../src/index.js");

const client = new osu({
    apiKey: ""
});

client.getUser({ identifier: "st4rstrukk" })
    .then(async u => {
        const score = await u.getRecent();
        console.log(`${score.beatmap.link}: ${score.pp()}/${score.beatmap.calculatePP()}pp`)
    })