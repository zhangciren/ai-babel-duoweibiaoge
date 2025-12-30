import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import path from 'node:path';
import fs from 'node:fs';
import ArrowFunctionPlugin from './plugins/ArrowFunctionPlugin.js';
import * as babelCore from "@babel/core";

const sourceCode = path.resolve(import.meta.dirname, "src/index.js");
const dist = path.resolve(import.meta.dirname, "dist/myindex.js");

// const code = `
//   const a = 1;
//   console.log(a);
// `
const code = fs.readFileSync(sourceCode, "utf-8");

// 1. 生成语法树
const ast = parser.parse(code, {
  sourceType: "module", // 根据你的源码类型选择（module/script）
  plugins: [], // 解析器插件：如需要解析 JSX 则写 ["jsx"]，这里为空
});
console.log("ast =====", ast);

// 加工语法树
// 树的加工：也就是二叉树的遍历，前中后序遍历
// 1. 访问者模式
const visitor = {
    VariableDeclaration(path) {
        console.log("path.node ======", path.node);
        if (path.node.kind === "const") {
            path.node.kind = "let";
        }
    }
}
traverse.default(ast, visitor);

// 代码生成
const res = generator.default(ast, {}, code);
console.log("res =====", res);

const { code: transformedCode } = babelCore.transformFromAstSync(ast, res.code, {
  plugins: [ArrowFunctionPlugin], // 这里才是加载转换插件的正确位置
});

// 写入文件
fs.writeFileSync(dist, transformedCode);