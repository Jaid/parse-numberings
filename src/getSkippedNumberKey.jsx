/**
 * Looks for any gaps in the numeric keys of given object.
 * @param {Object.<number,*>} object
 * @returns {boolean|number} `false` if there are no gaps in the keys, or a number representing the first missing key found
 */
function getSkippedNumberKey(object) {
    for (const key of Object.keys(object)) {
        const numberKey = Number(key)
        if (Number.isNaN(numberKey)) {
            throw new Error(`Key ${key} is not numeric`)
        }
        if (object.hasOwnProperty(numberKey + 2) && !object.hasOwnProperty(numberKey + 1)) {
            return numberKey + 1
        }
    }
    return false
}

export default getSkippedNumberKey
