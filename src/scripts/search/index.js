
import wepy from 'wepy'
import api from '../api.js'
import querystring from 'querystring'
export default class Index extends wepy.page {
    config = {
        navigationBarTitleText: '搜索'
    }
    data = {
        toCurrentTab: '0',
        searchDate: '',
        regionLevel: 0,
        regionId: [],
        regionManager: 0,
        operaType: 6,
        page: 1,
        empty: true,
        schoolList: []
    }
    methods = {
        searchValueInput(e) {
            var value = e.detail.value
            if (value !== '') {
                this.search(value)
            }
        },
        chooseSchool(e) {
            let page_url = this.page_url;
            wepy.redirectTo({
                url: `${page_url + (page_url.indexOf('?') === -1 ? '?' : '&' ) + querystring.stringify(e.target.dataset)}`
            });
        }
    }
    async onLoad(e) {
        console.log(e);
        let {page_url = '', ...params} = e;
        page_url = unescape(page_url)
        this.page_url = page_url + (page_url.indexOf('?') === -1 ? '?' : '&') + querystring.stringify(params)
    }
    async search(e) {
        console.log('搜索设置搜索设置')
        let result = await api.searchSchool({
            method: 'POST',
            data: {
                userId: wepy.getStorageSync('userId'),
                keywords: e,
                operaType: 6
            }
        })
        if (result.data.result === 200) {
            if (result.data.schoolList.length > 0) {
                this.empty = false
                if (result.data.schoolList.length > 5) {
                    this.schoolList = result.data.schoolList.slice(0, 5)
                } else {
                    this.schoolList = result.data.schoolList
                }
            } else {
                this.empty = true
            }
            this.$apply()
        }
    }
}
