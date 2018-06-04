import wepy from 'wepy';
import querystring from 'querystring';
import LetterIndex from '../components/letter-index/letter-index';
import api from '../api';
import * as Toolkit from '../utils/toolkit';

export default class Index extends wepy.page {
	 components = {
	   'letter-index': LetterIndex
	 };

	config = {
		navigationBarTitleText: '选择学校'
	}

	data = {
		page_url: '',
		scrollTop: 0,
		schoolSets: [],
		letterIndexs: []
	}

	methods = {
		handleSearchSchool() {
			wx.navigateTo({
				url: `/pages/search?${querystring.stringify({page_url: this.page_url})}`,
			});
		},
		handleChooseSchool(e) {
			let page_url = this.page_url;
			wepy.navigateTo({
				url: `${page_url + (page_url.indexOf('?') === -1 ? '?' : '&') + querystring.stringify(e.currentTarget.dataset)}`
			});

		}
	}

	events = {
		'letter-index': (e, letter) => {
			if (letter === '#') {
				letter = '';
			}

			const query = wx.createSelectorQuery();
			query.select('.scroll-view').scrollOffset();
			query.select('.scroll-view').boundingClientRect();
			query.select(`#letter_${letter}`).boundingClientRect();
			query.exec(([scroll, rect, dom]) => {
				this.scrollTop = scroll.scrollTop - rect.top + dom.top;
				this.$apply();
			});
		}
	}

	async onLoad(e) {
		console.log('load..');
		let {title = '选择学校', page_url = '', ...params} = e;
		wx.setNavigationBarTitle({title: unescape(title)});
		page_url = unescape(page_url);
		this.page_url = page_url + (page_url.indexOf('?') === -1 ? '?' : '&') + querystring.stringify(params)
		const ret = await api.getSchoolsByUserId({data: {userId: wx.getStorageSync('userId')}});
		this.schoolSets = Toolkit.groupByFirstLetter(ret.data.data, 'schoolNameQp');
		this.$invoke('letter-index', 'set-indexs', this.schoolSets.map(s => s.label));
		this.$apply();

	}

	onReady() {
		console.log('ready..');

	}

	onShow() {
		console.log('show..');
	}
}