<template>
	<uni-popup ref="popup" type="center">
		<view class="popup-content">
			<view class="popup-title">{{ currentItem.name }}</view>
			
			<view class="detail-item" @click="copyToClipboard(currentItem.username, '用户名')">
				<text class="detail-label">用户名：</text>
				<text class="detail-value">{{ currentItem.username }}</text>
				<uni-icons type="copy" size="16" color="#007aff"></uni-icons>
			</view>
			
			<view class="detail-item" @click="copyToClipboard(currentItem.password, '密码')">
				<text class="detail-label">密码：</text>
				<text class="detail-value">{{ currentItem.password }}</text>
				<uni-icons type="copy" size="16" color="#007aff"></uni-icons>
			</view>
			
			<view v-if="currentItem.website" class="detail-item" @click="copyToClipboard(currentItem.website, '网址')">
				<text class="detail-label">网址：</text>
				<text class="detail-value">{{ currentItem.website }}</text>
				<uni-icons type="copy" size="16" color="#007aff"></uni-icons>
			</view>
			
			<view v-if="currentItem.email" class="detail-item" @click="copyToClipboard(currentItem.email, '邮箱')">
				<text class="detail-label">邮箱：</text>
				<text class="detail-value">{{ currentItem.email }}</text>
				<uni-icons type="copy" size="16" color="#007aff"></uni-icons>
			</view>
			
			<view v-if="currentItem.remark" class="detail-item">
				<text class="detail-label">备注：</text>
				<text class="detail-value">{{ currentItem.remark }}</text>
			</view>
			
			<view class="popup-buttons">
				<button class="btn-cancel" @click="handleClose">关闭</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'DetailModal',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		currentItem: {
			type: Object,
			default: () => ({})
		}
	},
	emits: ['close'],
	watch: {
		visible(val) {
			if (val) {
				this.$refs.popup.open();
			} else {
				this.$refs.popup.close();
			}
		}
	},
	methods: {
		handleClose() {
			this.$emit('close');
		},
		copyToClipboard(text, type) {
			uni.setClipboardData({
				data: text,
				success: () => {
					uni.showToast({
						title: `${type}已复制`,
						icon: 'success'
					});
				}
			});
		}
	}
}
</script>

<style scoped>
.popup-content {
	width: 320px;
	background-color: white;
	border-radius: 10px;
	padding: 20px;
}

.popup-title {
	font-size: 18px;
	font-weight: bold;
	text-align: center;
	margin-bottom: 20px;
	color: #333;
}

.popup-buttons {
	display: flex;
	justify-content: space-between;
	margin-top: 20px;
}

.btn-cancel {
	flex: 1;
	height: 40px;
	background-color: #f5f5f5;
	color: #666;
	border: none;
	border-radius: 5px;
	margin-right: 10px;
}

.detail-item {
	display: flex;
	align-items: center;
	padding: 12px 0;
	border-bottom: 1px solid #f0f0f0;
	cursor: pointer;
}

.detail-item:last-child {
	border-bottom: none;
}

.detail-label {
	width: 60px;
	color: #666;
	font-size: 14px;
}

.detail-value {
	flex: 1;
	color: #333;
	font-size: 14px;
	margin-right: 10px;
	word-break: break-all;
}
</style>