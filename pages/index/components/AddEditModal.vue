<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="popup-content">
			<view class="popup-title">{{ editingItem ? '编辑密码' : '新增密码' }}</view>
			
			<uni-forms ref="form" :modelValue="formData" :rules="formRules">
				<uni-forms-item label-width="120" name="name" label="软件名称" required>
					<uni-easyinput 
					v-model="formData.name" 
					placeholder="请输入软件名称" 
					:maxlength="20" 
					:disabled="isFromGroupAdd || !!editingItem"
				></uni-easyinput>
				</uni-forms-item>
								
				<uni-forms-item name="remark" label="备注">
					<uni-easyinput 
						v-model="formData.remark" 
						placeholder="请输入备注（如：大号、小号等）" 
						:maxlength="30"
					></uni-easyinput>
				</uni-forms-item>
				
				<uni-forms-item name="username" label="用户名" required>
					<view class="username-input-container">
						<uni-easyinput 
							v-model="formData.username" 
							placeholder="请输入用户名" 
							:maxlength="50"
							class="username-input"
						></uni-easyinput>
						<view class="phone-icon" @click="fillPresetPhone" v-if="presetPhone && !formData.username">
							<uni-icons type="phone" size="18" color="#007aff"></uni-icons>
						</view>
						<view class="phone-icon disabled" @click="showPhoneNotSet" v-if="!presetPhone && formData.username">
							<uni-icons type="phone" size="18" color="#ccc"></uni-icons>
						</view>
					</view>
				</uni-forms-item>
				
				<uni-forms-item name="password" label="密码" required>
					<uni-easyinput 
						v-model="formData.password" 
						placeholder="请输入密码" 
						:maxlength="50"
					></uni-easyinput>
				</uni-forms-item>
				
				<uni-forms-item name="website" label="网址">
					<uni-easyinput 
						v-model="formData.website" 
						placeholder="请输入网址" 
						:maxlength="100"
					></uni-easyinput>
				</uni-forms-item>
				
				<uni-forms-item name="email" label="邮箱">
					<uni-easyinput 
						v-model="formData.email" 
						placeholder="请输入邮箱" 
						:maxlength="50"
					></uni-easyinput>
				</uni-forms-item>
			</uni-forms>
				
			<view class="popup-buttons">
				<button class="btn-cancel" @click="handleCancel">取消</button>
				<button class="btn-confirm" @click="handleSave">保存</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'AddEditModal',
	props: {
		visible: {
			type: Boolean,
			default: false
		},
		editingItem: {
			type: Object,
			default: null
		},
		isFromGroupAdd: {
			type: Boolean,
			default: false
		},
		initialData: {
			type: Object,
			default: () => ({})
		},
		presetPhone: {
			type: String,
			default: ''
		}
	},
	emits: ['close', 'save'],
	data() {
		return {
			formData: {
				name: '',
				username: '',
				password: '',
				website: '',
				email: '',
				remark: '',
				image: ''
			},
			formRules: {
				name: {
					rules: [{
						required: true,
						errorMessage: '请输入软件名称'
					}]
				},
				username: {
					rules: [{
						required: true,
						errorMessage: '请输入用户名'
					}]
				},
				password: {
					rules: [{
						required: true,
						errorMessage: '请输入密码'
					}]
				},
				remark: {
					rules: []
				}
			}
		}
	},
	watch: {
		visible(val) {
			if (val) {
				this.$refs.popup.open();
				this.initFormData();
			} else {
				this.$refs.popup.close();
			}
		},
		editingItem: {
			handler() {
				this.initFormData();
			},
			immediate: true
		},
		initialData: {
			handler() {
				this.initFormData();
			},
			deep: true
		}
	},
	methods: {
		initFormData() {
			if (this.editingItem) {
				this.formData = { ...this.editingItem };
			} else {
				this.formData = {
					name: '',
					username: '',
					password: '',
					website: '',
					email: '',
					remark: '',
					image: '',
					...this.initialData
				};
			}
		},
		handleCancel() {
			this.$emit('close');
		},
		handleSave() {
			this.$refs.form.validate().then(res => {
				this.$emit('save', { ...this.formData });
			}).catch(err => {
				console.log('表单验证失败：', err);
			});
		},
		
		fillPresetPhone() {
			if (this.presetPhone) {
				this.formData.username = this.presetPhone;
				uni.showToast({
					title: '已填入预设手机号',
					icon: 'success',
					duration: 1500
				});
			}
		},
		
		showPhoneNotSet() {
			uni.showToast({
				title: '未设置手机号',
				icon: 'none',
				duration: 2000
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
	z-index: 10001;
	position: relative;
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

.btn-confirm {
	flex: 1;
	height: 40px;
	background-color: #007aff;
	color: white;
	border: none;
	border-radius: 5px;
	margin-left: 10px;
}

/* 用户名输入框容器样式 */
.username-input-container {
	display: flex;
	align-items: center;
	position: relative;
}

.username-input {
	flex: 1;
}

.phone-icon {
	position: absolute;
	right: 10px;
	padding: 8px;
	border-radius: 4px;
	transition: background-color 0.2s;
	cursor: pointer;
}

.phone-icon:active {
	background-color: #f0f0f0;
}

.phone-icon.disabled {
	cursor: not-allowed;
}

.phone-icon.disabled:active {
	background-color: transparent;
}

/* 表单对齐样式 */
.uni-forms-item {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.uni-forms-item__label {
	width: 140rpx;
	flex-shrink: 0;
	margin-right: 20rpx;
	text-align: right;
	font-size: 28rpx;
	color: #333;
	position: relative;
}

/* 必填字段星号样式 */
.uni-forms-item[required] .uni-forms-item__label::after {
	content: '*';
	color: #ff0000;
	position: absolute;
	right: -5rpx;
	top: 0;
	font-size: 28rpx;
	font-weight: bold;
}

.uni-forms-item__content {
	flex: 1;
}

.uni-easyinput {
	width: 100%;
}

/* 表单验证错误信息样式 */
.uni-forms-item__error {
	font-size: 24rpx;
	color: #ff0000;
	margin-top: 8rpx;
	line-height: 1.4;
	word-break: break-all;
	z-index: 10002;
	position: relative;
	background-color: rgba(255, 255, 255, 0.95);
	padding: 4rpx 8rpx;
	border-radius: 4rpx;
}


::v-deep .uni-forms-item {
	margin-top: 20px;
}
</style>