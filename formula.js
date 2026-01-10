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
        if (/\\d/.test(char)) {
            let number = "";
            while (/\\d/.test(char)) {
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