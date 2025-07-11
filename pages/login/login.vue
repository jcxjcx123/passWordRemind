<template>
	<view class="login-container">
		<view class="login-box">
			<view class="title">{{ isFirstLogin ? '设置登录密码' : '输入登录密码' }}</view>
			
			<uni-forms ref="form" :modelValue="formData" :rules="rules">
				<uni-forms-item name="password" required>
					<uni-easyinput 
						v-model="formData.password" 
						type="password" 
						placeholder="请输入密码"
						:maxlength="20"
					></uni-easyinput>
				</uni-forms-item>
				
				<uni-forms-item v-if="isFirstLogin" name="confirmPassword" required>
					<uni-easyinput 
						v-model="formData.confirmPassword" 
						type="password" 
						placeholder="确认密码"
						:maxlength="20"
					></uni-easyinput>
				</uni-forms-item>
			</uni-forms>
			
			<button class="login-btn" @click="handleLogin">{{ isFirstLogin ? '设置密码' : '登录' }}</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isFirstLogin: false,
			formData: {
				password: '',
				confirmPassword: ''
			},
			rules: {
				password: {
					rules: [{
						required: true,
						errorMessage: '请输入密码'
					}, {
						minLength: 6,
						errorMessage: '密码长度不能少于6位'
					}]
				},
				confirmPassword: {
					rules: [{
						required: true,
						errorMessage: '请确认密码'
					}, {
						validateFunction: (rule, value, data, callback) => {
							if (value !== data.password) {
								callback('两次输入的密码不一致');
							}
							return true;
						}
					}]
				}
			}
		}
	},
	onLoad() {
		this.checkFirstLogin();
	},
	methods: {
		checkFirstLogin() {
			const loginPassword = uni.getStorageSync('loginPassword');
			this.isFirstLogin = !loginPassword;
		},
		
		handleLogin() {
			if (this.isFirstLogin) {
				// 首次登录，手动验证
				if (!this.formData.password) {
					uni.showToast({
						title: '请输入密码',
						icon: 'error'
					});
					return;
				}
				if (this.formData.password.length < 6) {
					uni.showToast({
						title: '密码长度不能少于6位',
						icon: 'error'
					});
					return;
				}
				if (!this.formData.confirmPassword) {
					uni.showToast({
						title: '请确认密码',
						icon: 'error'
					});
					return;
				}
				if (this.formData.password !== this.formData.confirmPassword) {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'error'
					});
					return;
				}
				
				// 设置密码
				uni.setStorageSync('loginPassword', this.formData.password);
				uni.showToast({
					title: '密码设置成功',
					icon: 'success'
				});
				setTimeout(() => {
					this.navigateToHome();
				}, 1500);
			} else {
				// 登录验证
				if (!this.formData.password) {
					uni.showToast({
						title: '请输入密码',
						icon: 'error'
					});
					return;
				}
				
				const savedPassword = uni.getStorageSync('loginPassword');
				if (this.formData.password === savedPassword) {
					this.navigateToHome();
				} else {
					uni.showToast({
						title: '密码错误',
						icon: 'error'
					});
				}
			}
		},
		
		navigateToHome() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		}
	}
}
</script>

<style scoped>
.login-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #f5f5f5;
}

.login-box {
	width: 300px;
	padding: 40px 30px;
	background-color: white;
	border-radius: 10px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.title {
	font-size: 24px;
	font-weight: bold;
	text-align: center;
	margin-bottom: 30px;
	color: #333;
}

.login-btn {
	width: 100%;
	height: 45px;
	background-color: #007aff;
	color: white;
	border: none;
	border-radius: 5px;
	font-size: 16px;
	margin-top: 20px;
}

.login-btn:active {
	background-color: #0056cc;
}
</style>