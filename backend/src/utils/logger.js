function format(level, context, error, meta) {
  return JSON.stringify({
    level,
    context,
    ...meta,
    name: error?.name,
    status: error?.status,
    code: error?.code ?? error?.error?.error?.code,
    message: String(error?.message ?? '').trim().split('\n')[0].slice(0, 200),
  });
}

function logError(context, error, meta = {}) {
  console.error(format('error', context, error, meta));
}

function logWarn(context, error, meta = {}) {
  console.warn(format('warn', context, error, meta));
}

module.exports = { logError, logWarn };