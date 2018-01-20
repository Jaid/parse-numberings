/**
 * A variant of babel-jest that will process some files with babel@6 and some with babel@7
 * This code is based on babel-jest: https://github.com/facebook/jest/blob/master/packages/babel-jest/src/index.js
 * TODO: Support instrument
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const util = require('util');

const babel6 = require('babel-core');
const babel7 = require('@babel/core');
const jestPreset = require('babel-preset-jest');

const thisFileContent = fs.readFileSync(__filename);

function isBabel6Filename(filename) {
    return filename.startsWith(modulesPath);
}

function applyJestOptions(babelOptions) {
    babelOptions.presets = (babelOptions.presets || []).concat(jestPreset);
    babelOptions.retainLines = true;
    babelOptions.sourceMaps = 'inline';
}

const modulesPath = path.join(__dirname, 'node_modules');

const babel6Options = {
    presets: ['react-native'],
};

applyJestOptions(babel6Options);

function getBabel7Options(filename) {
    const babel7Options = babel7.loadOptions({
        babelrc: true,
        filename,
        envName: 'test',
    });
    applyJestOptions(babel7Options);
    return babel7Options;
}

function processBabel6(src, filename, config) {
    if (!babel6.util.canCompile(filename, config.moduleFileExtensions.map(x => `.${x}`))) {
        return src;
    }

    return babel6.transform(src, babel6Options).code;
}

function processBabel7(src, filename) {
    const babel7Options = getBabel7Options(filename);
    const result = babel7.transform(src, babel7Options);
    return result ? result.code : src;
}

function process(src, filename, config, transformOptions) {
    if (isBabel6Filename(filename)) {
        return processBabel6(src, filename, config);
    } else {
        return processBabel7(src, filename);
    }
}

function getCacheKey(fileData, filename, configString, {instrument}) {
    return crypto
        .createHash('md5')
        .update(thisFileContent)
        .update('\0', 'utf8')
        .update(fileData)
        .update('\0', 'utf8')
        .update(filename)
        .update('\0', 'utf8')
        .update(configString)
        .update('\0', 'utf8')
        // util.inspect() shows more things than JSON.stringify().
        .update(util.inspect(
            isBabel6Filename(filename) ? babel6Options : getBabel7Options(filename),
            { depth: null, colors: false }))
        .update('\0', 'utf8')
        .update(instrument ? 'instrument' : '')
        .digest('hex');
}

module.exports = { getCacheKey, process };
