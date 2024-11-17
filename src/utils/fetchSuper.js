import axios, { Axios } from 'axios';

const service = axios.create({
  baseURL: '/api',
  // validateStatus: (status) => status <= 500, // 拦截状态码大于或等于500
  headers: {
    common: { Accept: 'application/json; charset=UTF-8' },
    patch: { 'Content-Type': 'application/json; charset=UTF-8' },
    post: { 'Content-Type': 'application/json; charset=UTF-8' },
    put: { 'Content-Type': 'application/json; charset=UTF-8' }
  },
  transformRequest: (data) => JSON.stringify(data),
  timeout: 30000, // 请求超时时间
  isRepeatRequest: true, // 是否开启重复请求拦截
})
const pending = {}
const CancelToken = axios.CancelToken

const paramsList = ['get', 'delete', 'patch']
const dataList = ['post', 'put']
const isTypeList = (method) => {
  method = (method || '').toLowerCase()
  if (paramsList.includes(method)) {
    return 'params'
  } else if (dataList.includes(method)) {
    return 'data'
  }
}
// 用来判断取消请求的标识
const REPEAT_REQUEST_TEXT = 'repeatRequest'

/**
 * 包装实际请求动作
 * @param {Axios.config} config - 最终合并后的参数
 * @param {string} requestId - 请求的唯一值
 * @param {Promise.resolve} resolve
 * @param {Promise.reject} reject
 */
const defaultAdapterRequest = (config, requestId, resolve, reject) => {
  service(config)
    .then((response) => {
      // 请求成功时，删除缓存，并返回到最上层
      delete pending[requestId]
      resolve && resolve(response)
    })
    .catch((error) => {
      if (!(axios.isCancel(error) && error.message === REPEAT_REQUEST_TEXT)) {
        delete pending[requestId]
        reject && reject(error)
      }
    })
}

/**
 * 包装请求方法
 * @param {Axios.config} config
 * @returns
 */
const packService = (config) => {
  // 这里为什么不用 webpack.merge 进行深度合并，是因为太消耗性能且一般用不上，普通合并即可
  const mergeConfig = Object.assign({}, service.defaults, config)
  const requestId = getRequestIdentify(mergeConfig)
  mergeConfig.requestId = requestId
  if (!mergeConfig.cancelToken) {
    const source = CancelToken.source()
    source.token.cancel = source.cancel
    mergeConfig.cancelToken = source.token
  }

  // 上传文件或者主动不要重复，则直接请求
  if (
    !mergeConfig.isRepeatRequest ||
    mergeConfig.headers?.['Content-Type'] === 'multipart/form-data;charset=UTF-8'
  ) {
    return service(mergeConfig)
  }

  // 关键就在这里，如果第一次进来
  if (!pending[requestId]) {
    pending[requestId] = {}
    // 包装多一层Promise，并往缓存存入 cancelToken、resolve、reject、promiseFn
    const promiseFn = new Promise((resolve, reject) => {
      pending[requestId] = {
        cancelToken: mergeConfig.cancelToken,
        resolve,
        reject
      }
      defaultAdapterRequest(mergeConfig, requestId, resolve, reject)
    })
    pending[requestId].promiseFn = promiseFn
    return promiseFn
  }

  // 非第一次进来，则直接取消上一次的请求，并且替换缓存的cancelToken为当前的，否则下一次进来不能正确取消一次的请求
  const { cancelToken, resolve, reject, promiseFn } = pending[requestId]
  cancelToken.cancel(REPEAT_REQUEST_TEXT)
  pending[requestId].cancelToken = mergeConfig.cancelToken
  defaultAdapterRequest(mergeConfig, requestId, resolve, reject)
  return promiseFn
}

/**
 * 获取请求的key
 * @param {object} config
 * @param {boolean} isSplice - 是否拼接请求头，请求前需要拼接，请求后不需要拼接
 * @returns
 */
const getRequestIdentify = (config, isSplice = false) => {
  let url = config.url
  if (isSplice) {
    url = config.baseURL + config.url
  }
  const params = { ...(config[isTypeList(config.method)] || {}) }
  delete params.t
  return encodeURIComponent(url + JSON.stringify(params))
}

/**
 * 取消重复
 * @param {string} key - 请求唯一url
 * @param {boolean} isRequest - 是否执行取消请求
 */
const removePending = (key, isRequest = false) => {
  if (pending[key] && isRequest) {
    pending[key].cancel('取消重复请求')
  }
  delete pending[key]
}


service.interceptors.request.use((config) => {
  const requestId = getRequestIdentify(config, true)
  config.requestId = requestId

  // 根据配置是否移除重复请求
  config.isRepeatRequest && removePending(requestId, true)

  if (!config.cancelToken) {
    const source = CancelToken.source()
    source.token.cancel = source.cancel
    config.cancelToken = source.token
  }
  // 缓存该请求的取消重复的方法
  pending[requestId] = config.cancelToken



  return config
})

service.interceptors.response.use((response) => {
  // 请求完成，移除缓存
  response.config.isRepeatRequest && removePending(response.config.requestId, false)

  return response.data
}, (error) => {
  if (axios.isCancel(error)) return Promise.reject(error)

  // 请求完成，移除缓存
  error.config?.isRepeatRequest && removePending(response.config.requestId, false)

  return Promise.reject(error)
})

/**
 * get请求方法
 * @export axios
 * @param {string} url - 请求地址
 * @param {object} params - 请求参数
 * @param {object|undefined|Null} 其他参数
 * @returns
 */
export const GET = (url, params, other) => {
  params = params || {}
  params.t = Date.now()
  return packService({
    url: url,
    method: 'GET',
    params,
    ...(other || {})
  })
}

/**
 * post请求方法
 * @export axios
 * @param {string} url - 请求地址
 * @param {object} data - 请求参数
 * @param {object|undefined|Null} 其他参数
 * @returns
 */
export const POST = (url, data = {}, other) => {
  return packService({
    url,
    method: 'POST',
    params: { t: Date.now() },
    data,
    ...(other || {})
  })
}
