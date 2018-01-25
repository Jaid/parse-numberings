import mockFs from "mock-fs"
import {findNumbersInGlob, findNumbersInStrings} from "../src/index"

describe("File system tests", () => {

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
            "/test/0000002.png": "b 2: the awakening",
            "/test/a2.png": "b 3: the final chapter"
        })

        const resultWithoutAllowDuplicates = findNumbersInGlob("/test/")
        expect(resultWithoutAllowDuplicates).toBeNull()

        const resultWithAllowDuplicates = findNumbersInGlob("/test/", {
            allowDuplicates: true
        })
        expect(resultWithAllowDuplicates?.pattern).toBe("digitsRight")
        expect(resultWithAllowDuplicates?.numbers?.[2]).toEqual(["/test/0000002.png", "/test/2.png", "/test/a2.png"])

    })

    test("Skipped numbers", () => {

        mockFs({
            "/test/1st.png": "a",
            "/test/2nd.png": "b",
            "/test/4th.png": "skipped three REEEEEEEEEEEEEEE"
        })

        const resultWithoutAllowSkippedNumbers = findNumbersInGlob("/test/")
        expect(resultWithoutAllowSkippedNumbers).toBeNull()

        const resultWithAllowSkippedNumbers = findNumbersInGlob("/test/", {
            allowSkippedNumbers: true
        })
        expect(resultWithAllowSkippedNumbers?.pattern).toBe("digitsLeft")
        expect(resultWithAllowSkippedNumbers?.numbers?.[2]).toBeDefined()
        expect(resultWithAllowSkippedNumbers?.numbers?.[3]).toBeUndefined()
        expect(resultWithAllowSkippedNumbers?.numbers?.[4]).toBeDefined()


    })
})

test("String search", () => {

    const result = findNumbersInStrings([
        "string (1)",
        "string [2]",
        "string {3}",
        "string [3]",
        "string (3)"
    ], {
        allowDuplicates: true
    })

    expect(result?.pattern).toBe("digitsInBracesRight")

})

test("Error: No patterns given", () => {

    const call = () => findNumbersInStrings(["1"], {
        patterns: {}
    })

    expect(call).toThrow("No patterns")

})

test("Error: Broken pattern", () => {

    const result = findNumbersInStrings(["a"], {
        patterns: {
            brokerino: /(a+)/
        }
    })

    expect(result).toBeNull()

})
