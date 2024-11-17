import { GET, POST } from '@utils/fetchSuper';

export const getDataV2 = (params) => GET('/getData', params)

export const postDataV2 = (params) => POST('/postData', params)
