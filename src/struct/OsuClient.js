const fs = require('fs');
const path = require('path');
const download = require('download');
const request = require('superagent');

const Beatmap = require('./Components/Beatmap.js');
const User = require('./Components/User.js');
const Mods = require('./Components/Mods.js');

class osu {
    /**
     * Creates a new osu object
     * @param {Object} [options={}]
     * @param {String} [options.apiKey] Your osu api key
     * @param {String} [options.beatmapsDirectory] Directory to save beatmaps
     */
    constructor(options) {
        const {
            apiKey = null,
            beatmapsDirectory = null,
        } = options;

        this.apiKey = apiKey;

        this.beatmapsDirectory = path.resolve(beatmapsDirectory || path.join(__dirname, './beatmaps'));

        this.cache = {
            beatmap: new Map(),
            beatmapData: new Map(),
        }

        setInterval(() => {
            this.cache.beatmap.clear()
            this.cache.beatmapData.clear()
        }, (3) * 60 * 60 * 1000)
    }

    /**
     * Makes an api call
     * @param {String} endpoint
     * @param {Object} options
     * @param {Date} [options.since] Return all beatmaps ranked or loved since this date
     * @param {String} [options.s] Specify a beatmapSetId to return metadata from
     * @param {String} [options.b] Specify a beatmapId to return metadata from
     * @param {String} [options.u] Specify a userId or a username to return metadata from
     * @param {"string"|"id"} [options.type] Specify if `u` is a userId or a username
     * @param {0|1|2|3} [options.m] Mode (0 = osu!, 1 = Taiko, 2 = CtB, 3 = osu!mania)
     * @param {0|1} [options.a] Specify whether converted beatmaps are included
     * @param {String} [options.h] The beatmap hash
     * @param {Number} [options.limit] Amount of results. Default and maximum are 500
     * @param {Number} [options.mods] Mods that apply to the beatmap requested. Default is 0
     * @param {Number} [options.event_days] Max number of days between now and last event date. Range of 1-31. Default value is 1
     * @param {String} [options.mp] Match id to get information from
     * @returns {Promise<Object>} The response body
     */
    async apiCall(endpoint, options) {
        if (!this.apiKey)
            throw new Error('apiKey not set');
        options.k = this.apiKey;

        try {
            const resp = await request.get(`https://osu.ppy.sh/api${endpoint}`)
                .query(options);

            return resp.body;
        } catch (error) {
            throw new Error(error.response || error);
        }
    }

    /**
     * Get a User as an object.
     * @param {Object} [options={}] Beatmap id
     * @param {String|Int} [options.identifier] Username or Id
     * @param {'string'|'id'} [options.identifierType] Specify if identifier is a Username or Id
     * @returns {Promise<User>} The User object
     */
    async getUser(options) {
        let {
            identifier = '',
            identifierType = null,
        } = options;

        if (!identifierType) {
            if (isNaN(identifier)) {
                identifierType = 'string';
            } else {
                identifierType = 'id';
            }
        }

        return new Promise(async (resolve) => {
            const userData = await this.apiCall('/get_user', { u: identifier, type: identifierType }).then((u) => {
                if (!u || u == []) return resolve(null);
                return u[0]
            });

            if (!userData) return resolve(null);

            const user = new User(this, {
                userData: userData,
            });

            return resolve(user);
        });
    }

    /**
     * Get a Beatmap as an object.
     * @param {Object} [options={}]
     * @param {Number} [options.id] Beatmap id
     * @returns {Promise<Beatmap>} The Beatmap object
     */
    async getBeatmap(options) {
        const {
            id = 0,
        } = options;

        return new Promise(async (resolve) => {
            let beatmapData = this.cache.beatmapData.get(id);
            let beatmapFileString = this.cache.beatmap.get(id);

            if (beatmapData == undefined) {
                const isBeatmapDataDownloaded = await fs.existsSync(`${this.beatmapsDirectory}/${id}.json`);

                if (!isBeatmapDataDownloaded) {
                    beatmapData = await this._downloadBeatmapData(id);
                } else {
                    beatmapData = JSON.parse(await fs.readFileSync(`${this.beatmapsDirectory}/${id}.json`));
                }
            }

            if (beatmapData == undefined) {
                resolve(null);
            }

            if (beatmapFileString == undefined) {
                const isBeatmapDownloaded = await fs.existsSync(`${this.beatmapsDirectory}/${id}.osu`);

                if (!isBeatmapDownloaded) {
                    beatmapFileString = await this._downloadBeatmap(id);
                } else {
                    beatmapFileString = (await fs.readFileSync(`${this.beatmapsDirectory}/${id}.osu`)).toString();
                }
            }

            if (beatmapData == undefined) {
                resolve(null);
            }

            this.cache.beatmapData.set(id, beatmapData);
            this.cache.beatmap.set(id, beatmapFileString);

            const isBeatmapFinished = (parseInt(beatmapData.approved) >= 1);

            if (!isBeatmapFinished) { // Delete beatmap
                if (await fs.existsSync(`${this.beatmapsDirectory}/${id}.json`)) {
                    await fs.unlinkSync(`${this.beatmapsDirectory}/${id}.json`);
                }

                if (await fs.existsSync(`${this.beatmapsDirectory}/${id}.osu`)) {
                    await fs.unlinkSync(`${this.beatmapsDirectory}/${id}.osu`);
                }
            }

            const beatmap = new Beatmap({
                beatmapData: beatmapData || null,
                beatmapFileString: beatmapFileString,
            });

            return resolve(beatmap);
        })
    }

    /**
    * Get mods as an object
    * @param {Object} [options={}]
    * @param {any} [options.identifier] Bits or String
    * @param {'string'|'modbits'} [options.identifierType] Specify if identifier is Bits or String
    */
    getMods(options) {
        return new Mods(options);
    }

    async _downloadBeatmap(id) {
        await download(`https://osu.ppy.sh/osu/${id}`, this.beatmapsDirectory, { filename: id + '.osu' });

        const beatmapFileString = (await fs.readFileSync(`${this.beatmapsDirectory}/${id}.osu`)).toString();

        return beatmapFileString
    }

    async _downloadBeatmapData(id) {
        const beatmapData = await this.apiCall('/get_beatmaps', { b: id }).then((m) => { return m[0] });

        await fs.writeFileSync(`${this.beatmapsDirectory}/${id}.json`, JSON.stringify(beatmapData, null, 3));

        return beatmapData
    }
}

module.exports = osu;