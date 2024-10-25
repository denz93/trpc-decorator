import { decorators } from "./trpc";
import {z} from "zod";
import type { contextOf } from "./trpc"

@decorators.route()
export class UserRoute {
    @decorators.query("public")
    sayHello(@decorators.input(z.string()) name: string) {
        return `Hello ${name}! How are you?`;
    }
}

@decorators.route("__user")
export class UserRouteWithCustomName {
    @decorators.query("auth")
    whoAmI(
        @decorators.context() 
        ctx: contextOf["auth"], 
        @decorators.input(z.object({pronounce: z.string()}))
        input: {pronounce: string}
    ) {
        return `You are ${input.pronounce} ${ctx.user.name}`
    }
    
    @decorators.mutation("auth")
    updateName(@decorators.input(z.object({name: z.string()})) input: { name: string }) {
        return {newName: input.name}
    }
}