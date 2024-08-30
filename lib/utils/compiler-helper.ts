import * as ts from "typescript";

export function findNodeByName(source: ts.SourceFile, name: string, root: ts.Node, parent: ts.Node | undefined = undefined): ts.Node | undefined {
    try {
        if (ts.isIdentifier(root) && root.text === name) {
            return parent
        }
        return ts.forEachChild<ts.Node | undefined>(root, node => findNodeByName(source, name, node, root)) 
    } catch (err) {
        console.log(err)
    }
    return undefined
    
}


export function printAST(node: ts.Node | undefined, indent = "") {
    if (!node) return
    
    const name = ts.isIdentifier(node) ? node.text: "";
    console.log(`${indent}${ts.SyntaxKind[node.kind].toString()} - ${name}`)
    ts.forEachChild(node, child => printAST(child, indent + "  "))
}

export function getChildNodes(node: ts.Node) {
    const nodeList: ts.Node[] = []
    ts.forEachChild(node, (n) => {nodeList.push(n)})
    return ts.factory.createNodeArray(nodeList)
   
}