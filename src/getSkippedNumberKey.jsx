// TODO Doesn't work?
export default object => {
    for (const key in object) {
        if (object.hasOwnProperty(key + 2) && !object.hasOwnProperty(key + 1)) {
            return key
        }
    }
    return false
}
