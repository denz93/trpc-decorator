import fs from "node:fs/promises";
import { readdirSync, lstatSync } from "node:fs"
import path from "node:path";
import { isFunction, isRouter } from "./metadata";
import type { ClassType } from "./types";
import * as ts from "typescript";


export function generateTypes(program: ts.Program, files: string[]) {
    const typeChecker = program.getTypeChecker()
    
    const classTypes = files.map(file => program.getSourceFile(file)).filter(file => !!file).flatMap(sourceFile => {
        const classes = getRouteClasses(sourceFile)
        const generatedType = classes.map(cls => {
            return generateClassType(typeChecker, cls)
        })
        return generatedType
    })

    const literalType = ts.factory.createTypeLiteralNode(
        classTypes
    )

    return ts.factory.createTypeAliasDeclaration(
        [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier("GeneratedRouteTypes"),
        undefined,
        literalType
    )
}





function generateClassType(typeChecker: ts.TypeChecker, cls: ts.ClassDeclaration) {
    const className = getRouteClassName(cls)
    if (!className) throw new Error("No class name");

    const methods = getInstanceMethods(cls)
    const methodTypeNodes = methods.map(method => generateMethodType(typeChecker, method))
    return ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier(className),
        undefined,
        ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier("CreateRouterInner"),
            [
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("AnyRootConfig")),
                ts.factory.createTypeLiteralNode(
                    methodTypeNodes
                )
            ]
        )
    )
}


function generateMethodType(typeChecker: ts.TypeChecker,method: ts.MethodDeclaration) {
    const methodType = getMethodType(method)
    const inputType = getInputType(typeChecker, method)
    const returnType = getReturnType(typeChecker, method)
    const procedureTypeNode = createBuildProcedureTypeNode(methodType, inputType, returnType)
    return ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier(method.name.getText()),
        undefined,
        procedureTypeNode
    )
}


function getReturnType(typeChecker: ts.TypeChecker, method: ts.MethodDeclaration) {
    const methodType = typeChecker.getTypeAtLocation(method )
    const signature = methodType.getCallSignatures()[0]
    const returnType = signature.getReturnType()
    return typeChecker.typeToTypeNode(returnType, method, undefined) ?? ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
}


function getInputType(typeChecker: ts.TypeChecker, method: ts.MethodDeclaration) {
    const inputDecorator = getParameterDecorator(method, "input")
    const voidType = ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
    if (!inputDecorator) return voidType

    
    const expression = inputDecorator?.expression as ts.CallExpression
    
    const typeExpression = typeChecker.getTypeAtLocation(expression)
    const signature = typeExpression.getCallSignatures()[0]
    const typeParameter = signature.getTypeParameters()?.at(0)

    if (!typeParameter) return voidType

    const declaration = typeChecker.typeParameterToDeclaration(typeParameter, method, undefined)

    if (!declaration) return voidType

    const typeNode = declaration.default

    if (!typeNode) return voidType

    return typeNode
}

export function printTypeNodes(typeNodes: ts.Node[]): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const resultFile = ts.createSourceFile("dummy.ts", "", ts.ScriptTarget.ES2015, false, ts.ScriptKind.TS);
    
    return printer.printList(ts.ListFormat.SourceFileStatements, ts.factory.createNodeArray(typeNodes), resultFile)
  }

function getMethodType(method: ts.MethodDeclaration) {
    return getDecoratorByName(method, "query") ? "query" : "mutation"
}

function getInstanceMethods(cls: ts.ClassDeclaration) {
    return cls.members.filter(m => ts.isMethodDeclaration(m) && isProcedureMethod(m)) as ts.MethodDeclaration[]
}

function isProcedureMethod(method: ts.MethodDeclaration) {
    return method.modifiers &&
        ts.isDecorator(method.modifiers[0]) &&
        (isDecoratorWithName(method.modifiers[0], "query") || isDecoratorWithName(method.modifiers[0], "mutation"))
}

function isDecoratorWithName(decorator: ts.Decorator, name: string) {
    return isExpressionName(decorator.expression, name)
}
function getRouteClassName(cls: ts.ClassDeclaration) {
    const decorator = getDecoratorByName(cls, "route")
    if (!decorator) return undefined
    const decoratorExpression = decorator.expression
    if (!ts.isCallExpression(decoratorExpression)) return undefined
    const firstParam = getFirstParameter(decoratorExpression)
    if (firstParam !== undefined) return firstParam
    return cls.name !== undefined ? cls.name.getText() : undefined
}

