# numbered-list

Looks for related numbers in strings or file names and lists them for you. The detection is done in a heuristic way, but `numbered-list` helps you to decide if the results 

## Installation

```bash
yarn add numbered-list
```
or even
```bash
npm install --save numbered-list
```

## Usage

### Finding numbers in strings

```jsx
import { findNumbersInStrings } from "numbered-list"

const strings = [
    "String #1",
    "String #3",
    "String #2"
]

findNumbersInStrings(strings)
```
gives:
```json
{
    "numbers": {
        "1": "String #1",
        "2": "String #2",
        "3": "String #3"
    },
    "pattern": "digitsRight"
}
```

### result.pattern

The result object contains `pattern` which names the RegExp pattern that has successfully been applied on every entry of your list.

```jsx
import { findNumbersInStrings } from "numbered-list"

const strings = [
    "[1] first entry",
    "[2] second entry",
    "[3] third entry"
]

findNumbersInStrings(strings)
```
gives:
```json
{
    "numbers": {
        "1": "[1] first entry",
        "2": "[2] second entry",
        "3": "[3] third entry"
    },
    "pattern": "digitsInBracesLeft"
}
```

### Duplicates

By default, `findNumbersInStrings` returns `null` if it found duplicates and couldn't think of any sane way to exclude them. You can explicitly allow them with `options.allowDuplicates`.

```jsx
import { findNumbersInStrings } from "numbered-list"

const strings = [
    "1: first entry",
    "3: third entry",
    "2: second entry",
    "3: ird thentry"
]

findNumbersInStrings(strings, {
    allowDuplicates: true
})
```
gives:
```json
{
    "numbers": {
        "1": "1: first entry",
        "2": "2: second entry",
        "3": [
            "3: third entry",
            "3: ird thentry"
        ]
    },
    "pattern": "digitsLeft"
}
```

### Skipped numbers

By default, `findNumbersInStrings` returns `null` if there are any missing numbers between the lowest and the highest numeric key. You can explicitly allow them with `options.allowSkippedNumbers`.

```jsx
import { findNumbersInStrings } from "numbered-list"

const strings = [
    "> 1 GIFF",
    "> 2 RARE",
    "> 11 PEPE"
]

findNumbersInStrings(strings, {
    allowSkippedNumbers: true
})
```
gives:
```json
{
    "numbers": {
        "1": "> 1 GIFF",
        "2": "> 2 RARE",
        "11": "> 11 PEPE"
    },
    "pattern": "digitsAnywhereLeft"
}
```

### Map

You can also give me two strings per list entry, one for the representation and one for the number search.

```jsx
import { findNumbersInStrings } from "numbered-list"

const strings = {
    linus: "Human #96651738921",
    steve: "Human #96651738922",
    bill: "Human #96651738923"
}

findNumbersInStrings(strings)
```
gives:
```json
 {
    "numbers": {
        "96651738921": "linus",
        "96651738922": "steve",
        "96651738923": "bill"
    },
    "pattern": "digitsRight"
}
```

### File names

This example demonstrates how this library could actually be useful!

File system:
```plain
/education/
├── Part 0 - Very educational intro.mp3
├── Part 04 - Ery veducational outro.mp3
├── Chapter 1/
│   ├── Part 01 - How 2 spell DOG.mp3
│   ├── Part 02 - How 2 train your doggo.mp3
│   ├── Part 03 - How 2 train your keyboard to spell DOG for you.mp3
│   ├── readme.md
│   └── How a dog looks like/
│       ├── Actual dog.bmp
│       ├── Human in dog costume.apng
│       └── Human identifying hirself as a dog.rmvb
└── Chapter 2/
    └── Bonus content/
        ├── (Bonus) Part 05 - How 2 haunt a house - Part 1.mp3
        └── (Bonus) Part 06 - How 2 haunt a house - Part 2.mp3
```

```jsx
import { findNumbersInGlob } from "numbered-list"

findNumbersInGlob("/education/**/*.mp3")
```

gives:

```json
{
    "numbers": {
        "0": "/education/Part 0 - Very educational intro.mp3",
        "1": "/education/Chapter 1/Part 01 - How 2 spell DOG.mp3",
        "2": "/education/Chapter 1/Part 02 - How 2 train your doggo.mp3",
        "3": "/education/Chapter 1/Part 03 - How 2 train your keyboard to spell DOG for you.mp3",
        "4": "/education/Part 04 - Very educational intro.mp3",
        "5": "/education/Chapter 2/Bonus content/(Bonus) Part 05 - How 2 haunt a house - Part 1.mp3",
        "6": "/education/Chapter 2/Bonus content/(Bonus) Part 06 - How 2 haunt a house - Part 2.mp3"
    },
    "pattern": "digitsAnywhereLeft"
}
```
