<h1 align="center">Rexie</h1>
<p align="center">轻量级 PixiJS 框架 | 类 React Hooks | 3KB 极简内核</p>
<a href="hhttps://github.com/wooloo26/rexie">
    <img width="600" alt="Warp Terminal product preview" src="https://raw.githubusercontent.com/wooloo26/rexie/refs/heads/main/docs/examples.gif">
</a>

## 快速开始

alpha

## 特性

### 开发体验

- **React Hooks** - `useState`, `useEffect`...`useTransition`, `useSyncExternalStore`
- **组件化开发** - 原生 JSX/TSX 支持，完善的类型提示系统
- **专注核心逻辑** - 专注核心逻辑，把烦人的套路绘图代码放进Rexie
- **Sync/Concurrent** - 每一次更新都能自选模式

### 轻如鸿毛

- **3KB 极简内核** - 没有重量级runtime和语法糖，不再选择困难
- **无冗余依赖** - 仅依赖 PixiJS 核心库
- **原生接口** - 直接暴露 PixiJS 原生 API
- **按需渲染**：多实例独立渲染，灵活挂载至任意容器节点，也可随时销毁

### 不只是pixijs

- **renderer无关** - 一百行搞定增删查改，极速适配
- **框架移植** - 用渲染和注销函数灵活嵌入任意其它框架
- **平台无关** - 修改renderer即可移植其它平台

## Hooks API

### 无差异/小差异

`useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useCallback`, `useRef`, `useMemo`, `useImperativeHandle`, `useSyncExternalStore`

### 差异

`useTransition`: `startTransition`任务完成后会在最近的一个UI渲染更新后更新`isPending`，如果没有渲染任务则立即更新。

## PIXI问题

### props的先后顺序

PixiJS的部分setter存在先后调用顺序的说法，props非正整数键会按照创建顺序遍历，参考 [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#description)

```ts
// 1. text先于width设置或放到构造函数的options里，正常生效
<text
    options={{
        text,
    }}
    width={width}
/>
<text
    text={text}
    width={width}
/>
<text
    options={{
        text,
        width,
    }}
/>
// 2. width先于text，text不会改变宽度
<text
    options={{
        width,
    }}
    text={text}
/>
<text
    width={width}
    text={text}
/>
<text
    width={width}
>{text}</text>
```
