/**
 * 指纹识别工具类
 * 封装uni-app的SOTER生物认证API
 */
class FingerprintUtils {
	/**
	 * 检查设备是否支持指纹识别
	 * @returns {Promise<boolean>}
	 */
	static checkFingerprintSupport() {
		return new Promise((resolve) => {
			// #ifdef APP-PLUS
			try {
				// 使用官方SOTER API检查支持的认证方式
				uni.checkIsSupportSoterAuthentication({
					success: (res) => {
						console.log('支持的认证方式:', res.supportMode);
						// 检查是否支持指纹识别
						const supportFingerprint = res.supportMode && res.supportMode.includes('fingerPrint');
						resolve(supportFingerprint);
					},
					fail: (err) => {
						console.log('检查SOTER支持失败:', err);
						resolve(false);
					}
				});
			} catch (error) {
				console.log('检查指纹支持时出错:', error);
				resolve(false);
			}
			// #endif
			
			// #ifndef APP-PLUS
			// 非App平台暂不支持指纹识别
			resolve(false);
			// #endif
		});
	}
	
	/**
	 * 检查是否已录入指纹
	 * @returns {Promise<boolean>}
	 */
	static checkFingerprintEnrolled() {
		return new Promise((resolve) => {
			// #ifdef APP-PLUS
			try {
				// 使用官方SOTER API检查是否录入指纹
				uni.checkIsSoterEnrolledInDevice({
					checkAuthMode: 'fingerPrint',
					success: (res) => {
						console.log('指纹录入状态:', res.isEnrolled);
						resolve(res.isEnrolled);
					},
					fail: (err) => {
						console.log('检查指纹录入状态失败:', err);
						resolve(false);
					}
				});
			} catch (error) {
				console.log('检查指纹录入状态时出错:', error);
				resolve(false);
			}
			// #endif
			
			// #ifndef APP-PLUS
			resolve(false);
			// #endif
		});
	}
	
	/**
	 * 启动指纹识别验证
	 * @param {Object} options 配置选项
	 * @returns {Promise<Object>}
	 */
	static authenticate(options = {}) {
		return new Promise((resolve, reject) => {
			// #ifdef APP-PLUS
			try {
				const defaultOptions = {
					authContent: '请验证指纹',
					challenge: 'fingerprint_auth_' + Date.now()
				};
				
				const finalOptions = Object.assign(defaultOptions, options);
				
				// 使用官方SOTER API进行指纹验证
				uni.startSoterAuthentication({
					requestAuthModes: ['fingerPrint'],
					challenge: finalOptions.challenge,
					authContent: finalOptions.authContent,
					success: (res) => {
						console.log('指纹验证成功:', res);
						resolve({
							success: true,
							message: '指纹验证成功',
							authMode: res.authMode
						});
					},
					fail: (err) => {
						console.log('指纹验证失败:', err);
						
						let errorMessage = '指纹验证失败';
						let errorCode = err.errCode || -1;
						
						// 根据SOTER错误码映射错误信息
						switch (errorCode) {
							case 90001:
								errorMessage = '本设备不支持生物认证';
								break;
							case 90002:
								errorMessage = '用户未授权使用该生物认证接口';
								break;
							case 90003:
								errorMessage = '请求使用的生物认证方式不支持';
								break;
							case 90008:
								errorMessage = '用户取消授权';
								break;
							case 90009:
								errorMessage = '识别失败';
								break;
							case 90010:
								errorMessage = '重试次数过多被冻结';
								break;
							case 90011:
								errorMessage = '用户未录入所选识别方式';
								break;
							default:
								errorMessage = err.errMsg || '指纹验证失败';
						}
						
						reject({
							success: false,
							errorCode: errorCode,
							message: errorMessage
						});
					}
				});
			} catch (error) {
				console.log('启动指纹验证时出错:', error);
				reject({
					success: false,
					errorCode: -2,
					message: '启动指纹验证失败，请检查权限设置'
				});
			}
			// #endif
			
			// #ifndef APP-PLUS
			// 非App平台不支持指纹识别
			reject({
				success: false,
				errorCode: -1,
				message: '当前平台不支持指纹识别'
			});
			// #endif
		});
	}
	
	/**
	 * 检查指纹识别是否可用（综合检查）
	 * @returns {Promise<Object>}
	 */
	static async checkAvailability() {
		try {
			const isSupported = await this.checkFingerprintSupport();
			if (!isSupported) {
				return {
					available: false,
					reason: '设备不支持指纹识别'
				};
			}
			
			const isEnrolled = await this.checkFingerprintEnrolled();
			if (!isEnrolled) {
				return {
					available: false,
					reason: '设备未录入指纹'
				};
			}
			
			return {
				available: true,
				reason: '指纹识别可用'
			};
		} catch (error) {
			return {
				available: false,
				reason: '检查指纹识别可用性失败'
			};
		}
	}
}

export default FingerprintUtils;