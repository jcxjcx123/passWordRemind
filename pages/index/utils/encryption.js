// 加密解密工具类
export class EncryptionUtils {
	// 简单的加密方法（使用Base64和字符偏移）
	static encryptData(data, password) {
		try {
			// 生成密钥
			const key = this.generateKey(password);
			
			// 字符偏移加密
			let encrypted = '';
			for (let i = 0; i < data.length; i++) {
				const charCode = data.charCodeAt(i);
				const keyChar = key.charCodeAt(i % key.length);
				const encryptedChar = String.fromCharCode((charCode + keyChar) % 65536);
				encrypted += encryptedChar;
			}
			
			// Base64编码
			const base64Encrypted = btoa(unescape(encodeURIComponent(encrypted)));
			
			// 添加标识头
			return 'PWD_BACKUP_V1:' + base64Encrypted;
		} catch (error) {
			console.error('加密失败:', error);
			return null;
		}
	}
	
	// 解密方法
	static decryptData(encryptedData, password) {
		try {
			// 检查标识头
			if (!encryptedData.startsWith('PWD_BACKUP_V1:')) {
				return null;
			}
			
			// 移除标识头
			const base64Data = encryptedData.substring('PWD_BACKUP_V1:'.length);
			
			// Base64解码
			const encrypted = decodeURIComponent(escape(atob(base64Data)));
			
			// 生成密钥
			const key = this.generateKey(password);
			
			// 字符偏移解密
			let decrypted = '';
			for (let i = 0; i < encrypted.length; i++) {
				const charCode = encrypted.charCodeAt(i);
				const keyChar = key.charCodeAt(i % key.length);
				const decryptedChar = String.fromCharCode((charCode - keyChar + 65536) % 65536);
				decrypted += decryptedChar;
			}
			
			return decrypted;
		} catch (error) {
			console.error('解密失败:', error);
			return null;
		}
	}
	
	// 生成加密密钥
	static generateKey(password) {
		// 基于固定密码生成32位密钥
		let key = '';
		const baseKey = password + 'PWDAPP2024';
		for (let i = 0; i < 32; i++) {
			key += String.fromCharCode(33 + (baseKey.charCodeAt(i % baseKey.length) + i) % 94);
		}
		return key;
	}
}