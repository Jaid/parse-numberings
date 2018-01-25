import glob from "globby"
import lodash from "lodash"
import path from "path"
import getSkippedNumberKey from "./getSkippedNumberKey"

/**
 * Matches a string by a given regex pattern to find a number.
 * @param {string} string
 * @param {RegExp} regexPattern
 * @returns {(?number)}
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
 * @param {string[]|Object.<string, string>} strings
 * @param {RegExp} regexPattern
 * @returns {Object.<number, string|string[]>}
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
 * @param {string[]|Object.<string, string>} strings
 * @param {Object} options
 * @param {Object.<string, RegExp>} options.patterns
 * @param {Object.<string, RegExp>} [options.additionalPatterns]
 * @returns {?{numbers, pattern}}
 */
function findInStrings(strings, options) {
    options = {
        patterns: {
            digitsOnly: /^(\d+)$/,
            digitsRight: /(\d+)$/,
            digitsLeft: /^(\d+)/,
            digitsInBracesRight: /[\[({](\d+)[\])}]$/,
            digitsInBracesLeft: /^[\[({](\d+)[\])}]/,
            digitsAnywhere: /(\d+)/
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
 * @param options
 * @returns {?{pattern, files}}
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
 * @param options
 * @returns {?{pattern, files}}
 */
function findByGlob(globPattern, options) {
    return findInFiles(glob.sync(globPattern, options?.globOptions), options)
}

exports.findNumbersInGlob = findByGlob
exports.findNumbersInFiles = findInFiles
exports.findNumbersInStrings = findInStrings
