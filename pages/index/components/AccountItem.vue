<template>
	<view class="account-item" :style="{ borderLeftColor: borderColor }">
		<view class="account-content" @click="$emit('detail', account)">
			<view class="account-title">{{ account.username }}{{ account.remark ? '（' + account.remark + '）' : '' }}</view>
			<view class="account-subtitle">点击查看详情</view>
		</view>
		<view class="item-right">
			<view class="action-buttons">
				<view class="action-btn" @click="$emit('edit', account)">
					<uni-icons type="compose" size="14" color="#007aff"></uni-icons>
				</view>
				<view class="action-btn" @click="$emit('delete', account)">
					<uni-icons type="trash" size="14" color="#dd524d"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'AccountItem',
	props: {
		account: {
			type: Object,
			required: true
		},
		index: {
			type: Number,
			default: 0
		}
	},
	computed: {
		borderColor() {
			const colors = [
				'#e0e8f6',
				'#B4D4E8',
				'#C8E8B4',
				'#E8D4B4',
				'#D4B4E8',
				'#B4E8D4',
				'#E8C4B4',
				'#C4B4E8',
				'#B4E8C4',
				'#E8B4D4' 
			];
			return colors[this.index % colors.length];
		}
	},
	emits: ['detail', 'edit', 'delete']
}
</script>

<style scoped>
.account-item {
	display: flex;
	align-items: center;
	padding: 12px 15px;
	background-color: #f8f9fa;
	border-radius: 6px;
	margin-bottom: 5px;
	border-left: 3px solid;
}

.account-content {
	flex: 1;
}

.account-title {
	font-size: 15px;
	color: #333;
	margin-bottom: 3px;
}

.account-subtitle {
	font-size: 12px;
	color: #999;
}

.item-right {
	display: flex;
	align-items: center;
}

.action-buttons {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-right: 8px;
}

.action-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: 6px;
	background-color: #f8f9fa;
	border: 1px solid #e9ecef;
	transition: all 0.2s ease;
}

.action-btn:active {
	background-color: #e9ecef;
	transform: scale(0.95);
}
</style>