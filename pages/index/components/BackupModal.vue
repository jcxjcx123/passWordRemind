<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="popup-content">
			<view class="popup-title">数据备份与恢复</view>
			
			<view class="backup-section">
				<view class="section-title">数据导出</view>
				<view class="section-desc">将所有密码数据导出为加密后的数据<br/><span class="warning">*请自行保存好密码数据,备份数据丢失的话你就炸了</span></view>
				<button class="backup-btn" @click="$emit('export')">导出数据</button>
			</view>
			
			<view class="backup-section">
				<view class="section-title">数据导入</view>
				<view class="section-desc">从剪贴板恢复密码数据</view>
				<button class="backup-btn" @click="$emit('import')">导入剪贴板数据</button>
			</view>
			
			<view class="popup-buttons">
				<button class="btn-cancel" @click="handleClose">关闭</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'BackupModal',
	props: {
		visible: {
			type: Boolean,
			default: false
		}
	},
	emits: ['close', 'export', 'import'],
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

/* 备份恢复弹窗样式 */
.backup-section {
	margin-bottom: 20px;
	padding: 15px;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	background-color: #f9f9f9;
}

.warning{
	color: red;
}

.section-title {
	font-size: 16px;
	font-weight: bold;
	color: #333;
	margin-bottom: 8px;
}

.section-desc {
	font-size: 14px;
	color: #666;
	margin-bottom: 12px;
	line-height: 1.4;
}

.backup-btn {
	width: 100%;
	height: 40px;
	background-color: #007aff;
	color: white;
	border: none;
	border-radius: 5px;
	font-size: 14px;
}
</style>