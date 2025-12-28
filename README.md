# 操作记录
- 实现1: 通过babel对src/index.js文件进行编译，生成dist/index.js文件（执行npm run build即可）
- 实现2: 通过@babel/plugin-transform-arrow-functions插件，将src/index.js文件中的箭头函数，转换成普通函数。
- 实现3:



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