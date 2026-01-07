

export default function parse(template) {

    const reg1 = /^\<([a-z1-6]+)\>/
    const reg2 = /^\<\/([a-z1-6]+)\>/
    //好的,明白了。为了让 const worldReg = /^(.*)\<\/([a-z1-6]+)\>/ 能够正确匹配到 HelloWorld 而不是因为贪婪匹配而出错,我们需要将其修改为非贪婪模式。
    // const worldReg = /^(.*?)\<\/([a-z1-6]+)\>/
    const worldReg =/^([^<]+)/ 
    const stack1 = []
    const stack2 = []
                // 去除首尾空格
    let current = 0
    const outputAst = {}
   //需要做到将template字符串中的一部分一部分标签解析出来
   //字符串肯定是一步一步向后走的，不可能一下子就把所有标签都解析出来，并且不可能一下解析到后面的闭合标签
    while (current < template.length) {
        //左标签  -trim会影响索引
        let res = template.slice(current);
        if(reg1.test(res)) {
            const tag = reg1.exec(res)[1];
            current = current + tag.length + 2
            stack1.push(tag)
            // outputAst[tag] = {}
            stack2.push([])
          
        }
        //右标签
        else if(reg2.test(res)) {
            const tag = reg2.exec(res)[1];
            current = current + tag.length + 3
            console.log(tag)
            //tag必然是和stack1最后一个标签匹配的
            if(tag === stack1[stack1.length - 1]) {
                stack1.pop()
                const children = stack2.pop()
            }
        }
        else if(worldReg.test(res)) {
        //文本节点
            // console.log(1)
            const world = worldReg.exec(res)[1];
            current+= world.length
            // console.log(world)
            stack2[0].push({text:world,type:'3'})
            //切断引用，保证打印的是那一刻的值而不是引用。
             console.log(JSON.parse(JSON.stringify(stack2)))
        }
        else {
            // console.log(current)
            current++
        }
}   
console.log(outputAst)
}

// 你遇到的情况是浏览器控制台的一个常见特性，并不是你的代码逻辑有误。

// 原因解释:

// console.log 是异步的: 当你执行 console.log(stack2) 时，浏览器控制台会先显示一个数组的快照或引用，比如 [Array(1), Array(1)]。这表示在打印的那一刻，stack2 里面确实有两个数组，每个数组里也确实有1个元素。

// 稍后求值 (Lazy Evaluation): 你看到的 length: 0 是在你点击展开箭头时，控制台才去读取数组当前的内容。

// 代码继续执行: 在你点击展开之前，你的 while 循环已经继续执行了。它很快就遇到了闭合标签 </h1>，并执行了以下代码