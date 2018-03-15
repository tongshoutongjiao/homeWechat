function vailNum(value) {
  let flag = false;
  let myreg = /^[0-9]*$/;
  if (!myreg.test(value)) {
    flag = flag;
  }else{
    flag = true;
  }
  return flag;
}
function vailChinese(value) {
  let flag = false;
  let myreg = /^([\u4e00-\u9fa5]){1,7}$/;
  if (!myreg.test(value)) {
    flag = flag;
  }else{
    flag = true;
  }
  return flag;
}
function getBeforDay() {
  var keep = '';
  var date = new Date();
  var preDate = new Date(date.getTime() - 24*60*60*1000); //前一天
  var y = preDate.getFullYear();
  var m = preDate.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = preDate.getDate() < 10 ? '0' + preDate.getDate() : preDate.getDate();
  var h = preDate.getHours() < 10 ? '0' + preDate.getHours() : preDate.getHours();
  var f = preDate.getMinutes() < 10 ? '0' + preDate.getMinutes() : preDate.getMinutes();
  var s = preDate.getSeconds() < 10 ? '0' + preDate.getSeconds() : preDate.getSeconds();
  var rand = Math.round(Math.random() * 899 + 100);
  // keep = y + '-' + m + '-' + d + '' + h + '' + f + '' + s;
  keep = y + '-' + m + '-' + d
  return keep; //20160614134947
}
function getCurrentTime() {
  var keep = '';
  var date = new Date();
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var f = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  var rand = Math.round(Math.random() * 899 + 100);
  // keep = y + '-' + m + '-' + d + '' + h + '' + f + '' + s;
  keep = y + '-' + m + '-' + d
  return keep; //20160614134947
}
function getCurrentMonth() {
  var keep = '';
  var date = new Date();
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var f = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  var rand = Math.round(Math.random() * 899 + 100);
  // keep = y + '-' + m + '-' + d + '' + h + '' + f + '' + s;
  keep = y + '-' + m
  return keep; //20160614134947
}
module.exports = {
  getCurrentTime: getCurrentTime,
  vailChinese: vailChinese,
  vailNum: vailNum,
  getBeforDay: getBeforDay,
  getCurrentMonth: getCurrentMonth
}
