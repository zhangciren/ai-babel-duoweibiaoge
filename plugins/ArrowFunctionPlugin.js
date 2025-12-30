import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options) => {
  // 声明支持的 Babel 版本
  api.assertVersion(7);
  // 合理处理配置默认值
  const noNewArrows = api.assumption("noNewArrows") ?? !(options?.spec);

  return {
    name: "transform-arrow-function",
    visitor: {
      ArrowFunctionExpression(path) {
        // 安全校验：确保当前节点是箭头函数
        if (path.isArrowFunctionExpression()) {
          // 转换箭头函数为普通函数表达式
          path.arrowFunctionToExpression({
            insertArrow: false, // 正确参数名是 insertArrow（不是 arrowInsertArrow）
            noNewArrows,
          });
        }
      },
    },
  };
});