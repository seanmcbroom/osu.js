const Mods = require('./Mods');

class Score {
    /**
     * Creates a new Score object
     * @param {Object} [osu] The main osu module
     * @param {Object} [options={}]
     * @param {Object} [options.scoreData]
     * @param {Object} [options.beatmap]
     */
    constructor(options) {
        const {
            scoreData = null,
            beatmap = null
        } = options;

        for (const x in scoreData) {
            if (x != 'pp') {
                this[x] = scoreData[x];
            }
        };

        this.beatmap = beatmap;

        this.mods = new Mods({
            identifier: this.enabled_mods,
            identifierType: 'modbits'
        });

        this.x0 = parseInt(this.countmiss);
        this.x300 = parseInt(this.count300);
        this.x100 = parseInt(this.count100);
        this.x50 = parseInt(this.count50);

        const hit_objects = (this.x0 + this.x300 + this.x100 + this.x50);
        const accFormula = (x300, x100, x50) => {
            return Math.round(((x300 * 300) + (x100 * 100) + (x50 * 50)) / (300 * (hit_objects)) * 10000) / 100;
        }

        this.accuracy = accFormula(this.x300, this.x100, this.x50);
        this.fc_accuracy = accFormula((this.x0 + this.x300), this.x100, this.x50);

        this.completion = Math.round((hit_objects / this.beatmap.num_objects) * 10000) / 100
    }

    /**
     * Calculates star rating of score
     * @returns {Number}
     */
    getDifficulty() {
        return this.beatmap.getDifficulty({
            mods: this.mods
        });
    }

    /**
     * Calculates star rating of score
     * @returns {Number}
     */
    starRating() {
        return this.beatmap.stars({
            mods: this.mods
        });
    }

    /**
     * Calculate pp of score
     * @returns {Number}
     */
    pp() {
        const pp = this.beatmap.calculatePP({
            accuracy: this.accuracy,
            misses: this.x0,
            combo: this.maxcombo,
            mods: this.mods
        });

        return pp;
    }

    /**
    * Calculate pp of score (if full combo)
    * @returns {Number}
    */
    fcpp() {
        const pp = this.beatmap.calculatePP({
            accuracy: this.fc_accuracy,
            mods: this.mods
        });

        return pp;
    }
}

module.exports = Score;