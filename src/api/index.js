import { GET, POST } from '@utils/fetch';

export const getData = (params) => GET('/getData', params)

export const postData = (params) => POST('/postData', params)
