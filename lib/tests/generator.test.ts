import { generateTypes, printTypeNodes } from "../utils/helpers";
import { describe, expect, test } from "vitest";
import * as ts from "typescript";
import * as path from "node:path";

const expected_generated = `export type GeneratedRouteTypes = {
    UserRoute: CreateRouterInner<AnyRootConfig, {
        sayHello: BuildProcedure<"query", ProcedureParams<AnyRootConfig, unknown, string, string, unknown, unknown, unknown>, string>;
    }>;
    "__user": CreateRouterInner<AnyRootConfig, {
        whoAmI: BuildProcedure<"query", ProcedureParams<AnyRootConfig, unknown, { pronounce: string; }, { pronounce: string; }, unknown, unknown, unknown>, string>;
        updateName: BuildProcedure<"mutation", ProcedureParams<AnyRootConfig, unknown, { name: string; }, { name: string; }, unknown, unknown, unknown>, { newName: string; }>;
    }>;
};`

describe("generator script", () => {
    const cwd = process.cwd()
    const files = [
        path.join(cwd, "./lib/tests/fixtures/TestRouteNoChange.ts"),
        ]

    const program = ts.createProgram({
        rootNames: files,
        options: {
            target: ts.ScriptTarget.ES5,
            strict: true,
            rootDir: path.join(cwd, "./lib"),
        }
    })
    console.log({files, cwd})
    test("generateTypes", () => {
        const types = generateTypes(program, files)
        const content = printTypeNodes([types])
        expect(content).toBe(expected_generated)
    })
})

