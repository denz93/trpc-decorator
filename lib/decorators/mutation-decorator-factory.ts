import { addMethod, defineProcedureName, defineProcedureType } from "../utils/metadata"
import type { ProcedureBuilderMap } from "../utils/types";

export function createMutationDecorator<ProcedureMap extends ProcedureBuilderMap>() {
    return function decorator(procedureName: keyof ProcedureMap) {
        return (target: object, propertyKey: string, _descriptor: PropertyDescriptor) => {
            addMethod(target, propertyKey);
            defineProcedureType(target, propertyKey, "mutation");
            defineProcedureName(target, propertyKey, procedureName as string)
    
        }
    }
}