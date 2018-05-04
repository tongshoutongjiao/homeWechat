import wepy from 'wepy';
import util from './util';
import md5 from './md5';
import tip from './tip'

const API_SECRET_KEY = 'www.mall.cycle.com'
const TIMESTAMP = util.getCurrentTime()
const SIGN = md5.hex_md5((TIMESTAMP + API_SECRET_KEY).toLowerCase())

const wxRequest = async(params = {}, url) => {
    tip.loading();
    let data = params.query || {};
    data.sign = SIGN;
    data.time = TIMESTAMP;
    let res = await wepy.request({
        url: url,
        method: params.method || 'GET',
        data: data,
        header: { 'Content-Type': 'application/json' },
    });
    tip.loaded();
    return res;
};


module.exports = {
    wxRequest
}

export async function request(url = '', params = {}){
  const defaults = {
    data: '',
    header: {
      'content-type': 'application/json'
    },
    method: 'GET',
    dataType: 'json',
    responseType: 'text',
    success: e => console.log(`request ${url} success`, e),
    fail: e => console.warn(`request ${url} fail`, e),
    complete: e => console.log(`request ${url} complete`, e)
  }
  
  const res = await wx.request({
    url,
    ...defaults,
    ...params
  });
  console.log(res);
}