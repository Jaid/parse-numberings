import fs from "fs"
import mock from "mock-fs"


beforeAll(() => {
    mock({
        "path/to/file.txt": "my text content"
    })
})


afterAll(() => {
    mock.restore()
})

test("Basic test", () => {

    console.log(fs.readFileSync("path/to/file.txt", "UTF8"))

})

