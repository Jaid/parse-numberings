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
      "/test/3.png": "c",
    })

    const result = findNumbersInGlob("/test/")
    expect(result?.pattern).toBe("digitsOnly")
  })

  test("Duplicate numbers", () => {
    mockFs({
      "/test/1.png": "a",
      "/test/2.png": "b",
      "/test/0000002.png": "b 2: the awakening",
      "/test/a2.png": "b 3: the final chapter",
    })

    const resultWithoutAllowDuplicates = findNumbersInGlob("/test/")
    expect(resultWithoutAllowDuplicates).toBeNull()

    const resultWithAllowDuplicates = findNumbersInGlob("/test/", {
      allowDuplicates: true,
    })
    expect(resultWithAllowDuplicates?.pattern).toBe("digitsRight")
    expect(resultWithAllowDuplicates?.numbers?.[2]).toEqual(["/test/0000002.png", "/test/2.png", "/test/a2.png"])
  })

  test("Skipped numbers", () => {
    mockFs({
      "/test/1st.png": "a",
      "/test/2nd.png": "b",
      "/test/4th.png": "skipped three REEEEEEEEEEEEEEE",
    })

    const resultWithoutAllowSkippedNumbers = findNumbersInGlob("/test/")
    expect(resultWithoutAllowSkippedNumbers).toBeNull()

    const resultWithAllowSkippedNumbers = findNumbersInGlob("/test/", {
      allowSkippedNumbers: true,
    })
    expect(resultWithAllowSkippedNumbers?.pattern).toBe("digitsLeft")
    expect(resultWithAllowSkippedNumbers?.numbers?.[2]).toBeDefined()
    expect(resultWithAllowSkippedNumbers?.numbers?.[3]).toBeUndefined()
    expect(resultWithAllowSkippedNumbers?.numbers?.[4]).toBeDefined()
  })

  test("Complex file system", () => {
    mockFs({
      "/education": {
        "Part 0 - Very educational intro.mp3": "Beep boop",
        "Part 04 - Very educational intro.mp3": "Beep boop",
        "Chapter 1": {
          "Part 01 - How 2 spell DOG.mp3": "Beep boop",
          "Part 02 - How 2 train your doggo.mp3": "Beep boop",
          "Part 03 - How 2 train your keyboard to spell DOG for you.mp3": "Beep boop",
          "readme.md": "edu[cat](https://i.imgur.com/jlFgGpe.jpg)ion",
          "What a dog looks like": {
            "Actual dog.bmp": "Woof (intense)",
            "Human in dog costume.apng": "Woof (in tents)",
            "Human identifying hirself as a dog.rmvb": "Stop raping me on Twitter!",
          },
        },
        "Chapter 2": {
          "Bonus content": {
            "(Bonus) Part 05 - How 2 haunt a house - Part 1.mp3": "Beep boop",
            "(Bonus) Part 06 - How 2 haunt a house - Part 2.mp3": "Beep boop",
          },
        },
      },
    })

    const result = findNumbersInGlob("/education/**/*.mp3")
    expect(result?.pattern).toBe("digitsAnywhereLeft")
  })
})

test("String search", () => {
  const result = findNumbersInStrings([
    "string (1)",
    "string [2]",
    "string {3}",
    "string [3]",
    "string (3)",
  ], {
    allowDuplicates: true,
  })

  expect(result?.pattern).toBe("digitsInBracesRight")
})

test("digitsAnywhereRight pattern", () => {
  const result = findNumbersInStrings([
    ">0 RARE 2 ..>",
    ">0 GIFF 1 .>",
    ">0 PEPE 3 ...>",
  ])

  expect(result?.pattern).toBe("digitsAnywhereRight")
})

test("Error: No patterns given", () => {
  const call = () => findNumbersInStrings(["1"], {
    patterns: {},
  })

  expect(call).toThrow("No patterns")
})

test("Error: Broken pattern", () => {
  const result = findNumbersInStrings(["a"], {
    patterns: {
      brokerino: /(a+)/,
    },
  })

  expect(result).toBeNull()
})