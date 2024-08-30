import fs from "node:fs/promises";
import { readdirSync, lstatSync } from "node:fs"
import path from "node:path";
import { isFunction, isRouter } from "./metadata";
import { ClassType } from "./types";

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
        } catch {
            return undefined
        }
    }).filter(m => m !== undefined);
    const controllers = exportedThings.filter(({thing}) => thing && isFunction(thing) && isRouter(thing)).map(({thing, file}) => ({controller: thing as ClassType, file}))
    return controllers;
}