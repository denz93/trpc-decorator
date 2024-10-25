import { defineContext } from "../utils/metadata";

// @ts-ignore
export default function context<_T>() {
    // @ts-ignore
    return <_T> (target: object, propertyKey: string, parameterIndex: number) => {
        defineContext(target, propertyKey, parameterIndex)
    }
}