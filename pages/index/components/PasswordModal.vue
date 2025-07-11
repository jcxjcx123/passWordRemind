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
				confirmPassword: ''
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
				}
			}
		}
	},
	watch: {
		visible(val) {
			if (val) {
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
				confirmPassword: ''
			};
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
</style>