function hasDecorator(cls: ts.ClassDeclaration | ts.MethodDeclaration, name: string) {
    if (!cls.modifiers) return false
    return cls.modifiers.some(m => { 
        return ts.isDecorator(m) && isExpressionName(m.expression, name)
    })
}
function getRouteClasses(sourceFile: ts.SourceFile) {
    const classes = ts.forEachChild(sourceFile, () => undefined, (nodes) => {
        return nodes.filter(n => ts.isClassDeclaration(n) && hasDecorator(n, "route"))
    })??[] 
    return classes as ts.ClassDeclaration[]
}
export async function discoverTsFiles(dir: string, _blacklist: readonly string[] = []) {
    const blacklist = ['node_modules', ..._blacklist]
    const files = await fs.readdir(dir)
    const tsFiles = files
        .filter(file => path.extname(file) === '.ts' && !blacklist.some(blacklistItem => file.includes(blacklistItem)))
        .map(file => path.join(dir, file))
    const extra = await Promise.all(files.map(async (file): Promise<string[]> => {
        if (blacklist.includes(file)) return []
        const filePath = path.join(dir, file)
        const isDir = await fs.lstat(filePath).then(stat => stat.isDirectory())
        if (isDir) {
            return (await discoverTsFiles(filePath)) as string[]
        }
        return []
    }))
    return tsFiles.concat(extra.flat())
}

export function discoverTsFilesSync(dir: string, _blacklist: readonly string[] = []) {
    const blacklist = ['node_modules', ..._blacklist]
    const files = readdirSync(dir)
    
    const tsFiles = files
        .filter(file => path.extname(file) === '.ts' && !blacklist.some(blacklistItem => file.includes(blacklistItem)))
        .map(file => path.join(dir, file))
    const extra = files.map( (file): string[] => {
        if (blacklist.includes(file)) return []
        const filePath = path.join(dir, file)
        const isDir =  lstatSync(filePath).isDirectory()
        if (isDir) {
            return  discoverTsFilesSync(filePath) as string[]
        }
        return []
    })
    return tsFiles.concat(extra.flat())
}

export function discoverControllers(files: string[]) {
    const exportedThings = files.flatMap(file => {
        try {
            // eslint-disable-next-line
            const module = require(file);
            return Object.keys(module).map((name) => ({thing: module[name], file}))
        } catch(err) {
            console.log(err)
            return undefined
        }
    }).filter(m => m !== undefined);
    // exportedThings.forEach(({thing, file}) => {
    //     console.log({thing})
    // })
    const controllers = exportedThings.filter(({thing}) => thing  && isFunction(thing) && isRouter(thing)).map(({thing, file}) => ({controller: thing as ClassType, file}))
    return controllers;
}

export function generateTypeAlias(name: string, typeElements: ts.TypeElement[]) {
    return ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(name),
        undefined,
        ts.factory.createTypeLiteralNode(typeElements)
    )
}


export function generateImports() {
    const {factory} = ts
    return factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports([
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier("BuildProcedure")
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier("ProcedureParams")
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier("CreateRouterInner")
            ),
            factory.createImportSpecifier(
              false,
              undefined,
              factory.createIdentifier("AnyRootConfig")
            )
          ])
        ),
        factory.createStringLiteral("@trpc/server"),
        undefined
      )
}


function getParameterDecorator(method: ts.MethodDeclaration, decoratorName: string) {
    const parameter = method.parameters.find(p => 
        p.modifiers && p.modifiers?.length > 0 && 
        ts.isDecorator(p.modifiers[0]) && 
        ts.isCallExpression(p.modifiers[0].expression) && 
        isExpressionName(p.modifiers[0].expression, decoratorName) ) 
    if (!parameter) return undefined
    if (parameter.modifiers === undefined) return undefined
    return parameter.modifiers[0] as ts.Decorator
}

function isExpressionName(expression: ts.Expression | ts.Identifier | undefined, name: string) {
    if (expression === undefined) return false
    if (ts.isIdentifier(expression) && expression.escapedText === name) return true
    if (ts.isPropertyAccessExpression(expression)) {
        return expression.name.escapedText === name
    }
    if (ts.isCallExpression(expression)) {
        return isExpressionName(expression.expression, name)
    }
    return false
}

function getDecoratorByName(method: ts.MethodDeclaration | ts.ClassDeclaration, name: string) {
    if (method.modifiers === undefined) return undefined
    return method.modifiers.find(m => ts.isDecorator(m) && ts.isCallExpression(m.expression) && 
    isExpressionName(m.expression.expression, name)) as ts.Decorator || undefined
}

function createBuildProcedureTypeNode(methodType: string, inputType: ts.TypeNode, returnType: ts.TypeNode) {
    const typeNode = ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("BuildProcedure"),
        [
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(methodType)),
            createProcedureParamsTypeNode(inputType),
            returnType
        ]
    )
    return typeNode
}

function createProcedureParamsTypeNode(inputType: ts.TypeNode) {
    return ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("ProcedureParams"),
        [
            ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier("AnyRootConfig"),
                undefined
            ),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            inputType,
            inputType,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ]
    )
}

function getFirstParameter(callExpression: ts.CallExpression) {
    if (callExpression.arguments.length === 0) return undefined
    return callExpression.arguments[0].getText()
}

