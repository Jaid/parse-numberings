import glob from "globby"
import lodash from "lodash"
import path from "path"

function getNumbersByRegex(files, regexPattern) {
    const numbers = {}
    for (const file of files) {
        const fileNameWithoutExtension = path.parse(file).name
        const regexResult = regexPattern.exec(fileNameWithoutExtension)
        if (regexResult) {
            const capturedGroup = regexResult[1]
            if (capturedGroup === null || capturedGroup === undefined) {
                return false
            }
            const capturedNumber = +capturedGroup
            if (numbers[capturedNumber]) {
                return false
            }
            numbers[+capturedGroup] = file
        }
    }
    return numbers
}

function find(files, options) {
    options = {
        patterns: {
            "digitsOnly": /(\d+)/
        },
        additionalPatterns: {},
        ...options
    }
    const allPatterns = {
        ...options.patterns,
        ...options.additionalPatterns
    }
    if (lodash.isEmpty(allPatterns)) {
        throw new Error("No patterns given")
    }
    for (const [patternName, pattern] of Object.entries(allPatterns)) {
        const numbers = getNumbersByRegex(files, pattern)
        if (numbers) {
            return {
                pattern: patternName,
                files: numbers
            }
        }
    }
}

function findByGlob(globPattern, options) {
    const files = glob.sync(globPattern, options?.globOptions)
    return find(files)
}

find.glob = findByGlob
export default find
