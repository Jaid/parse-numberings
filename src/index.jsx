/**
 * @typedef {Object} FindOptions
 * @property {Object.<string, RegExp>} [options.patterns] A map of patterns that capture numeric matches in a group
 * @property {Object.<string, RegExp>} [options.additionalPatterns] An additional map of patterns that capture numeric matches in a group (so you don't have to overwrite `options.patterns` if you just want to add your own ones)
 * @property {boolean} [options.allowDuplicates] If `true`, could return a valid result instead of `null` if multiple occurrences of the same number were found
 * @property {boolean} [options.allowSkippedNumbers] If `true`, could return a valid result instead of `null` if a number between the lowest found number and the highest found number was found
 */

import glob from "globby"
import lodash from "lodash"
import path from "path"
import getSkippedNumberKey from "./getSkippedNumberKey"

/**
 * Matches a string by a given regex pattern to find a number.
 * @private
 * @param {string} string The string that may contain numbers
 * @param {RegExp} regexPattern The pattern that captures numeric matches in a group
 * @returns {?number}
 */
function findInStringByRegex(string, regexPattern) {
    const regexResult = regexPattern.exec(string)
    if (regexResult) {
        const capturedGroup = regexResult[1]
        const capturedGroupNumber = Number(capturedGroup)
        if (lodash.isNaN(capturedGroupNumber)) {
            return null
        }
        return capturedGroupNumber
    }
    return null
}

/**
 * Finds matching numbers in a list of strings by given regex pattern.
 * @private
 * @param {string[]|Object.<string, string>} strings The string list or string map to search numbers in
 * @param {RegExp} regexPattern The pattern that captures numeric matches in a group
 * @returns {?Object.<number, string|string[]>}
 */
function findInStringsByRegex(strings, regexPattern) {
    const numbers = {}
    if (lodash.isArray(strings)) {
        for (const string of strings) {
            const number = findInStringByRegex(string, regexPattern)
            if (number === null) {
                return null
            }
            const currentValue = numbers[number]
            if (currentValue === undefined) {
                numbers[number] = string
            } else if (lodash.isString(currentValue)) {
                numbers[number] = [currentValue, string]
            } else {
                numbers[number].push(currentValue)
            }
        }
    } else {
        for (const [key, string] of Object.entries(strings)) {
            const number = findInStringByRegex(string, regexPattern)
            if (number === null) {
                return null
            }
            const currentValue = numbers[number]
            if (currentValue === undefined) {
                numbers[number] = key
            } else if (lodash.isString(currentValue)) {
                numbers[number] = [currentValue, key]
            } else {
                numbers[number].push(key)
            }
        }
    }
    return numbers
}

/**
 * Finds matching numbers in a list of strings by given options.
 * @param {string[]|Object.<string, string>} strings The string list or string map to search numbers in
 * @param {FindOptions} [options] An options object
 * @returns {?{numbers, pattern}} A result object if valid numbers were found, `null` otherwise
 */
function findInStrings(strings, options) {
    options = {
        patterns: {
            digitsOnly: /^(\d+)$/,
            digitsRight: /(\d+)$/,
            digitsLeft: /^(\d+)/,
            digitsInBracesRight: /[\[({](\d+)[\])}]$/,
            digitsInBracesLeft: /^[\[({](\d+)[\])}]/,
            digitsAnywhereRight: /.*(\d+)/,
            digitsAnywhereLeft: /(\d+)/
        },
        additionalPatterns: {},
        allowDuplicates: false,
        allowSkippedNumbers: false,
        ...options
    }
    const allPatterns = {
        ...options.additionalPatterns,
        ...options.patterns
    }
    if (lodash.isEmpty(allPatterns)) {
        throw new Error("No patterns given")
    }
    for (const [patternName, pattern] of Object.entries(allPatterns)) {
        const numbers = findInStringsByRegex(strings, pattern)
        if (numbers) {
            if (!options.allowDuplicates && Object.values(numbers).find(value => lodash.isArray(value))) {
                // DUPLICATE
                continue
            }
            if (!options.allowSkippedNumbers && getSkippedNumberKey(numbers)) {
                // SKIPPED NUMBER
                continue
            }
            return {
                numbers,
                pattern: patternName
            }
        }
    }
    return null
}

/**
 * Finds matching numbers in a list of files paths (or file names) by given options.
 * @param {string[]} files
 * @param {FindOptions} options An option object
 * @returns {?{pattern, files}} A result object if valid numbers were found, `null` otherwise
 */
function findInFiles(files, options) {
    return findInStrings(files.reduce((map, file) => {
        map[file] = path.parse(file).name
        return map
    }, {}), options)
}

/**
 * Finds matching numbers in a list of files (applying to specified glob pattern) by given options.
 * @see {@link https://github.com/isaacs/node-glob#glob-primer} for glob pattern syntax.
 * @param globPattern A glob pattern
 * @param {FindOptions} options An option object
 * @param {Object} [options.globOptions] a
 * @returns {?{pattern, files}} A result object if valid numbers were found, `null` otherwise
 */
function findInGlob(globPattern, options) {
    return findInFiles(glob.sync(globPattern, options?.globOptions), options)
}

exports.findNumbersInGlob = findInGlob
exports.findNumbersInFiles = findInFiles
exports.findNumbersInStrings = findInStrings
