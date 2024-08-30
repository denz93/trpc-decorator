#!/usr/bin/env node

import "reflect-metadata";
import * as ts from "typescript";
import * as fs from "node:fs/promises";
import path from "node:path";
import { getInputIndex, getMethodNames, getProcedureType, isFunction, isRouter } from "../utils/metadata";
import { findNodeByName } from "../utils/compiler-helper";
import { ClassType } from "../utils/types";
import yargs from 'yargs/yargs';
import { discoverControllers, discoverTsFiles } from "../utils/helpers";

const args = yargs(process.argv.slice(2)).options({
    src: { type: "string", default: "src" },
    output: { type: "string", default: "types-generated.ts" },
    blacklist: { type: "string", default: ["node_modules"], array: true }
} as const).parseSync()


async function run () {
    const cwd = process.cwd()
    const srcDir = path.join(cwd, args.src)
    const files = await discoverTsFiles(srcDir, args.blacklist)
    
    const controllers = await discoverControllers(files);
    generateTypes(controllers);
}



async function generateTypes(controllers: Awaited<ReturnType<typeof discoverControllers>>) {
    
    const source = ts.createSourceFile(args.output, "", ts.ScriptTarget.ESNext, false, ts.ScriptKind.TS)
    const statements = generateControllerStatements(controllers)

    const node = ts.factory.createNodeArray([...statements])
    const result = ts.createPrinter().printList(ts.ListFormat.MultiLine,  node, source)
    ts.createCompilerHost({}).writeFile(args.output, result, false)
}

function generateControllerStatements(controllers: Awaited<ReturnType<typeof discoverControllers>>) {
    const imports = [
        ts.factory.createImportDeclaration(
            undefined,
            ts.factory.createImportClause(
                false,
                ts.factory.createIdentifier("{TRPCQueryProcedure, TRPCMutationProcedure}"),
                undefined
            ),
            ts.factory.createStringLiteral("@trpc/server")
        ),
    ]
    const statements = controllers.map(({controller, file}) => {
        const name = controller.name
        const methods = getMethodNames(controller.prototype)
        const program = ts.createProgram({
            options: {
                target: ts.ScriptTarget.ES2016,
                module: ts.ModuleKind.NodeNext,
                strict: true
            },
            rootNames: [file],

        })
        const typeChecker = program.getTypeChecker()
        const source = program.getSourceFile(file) as ts.SourceFile
        
        const methodStatements = methods.map(
            method => generateMethodStatements(method, controller, source, typeChecker)
        )
        return ts.factory.createTypeAliasDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
            ts.factory.createIdentifier("RouteControllerType"),
            undefined,
            ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier(name),
                    undefined,
                    ts.factory.createTypeLiteralNode(
                        methodStatements
                    )
                )
            ]
                
            )
        )

    })
    return [...imports, ...statements]
}

function generateMethodStatements(method: string, controller: ClassType, source: ts.SourceFile, typeChecker: ts.TypeChecker) {
        const procedureType = getProcedureType(controller.prototype, method)
        const procedureTypeName = procedureType === "query" ? "TRPCQueryProcedure" : "TRPCMutationProcedure";

        const methodNode = findNodeByName(source, method, source) as ts.MethodDeclaration
        const returnTypeNode = generateReturnTypeNode(methodNode, typeChecker)
        
        
        const inputTypeNode = generateInputTypeNode(methodNode, getInputIndex(controller.prototype, method), typeChecker)
       
        return ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier(method),
            undefined,
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(procedureTypeName),
                [
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined, 
                            ts.factory.createIdentifier("input"),
                            undefined,
                            inputTypeNode
                        ),
                        ts.factory.createPropertySignature(
                            undefined, 
                            ts.factory.createIdentifier("output"),
                            undefined,
                            returnTypeNode
                        )
                    ])
                    
                ]
            )
        )
    
}

function generateInputTypeNode(methodNode: ts.MethodDeclaration, inputIndex: number | undefined, typeChecker: ts.TypeChecker) {
    const parameter = inputIndex !== undefined ? methodNode.parameters[inputIndex] : undefined;
    const inputDecoratorNode = parameter &&  parameter.modifiers?.find(m => ts.isDecorator(m))
    
    if (inputDecoratorNode && ts.isCallExpression(inputDecoratorNode.expression)) {
        const t = typeChecker.getTypeAtLocation(inputDecoratorNode.expression)
        const signature = t.getCallSignatures()[0]
        const parameter = signature.getTypeParameters()?.at(0) as ts.TypeParameter
        const newDeclaration = (typeChecker.typeParameterToDeclaration(parameter, methodNode, undefined)) as ts.TypeParameterDeclaration
        return newDeclaration.default as ts.TypeNode
    }
    return  ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
}

function generateReturnTypeNode(methodNode: ts.MethodDeclaration, typeChecker: ts.TypeChecker) {
    const returnType = typeChecker.getTypeAtLocation(methodNode as ts.Node).getCallSignatures()[0].getReturnType()
    return (typeChecker.typeToTypeNode(returnType, methodNode, undefined)) as ts.TypeNode
}

if (require.main === module) {
    run()
}