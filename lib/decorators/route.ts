import { defineRoute } from "../utils/metadata"

export default function route(name?: string) {
     
    return (target: object & {name?: string}) => {
        let routeName = name;
        if (!routeName) routeName = target.name as string;
        
        defineRoute(target, routeName);
    }
}