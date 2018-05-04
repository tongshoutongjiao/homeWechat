import moment from 'moment';
export function groupByFirstLetter(list, groupKey){
  const temp = {};
  if(Object.prototype.toString.call(list) !== "[object Array]"){
    list = []
  };
  
  if(typeof groupKey !== 'string'){
    return [];
  }

  list.forEach(item => {
    const lettersReg = /^[A-Z]$/g;
    let firstLetter = item[groupKey].substr(0, 1).toUpperCase();
    if(!lettersReg.test(firstLetter)){
      firstLetter = '#';
    }
    if(!temp[firstLetter]){
      temp[firstLetter] = [];
    }
    temp[firstLetter].push(item);
  });
  const indexs = Object.keys(temp).sort();
  if(indexs[0] === '#'){
    indexs.push(indexs.shift());
  }

  return indexs.map(key => ({label: key, list: temp[key]}));
}

export function fillNumber(number, format = 'd.00') {
  return String(number)
}

export function dateFormat(date, format = 'YYYY-MM-DD') {
  return moment(date).format(format)
 }


 export function numberFormat(num) {
  return (Number(num) || 0).toLocaleString();
 }


export function jsonToParam(json) {
  let param = [];
  for (let i in json) {
    param.push(i + '=' + (typeof json[i] === 'object' ? JSON.stringify(json[i]) : json[i]));
  }
  return param.join('&');
<<<<<<< Updated upstream
}
=======
}
>>>>>>> Stashed changes
