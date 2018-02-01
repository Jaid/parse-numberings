module.exports = {
    templates: {
        dateFormat: "DD.MM.YYYY hh:mm",
        search: false
    },
    opts: {
        recurse: true,
        package: "package.json",
        readme: "readme.md",
    },
    plugins: ["plugins/markdown"],
    source: {
        "include": ["src/"],
    }
}
