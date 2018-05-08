
import wepy from 'wepy'
import api from '../api.js'
import Toast from 'wepy-com-toast'
export default class Index extends wepy.page {
    config = {
        navigationBarTitleText: '首页'
    }
    components = {
        toast: Toast
    }
    async onLoad() {
        let userId = wepy.getStorageSync('userId')
        let getTypeInfo = await api.getType({method: 'POST', data: {userId: userId}})
        wepy.setStorageSync('userType', getTypeInfo.data.userType);
    }
    async onShow(){

    }
    methods = {
        toPage(e) {
            let _page = e.currentTarget.dataset.page
            if (_page === '') {
                this.$invoke('toast', 'show', {
                    title: '敬请期待！'
                })
                return false
            }
            wepy.navigateTo({url: _page})
        }
    }
    async logOut(e) {
        console.log('daj')
        var _this = this
        let res = await wepy.showModal({
            content: '确定注销登录？'
        })
        if (res.confirm) {
            _this.sureLogOut()
        }
    }
    async sureLogOut() {
        let result = await api.logout({
            method: 'POST',
            data: {
                userId: wepy.getStorageSync('userId')
            }
        })
        if (result.data.result === 200) {
            wepy.removeStorageSync('token')
            wepy.removeStorageSync('userId')
            wepy.removeStorageSync('noticeTimeStamp')
            wepy.redirectTo({url: 'login'})
        } else {
            this.$invoke('toast', 'show', {
                title: result.data.message || result.data.msg
            })
        }
    }
}
