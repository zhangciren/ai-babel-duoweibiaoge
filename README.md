# 操作记录
- 实现1: 通过babel对src/index.js文件进行编译，生成dist/index.js文件（执行npm run build即可）
- 实现2: 通过@babel/plugin-transform-arrow-functions插件，将src/index.js文件中的箭头函数，转换成普通函数。
- 实现3: 通过@babel/preset-env预设，将src/index.js文件中箭头函数转为普通函数 + const转为let (es6+的语法，转换成es5的语法)
- 实现4: 手动实现一个简单的babel，完整整个编译的过程，从代码输入，到转化，到输出完整的流程（包括词法分析、语法分析、语义分析、代码生成）。到这里核心的babel流程就已经掌握了
    - 步骤：安装@babel/parser（解析）、@babel/traverse（转换）、@babel/generator（生成）这三个包
    - 实现：在compile.js文件中，引入这三个包，实现从代码输入，到转化，到输出完整的流程。
    - 执行命令：npm run mybuild，即可在dist/myindex.js文件中看到编译后的代码。
- 实现5: 手动实现一个简单的babel插件，将src/index.js文件中的箭头函数，转换成普通函数。
    - 实现：在plugins/ArrowFunctionPlugin.js文件中，实现一个简单的babel插件，将箭头函数转换成普通函数。
    - 在compile.js文件中，引入ArrowFunctionPlugin插件，将箭头函数转换成普通函数。
    - 执行命令：npm run mybuild，即可在dist/myindex.js文件中看到编译后的代码。
- 实现6: 类飞书多维表格编译器实战
    - 原理介绍：
        - 例如，需要实现sum(1+1)
        - 首先，拆。s、u、m、(、1、+、1、)
        - 1. 这个拆的过程，就是词法分析。上面的例如s、u、m、(、1、+、1、)，就是把代码拆分（词法分析）成一个一个的token（词法单元）。做词法分析的工具我们称之为tokenizer（词法分析器）。
        - 2. 转换为标准的ast（或者叫dsl）：这个过程我们称之为parser(转换)
        - 3. 代码生成(generator)  或者  代码执行(interpreter)——————我们现在这个实战场景，是用的代码执行（interpreter）。



# babel进阶与前端AI编译器
## babel基础与进阶
- babel的应用场景有哪些？
    - 代码降级（把高版本的js代码，转换成低版本的js）
    - polyfill（有些特性在特定浏览器不支持，需要通过babel把这些补丁打上）
    - 多端编译（比如说Taro  uniapp，Taro一直以来就是借助babel来实现多端编译的）
- 但是到了现在，越来越多的像es build等基于rust的编译工具，也在逐渐的取代babel，因为基于rust的编译工具，编译速度要快很多，同时也占用的内存要少很多。所以babel已经很少应用了。但是babel依然是最经典的编译器，值得我们学习和研究。
- babel插件化体系
    - babel插件的作用：在babel编译的过程中，通过插件来实现一些特定的功能。
    - 本仓库使用了1个编译插件（现成的）：
        - 插件1：将箭头函数转换成普通函数
    - 预设(preset):
        - 预设是一组插件的集合，预设的作用是将一些常用的插件，组合在一起，形成一个完整的编译流程。
    - @babel/preset-env（就是一个预设包）: 它内置了所有 ES6+ 语法转译插件，并能根据环境自动启用 / 禁用插件，是前端项目兼容低版本环境的标配。