import { formatKeys, nameFromId } from "../"

describe("formatKeys", () => {
  test("formats keys in object", () => {
    const input = {
      MyKey: "value",
      my_key: "value",
      "my-key": "value",
      "My key": "value",
    }
    const actual = formatKeys(input)
    expect(Object.keys(actual)).toEqual(["myKey"])
  })

  test("formats nested keys in object", () => {
    const input = {
      MyKey: "value",
      my_key: "value",
      "my-key": "value",
      "My key": "value",
      NestedKeys: {
        MyKey: "value",
        my_key: "value",
        "my-key": "value",
        "My key": "value",
      },
    }
    const actual = formatKeys(input)
    expect(Object.keys(actual)).toEqual(["myKey", "nestedKeys"])
    expect(Object.keys(actual.nestedKeys)).toEqual(["myKey"])
  })

  test("formats keys in array of object", () => {
    const input = [
      {
        MyKey: "value",
        my_key: "value",
        "my-key": "value",
        "My key": "value",
      },
      {
        MyKey: "value",
        my_key: "value",
        "my-key": "value",
        "My key": "value",
      },
    ]
    const [actual1, actual2] = formatKeys(input)
    expect(Object.keys(actual1)).toEqual(["myKey"])
    expect(Object.keys(actual2)).toEqual(["myKey"])
  })

  test("formats nested keys in array of objects", () => {
    const input = [
      {
        MyKey: "value",
        my_key: "value",
        "my-key": "value",
        "My key": "value",
        NestedKeys: {
          MyKey: "value",
          my_key: "value",
          "my-key": "value",
          "My key": "value",
        },
      },
      {
        MyKey: "value",
        my_key: "value",
        "my-key": "value",
        "My key": "value",
        NestedKeys: {
          MyKey: "value",
          my_key: "value",
          "my-key": "value",
          "My key": "value",
        },
      },
    ]
    const [actual1, actual2] = formatKeys(input)
    expect(Object.keys(actual1)).toEqual(["myKey", "nestedKeys"])
    expect(Object.keys(actual1.nestedKeys)).toEqual(["myKey"])
    expect(Object.keys(actual2)).toEqual(["myKey", "nestedKeys"])
    expect(Object.keys(actual2.nestedKeys)).toEqual(["myKey"])
  })

  test("handles null values", () => {
    const input = {
      MyKey: null,
    }
    const actual = formatKeys(input)
    expect(actual.myKey).toEqual(null)
  })

  test("handles string values", () => {
    expect(formatKeys("A value")).toEqual("A value")
  })

  test("handles numbers values", () => {
    expect(formatKeys(1)).toEqual(1)
  })

  test("handles boolean values", () => {
    expect(formatKeys(true)).toEqual(true)
  })

  test("handles date values", () => {
    const input = new Date()
    expect(formatKeys(input)).toEqual(input)
  })
})

describe("nameFromId", () => {
  test("computes name from an ID value", () => {
    expect(nameFromId("This is my name")).toEqual("This Is My Name")
    expect(nameFromId("this-is-my-name")).toEqual("This Is My Name")
    expect(nameFromId("this_is_my_name")).toEqual("This Is My Name")
    expect(nameFromId("this.is.my.name")).toEqual("This Is My Name")
    expect(nameFromId("thisIsMyName")).toEqual("This Is My Name")
    expect(nameFromId("ThisIsMyName")).toEqual("This Is My Name")
  })
})
