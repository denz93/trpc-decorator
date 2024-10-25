import { defineProcedureName } from "../utils/metadata"

export default function procedureDecoratorFactory(name: string) {
    return function decorator() {
        return (target: object, propertyKey: string, _descriptor: PropertyDescriptor) => {
            defineProcedureName(target, propertyKey, name, true)
        }
    }
}