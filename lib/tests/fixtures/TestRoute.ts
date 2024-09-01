import { decorators } from "./trpc";
import { z } from "zod";

@decorators.route()
export class TestRoute {
    @decorators.query("public")
    sayHello(@decorators.input(z.string()) name: string) {
        return `Hello ${name}! How are you?`
    }

    @decorators.mutation("public")
    updateName(@decorators.input(z.object({name: z.string()})) input: { name: string }) {
        return {newName: input.name}
    }

    internalMethod() {

    }

    @decorators.query("auth")
    whoAmI(@decorators.context()ctx: any) {
        return `You are ${ctx.user.name}`
    }
}