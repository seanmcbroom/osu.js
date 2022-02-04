module.exports = {
    ModBits: {
        nomod: 0,
        nf: 1 << 0,
        ez: 1 << 1,
        td: 1 << 2,
        hd: 1 << 3,
        hr: 1 << 4,
        dt: 1 << 6,
        ht: 1 << 8,
        nc: 1 << 9,
        fl: 1 << 10,
        so: 1 << 12
    },

    Beatmaps: {
        /**
         * Approval states
         */
        approved: {
            '-2': 'Graveyard',
            '-1': 'WIP',
            '0': 'Pending',
            '1': 'Ranked',
            '2': 'Approved',
            '3': 'Qualified',
            '4': 'Loved'
        },
        /**
         * Song genres
         */
        genre: {
            '0': 'Any',
            '1': 'Unspecified',
            '2': 'Video Game',
            '3': 'Anime',
            '4': 'Rock',
            '5': 'Pop',
            '6': 'Other',
            '7': 'Novelty',
            '9': 'Hip Hop',
            '10': 'Electronic'
        },
        /**
         * Song languages
         */
        language: {
            '0': 'Any',
            '1': 'Other',
            '2': 'English',
            '3': 'Japanese',
            '4': 'Chinese',
            '5': 'Instrumental',
            '6': 'Korean',
            '7': 'French',
            '8': 'German',
            '9': 'Swedish',
            '10': 'Spanish',
            '11': 'Italian'
        },

        /**
         * Map Difficulty
         */
        difficulty: {
            '8': 'Expert++',
            '6.5': 'Expert+',
            '5.3': 'Expert',
            '4': 'Insane',
            '2.7': 'Hard',
            '2': 'Normal',
            '0': 'Easy'
        }
    }
}