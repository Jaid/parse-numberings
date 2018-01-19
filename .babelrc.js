const isDevelopment = process.env.NODE_ENV !== "production"

const config = {}

const presets = [
    [
        "@babel/env",
        {
            "targets": {
                "node": "current"
            }
        }
    ],
    "@babel/stage-1"
]

const plugins = [
    "@babel/transform-runtime"
]

if (!isDevelopment) {
    plugins.push("lodash")
    presets.push(["minify", {
        mangle: false // Duplicate declaration "a" (This is an error on an internal node. Probably an internal error.)
    }])
    config.comments = false
}

if (isDevelopment) {
}

Object.assign(config, {plugins, presets})
module.exports = config
