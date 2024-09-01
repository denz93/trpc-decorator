import { inject, injectable, autoInjectable } from "tsyringe";
import { decorators } from "./trpc";
import { z } from "zod";

@injectable()
export class IocService {
    sum(...nums: number[]) {
        return nums.reduce((acc, num) => acc + num, 0)
    }
}
@injectable()
@decorators.route()
export class TestRouteWithIoC {
    constructor(@inject(IocService)private ioc: IocService) {}

    @decorators.query("public")
    calcSum(@decorators.input(z.object({a: z.number(), b: z.number()})) input: {a: number, b: number}) {
        return this.ioc.sum(input.a, input.b)
    }
}

