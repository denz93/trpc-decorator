import { defineRoute } from "../utils/metadata"

export default function route(name?: string) {
    return function (target: any) {
        if (!name) name = target.name as string;
        defineRoute(target, name);
    }
}