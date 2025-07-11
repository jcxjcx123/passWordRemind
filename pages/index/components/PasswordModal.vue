<template>
	<uni-popup ref="popup" type="center" :mask-click="false">
		<view class="popup-content">
			<view class="popup-title">修改登录密码</view>
			
			<uni-forms ref="form" :modelValue="formData" :rules="formRules">
				<uni-forms-item label-width="100" name="oldPassword" label="当前密码" required>
					<uni-easyinput 
						v-model="formData.oldPassword" 
						type="password" 
						placeholder="请输入当前密码" 
						:maxlength="20"
					></uni-easyinput>
				</uni-forms-item>
				
				<uni-forms-item name="newPassword" label="新密码" required>
					<uni-easyinput 
						v-model="formData.newPassword" 
						type="password" 
						placeholder="请输入新密码" 
						:maxlength="20"
					></uni-easyinput>
				</uni-forms-item>
				
				<uni-forms-item label-width="100" name="confirmPassword" label="确认密码" required>
					<uni-easyinput 
						v-model="formData.confirmPassword" 
						type="password" 
						placeholder="请再次输入新密码" 
						:maxlength="20"
					></uni-easyinput>
				</uni-forms-item>
				
				<!-- 安全问题设置 -->
				<view class="security-section">
					<view class="security-title">安全问题设置（可选）</view>
					<uni-forms-item name="securityQuestion" label="安全问题">
						<uni-easyinput 
							v-model="formData.securityQuestion" 
							placeholder="请输入安全问题（用于找回密码）" 
							:maxlength="100"
						></uni-easyinput>
					</uni-forms-item>
					
					<uni-forms-item name="securityAnswer" label="安全答案" v-if="formData.securityQuestion">
						<uni-easyinput 
							v-model="formData.securityAnswer" 
							placeholder="请输入安全问题答案" 
							:maxlength="50"
						></uni-easyinput>
					</uni-forms-item>
				</view>
			</uni-forms>
			
			<view class="popup-buttons">
				<button class="btn-cancel" @click="handleCancel">取消</button>
				<button class="btn-confirm" @click="handleConfirm">确认</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'PasswordModal',
	props: {
		visible: {
			type: Boolean,
			default: false
		}
	},
	emits: ['close', 'confirm'],
	data() {
		return {
			formData: {
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
				securityQuestion: '',
				securityAnswer: ''
			},
			formRules: {
				oldPassword: {
					rules: [{
						required: true,
						errorMessage: '请输入当前密码'
					}]
				},
				newPassword: {
					rules: [{
						required: true,
						errorMessage: '请输入新密码'
					}, {
						minLength: 6,
						errorMessage: '密码长度不能少于6位'
					}]
				},
				confirmPassword: {
					rules: [{
						required: true,
						errorMessage: '请确认新密码'
					}, {
						validateFunction: (rule, value, data, callback) => {
							if (value !== data.newPassword) {
								callback('两次输入的密码不一致');
							}
							return true;
						}
					}]
				},
				securityAnswer: {
					rules: [{
						validateFunction: (rule, value, data, callback) => {
							if (data.securityQuestion && !value) {
								callback('请输入安全问题答案');
							}
							return true;
						}
					}]
				}
			}
		}
	},
	watch: {
			visible(val) {
				if (val) {
					this.loadSecuritySettings();
					this.$refs.popup.open();
				} else {
					this.$refs.popup.close();
					this.resetForm();
				}
			}
		},
	methods: {
		resetForm() {
			this.formData = {
				oldPassword: '',
				newPassword: '',
				confirmPassword: '',
				securityQuestion: '',
				securityAnswer: ''
			};
		},
		
		loadSecuritySettings() {
			const securityData = uni.getStorageSync('loginSecurityData');
			if (securityData) {
				this.formData.securityQuestion = securityData.securityQuestion || '';
				this.formData.securityAnswer = securityData.securityAnswer || '';
			}
		},
		handleCancel() {
			this.$emit('close');
		},
		handleConfirm() {
			this.$refs.form.validate().then(res => {
				this.$emit('confirm', { ...this.formData });
			}).catch(err => {
				console.log('表单验证失败：', err);
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

.btn-confirm {
	flex: 1;
	height: 40px;
	background-color: #007aff;
	color: white;
	border: none;
	border-radius: 5px;
		margin-left: 10px;
	}
	
	.security-section {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid #f0f0f0;
	}
	
	.security-title {
		font-size: 14px;
		color: #666;
		margin-bottom: 15px;
		font-weight: 500;
	}
</style>