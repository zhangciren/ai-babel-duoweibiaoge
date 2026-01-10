/**
 * Tokenizer: 将源码字符串拆解为 Token 数组
 * 输入: "Add(1, 2)"
 * 输出: [{type: 'function', value: 'Add'}, {type: '(', value: '('}, ...]
 */
function tokenize(expression) {
    const tokens = [];
    let current = 0;

    while (current < expression.length) {
        let char = expression[current];

        // 1. 处理数字 (支持多位整数)
        if (/\d/.test(char)) {
            let number = "";
            while (/\d/.test(char)) {
                number += char;
                char = expression[++current];
            }
            tokens.push({ type: "number", value: parseInt(number) });
            continue;
        }

        // 2. 处理标识符 (变量或函数名)
        // 难点: 如何区分 Variable 和 Function?
        // 策略: 看下一个非空字符是否为 '('
        if (/[a-zA-Z]/.test(char)) {
            let id = "";
            while (/[a-zA-Z]/.test(char)) {
                id += char;
                char = expression[++current];
            }

            // 预读处理: 跳过潜在空格
            // 注意: 这里仅移动指针检测, 不消耗 Token
            let tempCurrent = current;
            while (expression[tempCurrent] === " ") {
                tempCurrent++;
            }

            if (expression[tempCurrent] === "(") {
                tokens.push({ type: "function", value: id });
            } else {
                tokens.push({ type: "variable", value: id });
            }
            continue;
        }

        // 3. 处理符号 (括号、逗号、点号)
        if (char === "(" || char === ")" || char === ",") {
            tokens.push({ type: char, value: char });
            current++;
            continue;
        }

        // 4. 处理属性访问符 (Dot Notation)
        if (char === ".") {
            tokens.push({ type: "dot", value: "." });
            current++;
            continue;
        }

        // 5. 忽略空白字符
        if (char === " ") {
            current++;
            continue;
        }

        throw new TypeError("Unknown character: " + char);
    }

    return tokens;
}

function parse(tokens) {
    let current = 0;

    // 核心递归函数: 消费 Token 并返回一个 AST Node
    function walk() {
        let token = tokens[current];

        // Case 1: 数字字面量
        if (token.type === "number") {
            current++;
            return { type: "NumberLiteral", value: token.value };
        }

        // Case 2: 函数调用 (CallExpression)
        // 结构: 函数名 -> ( -> 参数1, 参数2... -> )
        if (token.type === "function") {
            current++; // 消费函数名

            const node = {
                type: "CallExpression",
                name: token.value,
                params: [],
            };

            token = tokens[++current]; // 跳过 '(', 准备解析参数

            // 循环解析参数，直到遇到 ')'
            // 这里体现了“递归”：参数本身可能是另一个函数调用 (walk())
            while (token.type !== ")") {
                node.params.push(walk()); // <--- 递归入口
                token = tokens[current];

                if (token.type === ",") {
                    current++; // 跳过逗号
                }
            }

            current++; // 消费闭合括号 ')'
            return node;
        }

        // Case 3: 变量与链式属性访问 (Member Access)
        // 支持: person.age
        if (token.type === "variable") {
            let value = token.value;
            current++;

            // 这是一个简单的 Lookahead, 如果后面跟着点号, 则拼接属性
            while (tokens[current] && tokens[current].type === "dot") {
                current++; // 消费 '.'
                if (tokens[current] && tokens[current].type === "variable") {
                    value += "." + tokens[current].value; // 拼接路径 'person.age'
                    current++;
                } else {
                    throw new TypeError('Expected variable after "."');
                }
            }

            return { type: "Variable", value };
        }

        throw new TypeError("Unknown token type: " + token.type);
    }

    // 根节点 Program
    const ast = {
        type: "Program",
        body: [],
    };

    while (current < tokens.length) {
        ast.body.push(walk());
    }

    return ast;
}

const addPlugin = {
    name: 'add',
};

const subtractPlugin = {
    name: 'subtract',
}

/**
 * Interpreter: 遍历 AST 并计算结果
 * @param {Object} ast - 抽象语法树
 * @param {Object} context - 运行时上下文数据（e.g., { person: { age: 2 } }）
 */
function interpret(ast, context = {}) {
    // 1. 算子白名单（Standard Library）
    // 只有在这里定义的函数才能被执行，天然屏蔽了 eval/window 等危险操作
    const operators = {
        Add: (a, b) => a + b,
        Subtract: (a, b) => a - b,
        Multiply: (a, b) => a * b,
        Divide: (a, b) => a / b,
    };

    function traverseNode(node) {
        // 终结符: 数字
        if (node.type === "NumberLiteral") {
            return node.value;
        }

        // 终结符: 变量
        // 解析 'person.age' 并从 context 中取值
        if (node.type === "Variable") {
            const keys = node.value.split(".");
            let value = context;

            // 逐层深入对象取值
            for (let key of keys) {
                if (!(key in value)) {
                    throw new TypeError("Unknown variable: " + key);
                }
                value = value[key];
            }
            return value;
        }

        // 非终结符: 函数调用
        if (node.type === "CallExpression") {
            // 递归计算所有参数的值
            const args = node.params.map(traverseNode);

            const func = operators[node.name];
            if (!func) {
                throw new TypeError("Unknown function: " + node.name);
            }

            // 执行函数
            return func(...args);
        }

        throw new TypeError("Unknown node type: " + node.type);
    }

    // 从 Program 的第一个语句开始执行
    return traverseNode(ast.body[0]);
}

function formulaInvoker(code, data) {
    // 1. 生成 token
    const tokens = tokenize(code);
    // 2. 代码转换生成 ast
    const ast = parse(tokens);
    // 3. 代码执行
    const res = interpret(ast, data);

    console.log(res);
}

formulaInvoker("Add(3, person.age)", {
    person: { age: 2 },
});