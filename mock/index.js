export default [
  {
    url: '/api/getData',
    method: 'GET',
    response: () => ({
      code: 200,
      data: '12312312'
    })
  },
  {
    url: '/api/postData',
    method: 'post',
    response: () => ({
      code: 200,
      data: '12312312'
    })
  }
]
