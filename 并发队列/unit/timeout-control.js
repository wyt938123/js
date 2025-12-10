/**
 * 给异步任务添加超时控制
 * @param {Function} task 异步任务函数（需返回Promise）
 * @param {number} timeout 超时时间（毫秒）
 * @param {string} taskName 任务名称（便于日志排查）
 * @returns {Promise} 包装后的Promise（超时则reject）
 */
function withTimeout(task, timeout, taskName = '未知任务',url) {
  // 超时Promise：超时后抛出异常
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`[超时] ${taskName} 执行超过 ${timeout}ms，已终止`));
    }, timeout);
  });

  // 用Promise.race实现“任务执行”和“超时”二选一
  return Promise.race([
    task(url), // 执行原任务
    timeoutPromise // 超时监控
  ]);
}

export default withTimeout;