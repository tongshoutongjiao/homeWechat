import { CHANGEINFO} from '../types/counter'
import { createAction } from 'redux-actions'

export const changeInfo = createAction(CHANGEINFO, () => {
  return new Promise(resolve => {

    setTimeout(() => {
      resolve(1)
    }, 1000)
  })
});








