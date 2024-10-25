#!/usr/bin/env node
import fs from "node:fs"
import "reflect-metadata";
import * as ts from "typescript";
import path from "node:path";
import yargs from 'yargs/yargs';
import { generateImports, generateTypes, printTypeNodes } from "../utils/helpers";

const args = yargs(process.argv.slice(2)).options({
    src: { type: "string", default: "src" },
    output: { type: "string", default: "types-generated.ts" },
    blacklist: { type: "string", default: ["node_modules"], array: true },
    tsconfig: { type: "string", default: "tsconfig.json" }
} as const).parseSync()


async function run () {
    const cwd = process.cwd()
    const configPath = path.join(cwd, args.tsconfig)

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
    if (configFile.error) {
        throw new Error(ts.formatDiagnostic(configFile.error, {
          getCanonicalFileName: fileName => fileName,
          getCurrentDirectory: ts.sys.getCurrentDirectory,
          getNewLine: () => ts.sys.newLine
        }));
      }

    const parsedConfig = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        cwd
    )

    const program = ts.createProgram({
        rootNames: parsedConfig.fileNames, 
        options: parsedConfig.options,
    })


    generateTypesFromProject(program, path.join(cwd, args.output), parsedConfig.fileNames);
}

function generateTypesFromProject(program: ts.Program, outputPath: string, files: string[]) {
    const importNode = generateImports()
    const typeNode = generateTypes(program, files)
    const content = printTypeNodes([importNode, typeNode])
    fs.writeFileSync(outputPath, content, "utf-8")
    
}
if (require.main === module) {
    run()
}

