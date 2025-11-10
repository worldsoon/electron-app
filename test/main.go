package main

import (
    "syscall/js"
)

// 递归斐波那契函数
// WASM优化版（迭代）
func _fib(n int) int {
    if n < 2 { return n }
    a, b := 0, 1
    for i := 2; i <= n; i++ {
        a, b = b, a+b
    }
    return b
}

// 导出函数
func fib(this js.Value, args []js.Value) interface{} {
    return js.ValueOf(_fib(args[0].Int()))
}

func main() {
    c := make(chan struct{}, 0)
    js.Global().Set("fib", js.FuncOf(fib))
    <-c
}
