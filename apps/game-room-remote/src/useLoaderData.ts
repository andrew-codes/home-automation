import { SerializeFrom, TypedResponse } from "@remix-run/node"
import { useLoaderData as remixUseLoaderData } from "@remix-run/react"
import parse from "./api/jsonParser"

declare type OmitIndexSignature<ObjectType> = {
  [KeyType in keyof ObjectType as {} extends Record<KeyType, unknown>
    ? never
    : KeyType]: ObjectType[KeyType]
}
declare type PickIndexSignature<ObjectType> = {
  [KeyType in keyof ObjectType as {} extends Record<KeyType, unknown>
    ? KeyType
    : never]: ObjectType[KeyType]
}
declare type Simplify<T> = {
  [KeyType in keyof T]: T[KeyType]
}
declare type RequiredFilter<
  Type,
  Key extends keyof Type,
> = undefined extends Type[Key]
  ? Type[Key] extends undefined
    ? Key
    : never
  : Key
declare type OptionalFilter<
  Type,
  Key extends keyof Type,
> = undefined extends Type[Key]
  ? Type[Key] extends undefined
    ? never
    : Key
  : never
declare type EnforceOptional<ObjectType> = Simplify<
  {
    [Key in keyof ObjectType as RequiredFilter<
      ObjectType,
      Key
    >]: ObjectType[Key]
  } & {
    [Key in keyof ObjectType as OptionalFilter<ObjectType, Key>]?: Exclude<
      ObjectType[Key],
      undefined
    >
  }
>
declare type SimpleMerge<Destination, Source> = {
  [Key in keyof Destination | keyof Source]: Key extends keyof Source
    ? Source[Key]
    : Key extends keyof Destination
    ? Destination[Key]
    : never
}
declare type Merge<Destination, Source> = EnforceOptional<
  SimpleMerge<PickIndexSignature<Destination>, PickIndexSignature<Source>> &
    SimpleMerge<OmitIndexSignature<Destination>, OmitIndexSignature<Source>>
>

declare type JsonPrimitive =
  | string
  | number
  | boolean
  | String
  | Number
  | Boolean
  | null
declare type NonJsonPrimitive = undefined | Function | symbol
declare type IsDate<T> = T extends Date ? true : false
declare type IsAny<T> = 0 extends 1 & T ? true : false
declare type Serialize<T> = IsAny<T> extends true
  ? any
  : T extends JsonPrimitive
  ? T
  : IsDate<T> extends true
  ? Date
  : T extends NonJsonPrimitive
  ? never
  : T extends {
      toJSON(): infer U
    }
  ? U
  : T extends []
  ? []
  : T extends [unknown, ...unknown[]]
  ? SerializeTuple<T>
  : T extends ReadonlyArray<infer U>
  ? (U extends NonJsonPrimitive ? null : Serialize<U>)[]
  : T extends object
  ? SerializeObject<UndefinedToOptional<T>>
  : never
declare type SerializeTuple<T extends [unknown, ...unknown[]]> = {
  [k in keyof T]: T[k] extends NonJsonPrimitive ? null : Serialize<T[k]>
}
declare type SerializeObject<T extends object> = {
  [k in keyof T as T[k] extends NonJsonPrimitive ? never : k]: Serialize<T[k]>
}
declare type UndefinedToOptional<T extends object> = Merge<
  {
    [k in keyof T as undefined extends T[k] ? never : k]: T[k]
  },
  {
    [k in keyof T as undefined extends T[k] ? k : never]?: Exclude<
      T[k],
      undefined
    >
  }
>
declare type ArbitraryFunction = (...args: any[]) => unknown

type SerializeFrom<T extends any | ArbitraryFunction> = Serialize<
  T extends (...args: any[]) => infer Output
    ? Awaited<Output> extends TypedResponse<infer U>
      ? U
      : Awaited<Output>
    : Awaited<T>
>

const useLoaderData = <T>(): SerializeFrom<T> => {
  const data = remixUseLoaderData<T>()

  return parse(JSON.stringify(data))
}

export default useLoaderData
