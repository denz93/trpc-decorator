import { defineProcedureName } from "../utils/metadata"

export default function procedureDecoratorFactory(name: string) {
    return function decorator() {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            defineProcedureName(target, propertyKey, name, true)
        }
    }
}