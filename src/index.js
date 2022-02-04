module.exports = {
    // Core
    osu: require("./struct/OsuClient.js"),

    Beatmap: require("./struct/Components/Beatmap.js"),
    Mods: require("./struct/Components/Mods.js"),
    Score: require("./struct/Components/Score.js"),
    User: require("./struct/Components/User.js"),

    // Utilities
    Constants: require("./util/Constants.js")
}