import mockFs from "mock-fs"
import findRelatedFiles from "../src/findRelatedFiles"

afterEach(() => {
    mockFs.restore()
})

test("Basic test", () => {

    mockFs({
        "/test/1.png": "a",
        "/test/2.png": "b",
        "/test/3.png": "c"
    })

    const result = findRelatedFiles.glob("/test/")
    expect(result?.pattern).toBe("digitsOnly")

})
