module.exports = {
    templates: {
        dateFormat: "DD.MM.YYYY hh:mm",
        syntaxTheme: "dark",
        inverseNav: true,
        search: false,
        theme: "united"
    },
    opts: {
        recurse: true,
        package: "package.json",
        readme: "readme.md",
        template: "node_modules/ink-docstrap/template"
    },
    plugins: ["plugins/markdown"]
}
