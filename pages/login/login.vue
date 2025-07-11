<template>
	<view class="login-container">
		<view class="fingerprint-overlay" v-if="showFingerprintOverlay"></view>
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
				
				<uni-forms-item v-if="isFirstLogin" name="securityQuestion">
					<uni-easyinput 
						v-model="formData.securityQuestion" 
						placeholder="请输入安全问题（可选）"
						:maxlength="100"
					></uni-easyinput>
				</uni-forms-item>
				
				<uni-forms-item v-if="isFirstLogin && formData.securityQuestion" name="securityAnswer">
					<uni-easyinput 
						v-model="formData.securityAnswer" 
						placeholder="请输入安全问题答案"
						:maxlength="50"
					></uni-easyinput>
				</uni-forms-item>
			</uni-forms>
			
			<button class="login-btn" @click="handleLogin">{{ isFirstLogin ? '设置密码' : '登录' }}</button>
			
			<view class="forgot-password" v-if="!isFirstLogin && hasSecurityQuestion" @click="showForgotPasswordModal">
				忘记密码？
			</view>
		</view>
		
		<!-- 忘记密码弹窗 -->
		<uni-popup ref="forgotPasswordPopup" type="center" :mask-click="false">
			<view class="forgot-popup-content">
				<view class="forgot-popup-title">找回密码</view>
				
				<view v-if="!showResetPassword">
					<view class="security-question-text">{{ securityQuestion || '未设置安全问题' }}</view>
					
					<uni-forms ref="securityForm" :modelValue="securityFormData" :rules="securityRules" v-if="securityQuestion">
						<uni-forms-item name="answer" required>
							<uni-easyinput 
								v-model="securityFormData.answer" 
								placeholder="请输入安全问题答案"
								:maxlength="50"
							></uni-easyinput>
						</uni-forms-item>
					</uni-forms>
					
					<view class="forgot-popup-buttons">
						<button class="btn-cancel" @click="closeForgotPasswordModal">取消</button>
						<button class="btn-confirm" @click="verifySecurityAnswer" v-if="securityQuestion">验证</button>
					</view>
					
					<view class="no-security-tip" v-if="!securityQuestion">
						<text>未设置安全问题，无法找回密码</text>
						<button class="btn-confirm" @click="closeForgotPasswordModal" style="margin-top: 20px;">确定</button>
					</view>
				</view>
				
				<!-- 重置密码界面 -->
				<view v-if="showResetPassword">
					<uni-forms ref="resetForm" :modelValue="resetFormData" :rules="resetRules">
						<uni-forms-item name="newPassword" required>
							<uni-easyinput 
								v-model="resetFormData.newPassword" 
								type="password"
								placeholder="请输入新密码"
								:maxlength="20"
							></uni-easyinput>
						</uni-forms-item>
						
						<uni-forms-item name="confirmPassword" required>
							<uni-easyinput 
								v-model="resetFormData.confirmPassword" 
								type="password"
								placeholder="确认新密码"
								:maxlength="20"
							></uni-easyinput>
						</uni-forms-item>
					</uni-forms>
					
					<view class="forgot-popup-buttons">
						<button class="btn-cancel" @click="backToSecurityQuestion">返回</button>
						<button class="btn-confirm" @click="resetPassword">重置密码</button>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 指纹识别启用询问弹窗 -->
		<uni-popup ref="fingerprintSetupPopup" type="center" :mask-click="false">
			<view class="fingerprint-setup-content">
				<view class="fingerprint-setup-title">启用指纹登录</view>
				<view class="fingerprint-setup-desc">
					启用指纹识别可以让您更便捷地登录应用，无需每次输入密码。
				</view>
				<view class="fingerprint-setup-buttons">
					<button class="btn-cancel" @click="skipFingerprintSetup">暂不启用</button>
					<button class="btn-confirm" @click="enableFingerprintLogin">启用</button>
				</view>
			</view>
		</uni-popup>

	</view>
</template>

<script>
import FingerprintUtils from './utils/FingerprintUtils.js';

