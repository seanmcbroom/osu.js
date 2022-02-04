const Constants = require('../../util/Constants.js');

class Mods {
    /**
    * Creates a new Mods object
    * @param {Object} [options={}]
    * @param {any} [options.identifier] Bits or String
    * @param {'string'|'modbits'} [options.identifierType] Specify if identifier is Bits or String
    */
    constructor(options) {
        let {
            identifier = 0,
            identifierType = null,
        } = options;

        this.modbits = 0;
        this.string = '';

        if (!identifierType) {
            if (isNaN(identifier)) {
                identifierType = 'string';
            } else {
                identifierType = 'modbits';
            }
        }

        if (identifierType == 'modbits') {
            const string = this._modbitsToString(identifier);

            if (string) {
                this.modbits = identifier;
                this.string = string;
            }
        }

        if (identifierType == 'string') {
            const modbits = this._stringToModbits(identifier);

            if (modbits) {
                this.modbits = Constants.ModBits;
                this.string = identifier.toUpperCase();
            }
        }

        this.speedMultiplier = (this.has(Constants.ModBits.dt) || this.has(Constants.ModBits.nc)) ? 1.5 : (this.has(Constants.ModBits.ht) ? 0.75 : 1);
    }

    /**
     * Calculate the od with modifiers.
     * @param {Number} od
     * @returns {Number}
     */
    calculateOD(od) {
        if (this.has(Constants.ModBits.hr)) od *= 1.4;
        if (this.has(Constants.ModBits.ht)) od *= 0.5;

        od = (Math.floor(od * 100) / 100);
        return Math.min(Math.max(od, 0), 10);
    }

    /**
     * Calculate the hp with modifiers.
     * @param {Number} hp
     * @returns {Number}
     */
    calculateHP(hp) {
        if (this.has(Constants.ModBits.hr)) hp *= 1.4;
        if (this.has(Constants.ModBits.ht)) hp *= 0.5;

        hp = (Math.floor(hp * 100) / 100);
        return Math.min(Math.max(hp, 0), 10);
    }

    /**
     * Calculate the cs with modifiers.
     * @param {Number} cs
     * @returns {Number}
     */
    calculateCS(cs) {
        if (this.has(Constants.ModBits.hr)) cs *= 1.3;
        if (this.has(Constants.ModBits.ht)) cs *= 0.5;

        cs = (Math.floor(cs * 100) / 100);
        return Math.min(Math.max(cs, 0), 10);
    }

    /**
     * Calculate the ar with modifiers.
     * @param {Number} ar
     * @returns {Number}
     */
    calculateAR(ar) {
        if (this.has(Constants.ModBits.hr)) ar *= 1.4;
        if (this.has(Constants.ModBits.ht)) ar *= 0.5;
        if (this.has(Constants.ModBits.dt)) ar = ((ar * 2) + 13) / 3;

        ar = (Math.floor(ar * 100) / 100);
        return Math.min(Math.max(ar, 0), (this.has(Constants.ModBits.dt) ? 11 : 10));
    }

    has(mod) {
        const check1 = (this.modbits & mod);
        const check2 = this.string.indexOf(mod) >= 0;

        return (check1 || check2);
    }

    toString() {
        let str = this.string;
        if (str != '') str = '+' + str
        return str;
    }

    /**
     * Converts string into modbits
     * @param {String} str string that will be converted
     * @returns {Number} The modbits
     */
    _stringToModbits(str) {
        let mask = 0;
        str = str.toLowerCase();
        while (str != '') {
            let nchars = 1;
            for (const property in Constants.ModBits) {
                if (property.length != 2) continue;
                if (!Constants.ModBits.hasOwnProperty(property)) continue;
                if (str.startsWith(property)) {
                    mask |= Constants.ModBits[property];
                    nchars = 2;
                    break;
                }
            }
            str = str.slice(nchars);
        }
        return mask;
    }

    /**
     * Converts modbits to a readable string
     * @param {Number} mods modbits that will be converted into a string
     * @returns {String} readable
     */
    _modbitsToString(mods) {
        let res = '';
        mods = parseInt(mods);
        for (const property in Constants.ModBits) {
            if (property.length != 2) continue;
            if (!Constants.ModBits.hasOwnProperty(property)) continue;
            if (mods & Constants.ModBits[property]) res += property.toUpperCase();
        }
        if (res.indexOf('DT') >= 0 && res.indexOf('NC') >= 0) res = res.replace('DT', '');
        return res;
    }
}

module.exports = Mods;