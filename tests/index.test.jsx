import mockFs from "mock-fs"
import {findNumbersInGlob} from "../src/index"

afterEach(() => {
    mockFs.restore()
})

test("Basic test", () => {

    mockFs({
        "/test/1.png": "a",
        "/test/3.png": "b",
        "/test/4.png": "c",
    })

    const result = findNumbersInGlob("/test/")
    expect(result?.pattern).toBe("digitsOnly")

})