export default {
		data() {
			return {
				isFirstLogin: false,
				fingerprintEnabled: false,
				fingerprintAvailable: false,
				showFingerprintOverlay: false,
				formData: {
					password: '',
					confirmPassword: '',
					securityQuestion: '',
					securityAnswer: ''
				},
				// 忘记密码相关数据
				showResetPassword: false,
				securityQuestion: '',
				securityAnswer: '',
				securityFormData: {
					answer: ''
				},
				resetFormData: {
					newPassword: '',
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
				},
				securityRules: {
					answer: {
						rules: [{
							required: true,
							errorMessage: '请输入安全问题答案'
						}]
					}
				},
				resetRules: {
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
							errorMessage: '请确认密码'
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
		}
	},
	computed: {
		hasSecurityQuestion() {
			const securityData = uni.getStorageSync('loginSecurityData');
			return securityData && securityData.securityQuestion;
		}
	},
	async onLoad() {
		this.checkFirstLogin();
		await this.checkFingerprintAvailability();
		this.checkFingerprintEnabled();
		
		// 如果不是首次登录且启用了指纹识别，自动尝试指纹验证
		if (!this.isFirstLogin && this.fingerprintEnabled) {
			// 给用户一个简短的提示，然后自动启动指纹验证
			uni.showToast({
				title: '请验证指纹',
				icon: 'none',
				duration: 1000
			});
			
			setTimeout(() => {
				this.authenticateWithFingerprint();
			}, 800);
		}
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
				
				// 验证安全问题设置
				if (this.formData.securityQuestion && !this.formData.securityAnswer) {
					uni.showToast({
						title: '请输入安全问题答案',
						icon: 'error'
					});
					return;
				}
				
				// 设置密码
				uni.setStorageSync('loginPassword', this.formData.password);
				
				// 如果设置了安全问题，单独保存
				if (this.formData.securityQuestion && this.formData.securityAnswer) {
					const securityData = {
						securityQuestion: this.formData.securityQuestion,
						securityAnswer: this.formData.securityAnswer
					};
					uni.setStorageSync('loginSecurityData', securityData);
				}
				
				uni.showToast({
					title: '密码设置成功',
					icon: 'success'
				});
				
				// 检查是否可以启用指纹识别
				setTimeout(async () => {
					if (this.fingerprintAvailable) {
						this.showFingerprintSetupDialog();
					} else {
						this.navigateToHome();
					}
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
		},
		
		// 忘记密码相关方法
		showForgotPasswordModal() {
			this.loadSecurityQuestion();
			this.$refs.forgotPasswordPopup.open();
		},
		
		closeForgotPasswordModal() {
			this.$refs.forgotPasswordPopup.close();
			this.resetForgotPasswordData();
		},
		
		resetForgotPasswordData() {
			this.showResetPassword = false;
			this.securityFormData.answer = '';
			this.resetFormData.newPassword = '';
			this.resetFormData.confirmPassword = '';
		},
		
		loadSecurityQuestion() {
			// 从单独的安全问题存储中读取
			const securityData = uni.getStorageSync('loginSecurityData');
			
			if (securityData && securityData.securityQuestion && securityData.securityAnswer) {
				this.securityQuestion = securityData.securityQuestion;
				this.securityAnswer = securityData.securityAnswer;
			} else {
				this.securityQuestion = '';
				this.securityAnswer = '';
			}
		},
		
		verifySecurityAnswer() {
			if (!this.securityFormData.answer) {
				uni.showToast({
					title: '请输入安全问题答案',
					icon: 'error'
				});
				return;
			}
			
			if (this.securityFormData.answer === this.securityAnswer) {
				this.showResetPassword = true;
			} else {
				uni.showToast({
					title: '安全问题答案错误',
					icon: 'error'
				});
			}
		},
		
		backToSecurityQuestion() {
			this.showResetPassword = false;
			this.resetFormData.newPassword = '';
			this.resetFormData.confirmPassword = '';
		},
		
		resetPassword() {
			if (!this.resetFormData.newPassword) {
				uni.showToast({
					title: '请输入新密码',
					icon: 'error'
				});
				return;
			}
			
			if (this.resetFormData.newPassword.length < 6) {
				uni.showToast({
					title: '密码长度不能少于6位',
					icon: 'error'
				});
				return;
			}
			
			if (!this.resetFormData.confirmPassword) {
				uni.showToast({
					title: '请确认密码',
					icon: 'error'
				});
				return;
			}
			
			if (this.resetFormData.newPassword !== this.resetFormData.confirmPassword) {
				uni.showToast({
					title: '两次输入的密码不一致',
					icon: 'error'
				});
				return;
			}
			
			// 重置登录密码
			uni.setStorageSync('loginPassword', this.resetFormData.newPassword);
			uni.showToast({
				title: '密码重置成功',
				icon: 'success'
			});
			
			setTimeout(() => {
				this.closeForgotPasswordModal();
			}, 1500);
		},
		
		// 指纹识别相关方法
		async checkFingerprintAvailability() {
			try {
				const result = await FingerprintUtils.checkAvailability();
				this.fingerprintAvailable = result.available;
			} catch (error) {
				console.log('检查指纹识别可用性失败:', error);
				this.fingerprintAvailable = false;
			}
		},
		
		checkFingerprintEnabled() {
			const enabled = uni.getStorageSync('fingerprintEnabled');
			this.fingerprintEnabled = enabled === true;
		},
		
		showFingerprintSetupDialog() {
			this.$refs.fingerprintSetupPopup.open();
		},
		
		skipFingerprintSetup() {
			this.$refs.fingerprintSetupPopup.close();
			this.navigateToHome();
		},
		
		async enableFingerprintLogin() {
			try {
				// 先进行一次指纹验证确认
				await FingerprintUtils.authenticate({
					message: '请验证指纹以启用指纹登录'
				});
				
				// 验证成功，启用指纹登录
				uni.setStorageSync('fingerprintEnabled', true);
				this.fingerprintEnabled = true;
				
				uni.showToast({
					title: '指纹登录已启用',
					icon: 'success'
				});
				
				this.$refs.fingerprintSetupPopup.close();
				setTimeout(() => {
					this.navigateToHome();
				}, 1500);
			} catch (error) {
				console.log('启用指纹登录失败:', error);
				uni.showModal({
					title: '启用失败',
					content: error.message || '启用指纹登录失败，请检查设备指纹设置和应用权限',
					showCancel: false
				});
			}
		},
		
		async authenticateWithFingerprint() {
			try {
				// 显示白色磨砂背景覆盖层
				this.showFingerprintOverlay = true;
				
				await FingerprintUtils.authenticate({
					message: '请验证指纹登录',
					fallbackButtonTitle: '使用密码登录'
				});
				
				// 隐藏覆盖层
				this.showFingerprintOverlay = false;
				
				// 指纹验证成功，直接登录
				uni.showToast({
					title: '指纹验证成功',
					icon: 'success'
				});
				
				setTimeout(() => {
					this.navigateToHome();
				}, 1000);
			} catch (error) {
				console.log('指纹验证失败:', error);
				
				// 隐藏覆盖层
				this.showFingerprintOverlay = false;
				
				// 如果用户选择使用密码登录或验证失败，不显示错误提示
				// 让用户继续使用密码登录
				if (error.errorCode !== 3 && error.errorCode !== 4) {
					// 只有在非用户主动取消的情况下才显示错误提示
					if (error.errorCode === 1 || error.errorCode === 2) {
						// 硬件问题或未录入指纹，显示详细信息
						uni.showModal({
							title: '指纹验证失败',
							content: error.message + '，请使用密码登录或检查设备设置',
							showCancel: false
						});
					} else {
						// 其他错误，显示简短提示
						uni.showToast({
							title: error.message || '指纹验证失败',
							icon: 'error'
						});
					}
				}
			}
		}
	}
}
</script>

<style scoped>
/* 指纹识别相关样式已移除，改为自动验证 */

/* 指纹设置弹窗样式 */
.fingerprint-setup-content {
	width: 320px;
	max-width: 90vw;
	background-color: white;
	border-radius: 15px;
	padding: 25px 20px;
	text-align: center;
	box-sizing: border-box;
}

.fingerprint-setup-title {
	font-size: 18px;
	font-weight: bold;
	color: #333;
	margin-bottom: 15px;
	word-wrap: break-word;
}

.fingerprint-setup-desc {
	font-size: 14px;
	color: #666;
	line-height: 1.5;
	margin-bottom: 25px;
	word-wrap: break-word;
	text-align: left;
	padding: 0 5px;
}

.fingerprint-setup-buttons {
	display: flex;
	justify-content: space-between;
	gap: 12px;
}

.fingerprint-setup-buttons .btn-cancel,
.fingerprint-setup-buttons .btn-confirm {
	flex: 1;
	height: 42px;
	border: none;
	border-radius: 8px;
	font-size: 15px;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.fingerprint-setup-buttons .btn-cancel {
	background-color: #f5f5f5;
	color: #666;
}

.fingerprint-setup-buttons .btn-confirm {
	background-color: #007aff;
	color: white;
}
.login-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #f5f5f5;
	position: relative;
}

/* 指纹验证时的白色磨砂背景覆盖层 */
.fingerprint-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	z-index: 999;
	animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.login-box {
	width: 300px;
	padding: 40px 30px;
	background-color: white;
	border-radius: 10px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	position: relative;
	z-index: 1;
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

.forgot-password {
	text-align: center;
	margin-top: 15px;
	color: #007aff;
	font-size: 14px;
	cursor: pointer;
}

.forgot-password:active {
	color: #0056cc;
}



/* 忘记密码弹窗样式 */
.forgot-popup-content {
	width: 320px;
	background-color: white;
	border-radius: 10px;
	padding: 20px;
	z-index: 10001;
	position: relative;
}

.forgot-popup-title {
	font-size: 18px;
	font-weight: bold;
	text-align: center;
	margin-bottom: 20px;
	color: #333;
}

.security-question-text {
	background-color: #f5f5f5;
	padding: 15px;
	border-radius: 5px;
	margin-bottom: 20px;
	font-size: 14px;
	color: #333;
	line-height: 1.5;
	min-height: 50px;
	display: flex;
	align-items: center;
}

.forgot-popup-buttons {
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

.no-security-tip {
	text-align: center;
	color: #999;
	font-size: 14px;
	margin-top: 20px;
}

.no-security-tip button {
	width: 100%;
	height: 40px;
	background-color: #007aff;
	color: white;
	border: none;
	border-radius: 5px;
}
</style>