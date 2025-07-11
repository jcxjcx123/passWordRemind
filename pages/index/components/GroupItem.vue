<template>
	<view class="group-container">
		<!-- 软件主项 -->
		<view 
			class="group-item" 
			:class="{
				'pinned-item': group.isPinned
			}"
			@longpress="handleLongPress"
			@click="handleClick"
		>
			<view class="item-left" @click="!isSwapMode && $emit('toggle', group.name)">
                <view class="item-icon-default" :class="{ 'pinned-icon': group.isPinned }">{{ group.name.charAt(0) }}</view>
            </view>
            <view class="item-content" @click="!isSwapMode && $emit('toggle', group.name)">
                <view class="item-title">{{ group.name }}</view>
                <view class="item-subtitle">{{ group.accounts.length }} 个账号</view>
            </view>
			<view class="item-right">
				<view class="action-buttons">
					<!-- 置顶按钮 -->
					<view class="action-btn pin-btn" @click="$emit('toggle-pin', group.name)">
						<uni-icons 
							:type="group.isPinned ? 'star-filled' : 'star'" 
							size="16" 
							:color="group.isPinned ? '#ff9500' : '#c0c4cc'"
						></uni-icons>
					</view>
					<!-- 添加账号按钮 -->
					<view class="action-btn" @click="$emit('add-account', group)">
						<uni-icons type="plus" size="16" color="#007aff"></uni-icons>
					</view>
				</view>
				<view class="expand-icon" @click="!isSwapMode && $emit('toggle', group.name)">
				<uni-icons 
					:type="group.expanded ? 'down' : 'right'" 
					size="16" 
					color="#c0c4cc"
					:class="{'rotate-icon': group.expanded}"
				></uni-icons>
			</view>
			</view>
		</view>
		
		<!-- 账号子项列表 -->
		<view v-if="group.expanded" class="accounts-container">
			<AccountItem 
				v-for="(account, index) in group.accounts" 
				:key="account.id" 
				:account="account"
				:index="index"
				@detail="$emit('account-detail', $event)"
				@edit="$emit('account-edit', $event)"
				@delete="$emit('account-delete', $event, group.name)"
			/>
		</view>
	</view>
</template>

<script>
import AccountItem from './AccountItem.vue'

export default {
	name: 'GroupItem',
	components: {
		AccountItem
	},
	props: {
		group: {
			type: Object,
			required: true
		},
		index: {
			type: Number,
			default: 0
		},
		isSwapMode: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			// 移除了所有拖动相关的数据
		}
	},
	emits: ['toggle', 'add-account', 'account-detail', 'account-edit', 'account-delete', 'toggle-pin', 'long-press', 'swap-click'],
	methods: {
		// 处理长按事件
		handleLongPress() {
			this.$emit('long-press', this.index, this.group.name);
		},
		
		// 处理点击事件（用于交换模式）
		handleClick(e) {
			// 在交换模式下才处理交换点击事件
			if (this.isSwapMode) {
				// 阻止事件冒泡，避免触发其他点击事件
				e.stopPropagation();
				this.$emit('swap-click', this.index, this.group.name);
			}
		}
	}
}
</script>

<style scoped>
.group-container {
	margin-bottom: 20px;
}

.group-item {
	display: flex;
	align-items: center;
	padding: 15px;
	background-color: white;
	border-radius: 8px;
	margin-bottom: 2px;
	transition: all 0.3s ease;
}

/* 置顶分组样式 */
.pinned-item {
	background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
	border: 1px solid #ffcc80;
	box-shadow: 0 2px 8px rgba(255, 152, 0, 0.15);
}



.item-left {
	margin-right: 15px;
}

.item-icon-default {
	width: 40px;
	height: 40px;
	border-radius: 20px;
	background-color: #007aff;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	font-weight: bold;
	transition: all 0.3s ease;
}

/* 置顶分组图标样式 */
.pinned-icon {
	background: linear-gradient(135deg, #ff9500 0%, #ff6b00 100%);
	box-shadow: 0 2px 8px rgba(255, 149, 0, 0.3);
}

.item-content {
	flex: 1;
}

.item-title {
	font-size: 16px;
	font-weight: bold;
	color: #333;
	margin-bottom: 5px;
}

.item-subtitle {
	font-size: 14px;
	color: #666;
}

.item-right {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-left: 10px;
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

/* 置顶按钮特殊样式 */
.pin-btn {
	transition: all 0.2s ease;
}

.pin-btn:active {
	background-color: #fff3e0;
	border-color: #ffcc80;
}

.expand-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
}

.accounts-container {
	margin-left: 10px;
	margin-right: 10px;
	margin-top: 8px;
	overflow: hidden;
	background: none;
}

.rotate-icon {
	transition: transform 0.3s ease;
	transform: rotate(90deg);
}
</style>