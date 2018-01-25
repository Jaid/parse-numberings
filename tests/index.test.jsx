import mockFs from "mock-fs"
import {findNumbersInGlob} from "../src/index"

afterEach(() => {
    mockFs.restore()
})

test("Basic test", () => {

    mockFs({
        "/test/1.png": "a",
        "/test/2.png": "b",
        "/test/3.png": "c"
    })

    const result = findNumbersInGlob("/test/")
    expect(result?.pattern).toBe("digitsOnly")

})

test("Duplicate numbers", () => {

    mockFs({
        "/test/1.png": "a",
        "/test/2.png": "b",
        "/test/0000002.png": "c",
        "/test/a2.png": "d"
    })

    // const resultWithoutAllowDuplicates = findNumbersInGlob("/test/")
    //expect(resultWithoutAllowDuplicates).toBeNull()

    const resultWithAllowDuplicates = findNumbersInGlob("/test/", {
        allowDuplicates: true
    })
    expect(resultWithAllowDuplicates?.pattern).toBe("digitsRight")
    expect(resultWithAllowDuplicates?.numbers?.[2]).toEqual(["/test/0000002.png", "/test/2.png", "/test/a2.png"])

})
