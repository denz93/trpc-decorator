import { defineContext } from "../utils/metadata";

export default function context<T>() {
    return function<T> (target: object, propertyKey: string, parameterIndex: number) {
        defineContext(target, propertyKey, parameterIndex)
    }
}