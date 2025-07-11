<template>
<view class="container">
		<!-- 顶部导航栏 -->
		<NavBar 
			@backup="showBackupModal = true"
			@settings="showSettingsMenu = true"
		/>
		
		<!-- 搜索框 -->
		<SearchBar 
			v-model="searchKeyword" 
			@search="handleSearch"
		/>
		
		<!-- 软件分组列表 -->
		<view class="list-container" :class="{ 'swap-mode': isSwapMode }">
			<GroupItem 
				v-for="(group, index) in filteredGroups" 
				:key="group.name" 
				:group="group"
				:index="index"
				:is-swap-mode="isSwapMode"
				:class="{
					'swap-selected': isSwapMode && index === selectedSwapIndex,
					'swap-animation': isSwapMode && index === swapAnimationIndex,
					'swap-disabled': isSwapMode && group.isPinned
				}"
				@toggle="toggleGroup"
				@add-account="handleGroupAddAccount"
				@account-detail="showDetail"
				@account-edit="editItem"
				@account-delete="deleteAccount"
				@toggle-pin="togglePin"
				@long-press="handleLongPress"
				@swap-click="handleSwapClick"
			/>
			
			<view v-if="filteredGroups.length === 0" class="empty-state">
				<uni-icons type="info" size="60" color="#c0c4cc"></uni-icons>
				<text class="empty-text">暂无密码记录</text>
			</view>
		</view>
		
		<!-- 交换模式提示和退出按钮 -->
		<view v-if="isSwapMode" class="swap-mode-overlay">
			<view class="swap-tip">
				<text>请点击要交换到的位置</text>
			</view>
			<view class="swap-exit-btn" @click="exitSwapMode">
				<uni-icons type="close" size="20" color="#fff"></uni-icons>
				<text class="exit-text">退出交换</text>
			</view>
		</view>
		
		<!-- 可拖拽的悬浮按钮 -->
		<view 
			:style="{'transform':'translate3d('+xMove+'px,'+yMove+'px,0)'}"
			class="draggable-fab"
			@touchstart="handleStart"
			@touchmove="handleMove"
			@touchend="handleEnd"
			@click="handleFabClick"
		>
			<uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
		</view>
		
		<!-- 新增/编辑弹窗 -->
		<AddEditModal 
			:visible="showAddModal"
			:editing-item="editingItem"
			:is-from-group-add="isFromGroupAdd"
			:initial-data="{ name: currentGroupName }"
			:preset-phone="presetPhone"
			@close="closeAddModal"
			@save="handleSave"
		/>
		
		<!-- 详情弹窗 -->
		<DetailModal 
			:visible="showDetailModal"
			:current-item="currentItem"
			@close="closeDetailModal"
		/>
		
		<!-- 修改登录密码弹窗 -->
		<PasswordModal 
			:visible="showPasswordSetting"
			@close="closePasswordModal"
			@confirm="handlePasswordChange"
		/>
		
		<!-- 备份恢复弹窗 -->
		<BackupModal 
			:visible="showBackupModal"
			@close="closeBackupModal"
			@export="exportData"
			@import="importData"
		/>
		
		<!-- 设置菜单弹窗 -->
		<uni-popup ref="settingsPopup" type="center" :mask-click="true" @maskClick="closeSettingsMenu">
			<view class="settings-menu">
				<view class="settings-title">设置</view>
				<view class="settings-item" @click="openPasswordSetting">
					<uni-icons type="locked" size="20" color="#007aff"></uni-icons>
					<text class="settings-text">修改密码</text>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
				<view class="settings-item" @click="openPhoneSetting">
					<uni-icons type="phone" size="20" color="#007aff"></uni-icons>
					<text class="settings-text">预设手机号</text>
					<uni-icons type="right" size="16" color="#ccc"></uni-icons>
				</view>
			</view>
		</uni-popup>
		
		<!-- 预设手机号弹窗 -->
		<uni-popup ref="phonePopup" type="center" :mask-click="false">
			<view class="popup-content">
				<view class="popup-title">预设手机号</view>
				<uni-forms ref="phoneForm" :modelValue="phoneFormData" :rules="phoneFormRules">
					<uni-forms-item name="phone" label="手机号" required>
						<uni-easyinput 
							v-model="phoneFormData.phone" 
							type="number"
							placeholder="请输入手机号" 
							:maxlength="11"
						></uni-easyinput>
					</uni-forms-item>
				</uni-forms>
				<view class="popup-buttons">
					<button class="btn-cancel" @click="closePhoneModal">取消</button>
					<button class="btn-confirm" @click="savePresetPhone">确定</button>
				</view>
			</view>
		</uni-popup>

	</view>
</template>

<script>
import NavBar from './components/NavBar.vue'
import SearchBar from './components/SearchBar.vue'
import GroupItem from './components/GroupItem.vue'
import AddEditModal from './components/AddEditModal.vue'
import DetailModal from './components/DetailModal.vue'
import PasswordModal from './components/PasswordModal.vue'
import BackupModal from './components/BackupModal.vue'
import { EncryptionUtils } from './utils/encryption.js'

export default {
	components: {
		NavBar,
		SearchBar,
		GroupItem,
		AddEditModal,
		DetailModal,
		PasswordModal,
		BackupModal
	},
	data() {
		return {
			searchKeyword: '',
			passwordList: [],
			groupedData: [],
			filteredGroups: [],
			expandedGroups: {},
			showAddModal: false,
			showDetailModal: false,
			showPasswordSetting: false,
			showBackupModal: false,
			showSettingsMenu: false,
			showPhoneModal: false,
			presetPhone: '',
			phoneFormData: {
				phone: ''
			},
			phoneFormRules: {
				phone: {
					rules: [{
						required: true,
						errorMessage: '请输入手机号'
					}, {
						pattern: /^1[3-9]\d{9}$/,
						errorMessage: '请输入正确的手机号格式'
					}]
				}
			},
			currentGroupName: '',
			isFromGroupAdd: false,
			editingItem: null,
			currentItem: {},
			formData: {},
			// 拖拽相关数据
			xMove: 0,
			yMove: 0,
			curPoint: { x: 0, y: 0 },
			startPoint: { x: 0, y: 0 },
			isTouchMove: false,
			// 置顶相关数据
			pinnedGroups: [], // 置顶的分组名称列表，按置顶顺序排列
			// 交换排序相关数据
			isSwapMode: false, // 是否处于交换模式
			selectedSwapIndex: -1, // 选中要交换的第一个项目索引
			swapAnimationIndex: -1 // 显示动画效果的项目索引
		}
	},
	onLoad() {
		this.checkLogin();
		this.loadPasswordList();
		this.loadPresetPhone();
	},
	watch: {
		showSettingsMenu(newVal) {
			if (newVal) {
				this.$nextTick(() => {
					this.$refs.settingsPopup.open();
				});
			}
		}
	},
	methods: {
		checkLogin() {
			const loginPassword = uni.getStorageSync('loginPassword');
			if (!loginPassword) {
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}
		},
		
		loadPasswordList() {
			const list = uni.getStorageSync('passwordList') || [];
			this.passwordList = list;
			// 加载置顶分组数据
			this.pinnedGroups = uni.getStorageSync('pinnedGroups') || [];
			this.groupPasswordData();
		},
		
		loadPresetPhone() {
			this.presetPhone = uni.getStorageSync('presetPhone') || '';
			this.phoneFormData.phone = this.presetPhone;
		},
		
		// 将密码列表按软件名称分组
		groupPasswordData() {
			// 创建分组映射
			const groupMap = {};
			
			// 遍历密码列表，按软件名称分组
			this.passwordList.forEach(item => {
				if (!groupMap[item.name]) {
					groupMap[item.name] = {
						name: item.name,
						accounts: [],
						expanded: !!this.expandedGroups[item.name],
						isPinned: this.pinnedGroups.includes(item.name)
					};
				}
				groupMap[item.name].accounts.push(item);
			});
			
			// 转换为数组
			const allGroups = Object.values(groupMap);
			
			// 分离置顶和普通分组
			const pinnedGroupsData = [];
			const normalGroups = [];
			
			allGroups.forEach(group => {
				if (this.pinnedGroups.includes(group.name)) {
					pinnedGroupsData.push(group);
				} else {
					normalGroups.push(group);
				}
			});
			
			// 置顶分组按置顶顺序排列
			pinnedGroupsData.sort((a, b) => {
				return this.pinnedGroups.indexOf(a.name) - this.pinnedGroups.indexOf(b.name);
			});
			
			// 普通分组排序：优先使用保存的排序，否则按软件名称排序
			const savedOrder = uni.getStorageSync('normalGroupsOrder') || [];
			if (savedOrder.length > 0) {
				// 按保存的顺序排序
				normalGroups.sort((a, b) => {
					const indexA = savedOrder.indexOf(a.name);
					const indexB = savedOrder.indexOf(b.name);
					
					// 如果都在保存的顺序中，按保存的顺序排序
					if (indexA !== -1 && indexB !== -1) {
						return indexA - indexB;
					}
					// 如果只有一个在保存的顺序中，已保存的排在前面
					if (indexA !== -1) return -1;
					if (indexB !== -1) return 1;
					// 如果都不在保存的顺序中，按名称排序
					return a.name.localeCompare(b.name, 'zh-CN');
				});
			} else {
				// 默认按软件名称排序
				normalGroups.sort((a, b) => {
					return a.name.localeCompare(b.name, 'zh-CN');
				});
			}
			
			// 合并置顶分组和普通分组
			this.groupedData = [...pinnedGroupsData, ...normalGroups];
			
			// 应用搜索过滤
			this.handleSearch();
		},
		
		savePasswordList() {
			uni.setStorageSync('passwordList', this.passwordList);
			this.groupPasswordData();
		},
		
		handleSearch() {
			if (!this.searchKeyword) {
				this.filteredGroups = this.groupedData;
			} else {
				const keyword = this.searchKeyword.toLowerCase();
				this.filteredGroups = this.groupedData.map(group => {
					// 过滤账号
					const filteredAccounts = group.accounts.filter(account => 
						account.username.toLowerCase().includes(keyword) ||
						account.remark?.toLowerCase().includes(keyword) ||
						account.email?.toLowerCase().includes(keyword)
					);
					
					// 如果软件名称匹配或有匹配的账号，则显示该分组
					if (group.name.toLowerCase().includes(keyword) || filteredAccounts.length > 0) {
						return {
							...group,
							accounts: group.name.toLowerCase().includes(keyword) ? group.accounts : filteredAccounts,
							expanded: true // 搜索时自动展开
						};
					}
					return null;
				}).filter(group => group !== null);
			}
		},
		
		// 切换分组展开/收起状态
		toggleGroup(groupName) {
			this.expandedGroups[groupName] = !this.expandedGroups[groupName];
			// 更新分组数据中的展开状态
			const group = this.groupedData.find(g => g.name === groupName);
			if (group) {
				group.expanded = this.expandedGroups[groupName];
			}
			// 更新过滤后的分组数据
			const filteredGroup = this.filteredGroups.find(g => g.name === groupName);
			if (filteredGroup) {
				filteredGroup.expanded = this.expandedGroups[groupName];
			}
		},
		
		// 切换置顶状态
		togglePin(groupName) {
			const isPinned = this.pinnedGroups.includes(groupName);
			
			if (isPinned) {
				// 取消置顶
				const index = this.pinnedGroups.indexOf(groupName);
				this.pinnedGroups.splice(index, 1);
				uni.showToast({
					title: '已取消置顶',
					icon: 'success'
				});
			} else {
				// 添加置顶
				if (this.pinnedGroups.length >= 5) {
					uni.showToast({
						title: '最多只能置顶5个分组',
						icon: 'none'
					});
					return;
				}
				// 新置顶的分组添加到最前面
				this.pinnedGroups.unshift(groupName);
				uni.showToast({
					title: '已置顶',
					icon: 'success'
				});
			}
			
			// 保存置顶数据到本地存储
			uni.setStorageSync('pinnedGroups', this.pinnedGroups);
			// 重新分组数据
			this.groupPasswordData();
		},
		
		// 处理长按事件，进入交换模式
		handleLongPress(index, groupName) {
			// 置顶分组不能参与交换
			if (this.pinnedGroups.includes(groupName)) {
				uni.showToast({
					title: '置顶分组不支持交换排序',
					icon: 'none'
				});
				return;
			}
			
			this.isSwapMode = true;
			this.swapAnimationIndex = index;
			this.selectedSwapIndex = index;
			
			// 震动反馈
			uni.vibrateShort({
				type: 'heavy'
			});
		},
		
		// 处理交换点击事件
		handleSwapClick(index, groupName) {
			if (!this.isSwapMode) {
				return;
			}
			
			// 置顶分组不能参与交换
			if (this.pinnedGroups.includes(groupName)) {
				uni.showToast({
					title: '置顶分组不支持交换排序',
					icon: 'none'
				});
				return;
			}
			
			if (this.selectedSwapIndex === index) {
				// 点击同一个项，取消选择并退出交换模式
				this.exitSwapMode();
			} else {
				// 执行交换
				this.performSwap(this.selectedSwapIndex, index);
			}
		},
		
		// 执行交换操作
		performSwap(index1, index2) {
			const pinnedCount = this.pinnedGroups.length;
			
			// 确保两个索引都在普通分组范围内
			if (index1 < pinnedCount || index2 < pinnedCount) {
				uni.showToast({
					title: '置顶分组不支持交换排序',
					icon: 'none'
				});
				return;
			}
			
			// 交换数组中的元素
			const temp = this.filteredGroups[index1];
			this.filteredGroups[index1] = this.filteredGroups[index2];
			this.filteredGroups[index2] = temp;
			
			// 保存新的排序
			const normalGroups = this.filteredGroups.slice(pinnedCount);
			const normalGroupNames = normalGroups.map(group => group.name);
			uni.setStorageSync('normalGroupsOrder', normalGroupNames);
			
			// 退出交换模式
			this.exitSwapMode();
			
			// 显示成功提示
			uni.showToast({
				title: '交换成功',
				icon: 'success'
			});
			
			// 震动反馈
			uni.vibrateShort({
				type: 'light'
			});
		},
		
		// 退出交换模式
		exitSwapMode() {
			this.isSwapMode = false;
			this.selectedSwapIndex = -1;
			this.swapAnimationIndex = -1;
		},
		
		// 处理分组新增账号
		handleGroupAddAccount(group) {
			this.currentGroupName = group.name;
			this.isFromGroupAdd = true; // 标记为从分组新增
			this.showAddModal = true;
		},
		
		editItem(item) {
			this.editingItem = item;
			this.currentGroupName = item.name; // 记录当前分组名称
			this.isFromGroupAdd = false; // 编辑时不禁用软件名称
			this.showAddModal = true;
		},
		
		// 删除账号
		deleteAccount(account, groupName) {
			uni.showModal({
				title: '确认删除',
				content: `确定要删除账号 "${account.username}${account.remark ? '（' + account.remark + '）' : ''}" 吗？`,
				success: (res) => {
					if (res.confirm) {
						// 从密码列表中删除该账号
						const index = this.passwordList.findIndex(item => item.id === account.id);
						if (index !== -1) {
							this.passwordList.splice(index, 1);
							this.savePasswordList();
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						}
					}
				}
			});
		},
		
		showDetail(account) {
			this.currentItem = account;
			this.showDetailModal = true;
		},
		
		closeDetailModal() {
			this.showDetailModal = false;
		},
		
		handleFabClick() {
			// 如果刚刚进行了拖拽，则不触发点击事件
			if (this.isTouchMove) {
				return;
			}
			
			this.isFromGroupAdd = false; // 确保FAB新增时不禁用软件名称
			this.currentGroupName = null; // 清空分组名称
			this.showAddModal = true;
		},
		
		closeAddModal() {
			this.showAddModal = false;
			this.editingItem = null;
			this.currentGroupName = null;
			this.isFromGroupAdd = false;
			this.formData = {};
		},
		
		handleSave(formData) {
			if (this.editingItem) {
				// 编辑账号
				const index = this.passwordList.findIndex(item => item.id === this.editingItem.id);
				this.passwordList[index] = { ...formData, id: this.editingItem.id };
			} else {
				// 新增账号
				const newItem = {
					...formData,
					id: Date.now().toString()
				};
				
				// 如果是从分组新增，使用预设的软件名称
				if (this.currentGroupName) {
					newItem.name = this.currentGroupName;
				}
				
				// 检查是否已存在相同软件名称的分组
				const existingGroup = this.passwordList.find(item => item.name === newItem.name);
				if (existingGroup) {
					// 如果存在相同软件名称，自动展开该分组
					this.expandedGroups[newItem.name] = true;
					uni.showToast({
						title: `已添加到 "${newItem.name}" 分组`,
						icon: 'success'
					});
				} else {
					// 如果是新的软件名称，自动展开该分组
					this.expandedGroups[newItem.name] = true;
					uni.showToast({
						title: '添加成功',
						icon: 'success'
					});
				}
				
				this.passwordList.push(newItem);
			}
			
			this.savePasswordList();
			this.closeAddModal();
			
			if (this.editingItem) {
				uni.showToast({
					title: '修改成功',
					icon: 'success'
				});
			}
		},
		
		closePasswordModal() {
			this.showPasswordSetting = false;
		},
		
		handlePasswordChange(passwordData) {
			const currentPassword = uni.getStorageSync('loginPassword');
			if (passwordData.currentPassword !== currentPassword) {
				uni.showToast({
					title: '当前密码错误',
					icon: 'none'
				});
				return;
			}
			
			if (passwordData.newPassword !== passwordData.confirmPassword) {
				uni.showToast({
					title: '两次密码输入不一致',
					icon: 'none'
				});
				return;
			}
			
			uni.setStorageSync('loginPassword', passwordData.newPassword);
			
			uni.showToast({
				title: '密码修改成功',
				icon: 'success'
			});
			
			this.closePasswordModal();
		},
		
		copyToClipboard(text, type) {
			uni.setClipboardData({
				data: text,
				success: () => {
					uni.showToast({
						title: `${type}已复制`,
						icon: 'success'
					});
				}
			});
		},
		
		closeBackupModal() {
			this.showBackupModal = false;
		},
		

		
		exportData() {
			const backupData = {
				version: '1.0',
				timestamp: new Date().getTime(),
				data: this.passwordList
			};
			
			// 使用EncryptionUtils加密
			const encryptedData = EncryptionUtils.encryptData(JSON.stringify(backupData), 'PWD_BACKUP_DEFAULT_KEY');
			
			uni.setClipboardData({
				data: encryptedData,
				success: () => {
					uni.showToast({
						title: '已复制到剪贴板',
						icon: 'success'
					});
					this.closeBackupModal();
				},
				fail: () => {
					uni.showToast({
						title: '复制失败',
						icon: 'none'
					});
				}
			});
		},
		

		

		
		importData() {
			uni.showModal({
				title: '导入备份数据',
				content: '请先将备份数据复制到剪贴板，然后点击确定进行导入',
				success: (res) => {
					if (res.confirm) {
						this.importFromClipboard();
					}
				}
			});
		},
		

		
		importFromClipboard() {
			uni.getClipboardData({
				success: (res) => {
					try {
						// 使用EncryptionUtils解密数据
						const decryptedData = EncryptionUtils.decryptData(res.data, 'PWD_BACKUP_DEFAULT_KEY');
						if (!decryptedData) {
							uni.showToast({
								title: '解密失败，数据格式错误',
								icon: 'error'
							});
							return;
						}
						
						const backupData = JSON.parse(decryptedData);
						this.processBackupData(backupData);
					} catch (error) {
						console.error('导入失败:', error);
						uni.showToast({
							title: '数据格式错误',
							icon: 'error'
						});
					}
				}
			});
		},
		

		
		processBackupData(backupData) {
			// 验证备份数据格式
			if (!backupData || !backupData.data || !Array.isArray(backupData.data)) {
				uni.showToast({
					title: '备份数据格式错误',
					icon: 'error'
				});
				return;
			}
			
			const importCount = backupData.data.length;
			const currentCount = this.passwordList.length;
			
			uni.showModal({
				title: '确认导入',
				content: `将导入 ${importCount} 条密码记录，当前有 ${currentCount} 条记录。导入后将覆盖现有数据，是否继续？`,
				success: (res) => {
					if (res.confirm) {
						// 备份当前数据
						const currentBackup = [...this.passwordList];
						
						try {
							// 导入新数据
							this.passwordList = backupData.data;
							this.savePasswordList();
							
							uni.showToast({
								title: `成功导入 ${importCount} 条记录`,
								icon: 'success'
							});
							
							this.closeBackupModal();
						} catch (error) {
							console.error('导入失败:', error);
							// 恢复原数据
							this.passwordList = currentBackup;
							this.savePasswordList();
							
							uni.showToast({
								title: '导入失败',
								icon: 'error'
							});
						}
					}
				}
			});
		},
		
		// 拖拽处理方法
		handleStart(ev) {
			// 记录一开始手指按下的坐标
			const touch = ev.changedTouches[0];
			this.startPoint.x = touch.pageX;
			this.startPoint.y = touch.pageY;
			this.isTouchMove = false;
		},
		
		handleMove(ev) {
			// 防止页面滚动
			ev.preventDefault();
			this.isTouchMove = true;
			
			const touch = ev.changedTouches[0];
			const diffPoint = {
				x: touch.pageX - this.startPoint.x,
				y: touch.pageY - this.startPoint.y
			};
			
			// 移动的距离 = 差值 + 当前坐标点
			const movePoint = {
				x: diffPoint.x + this.curPoint.x,
				y: diffPoint.y + this.curPoint.y
			};
			
			this.move(movePoint.x, movePoint.y);
		},
		
		handleEnd(ev) {
			if (!this.isTouchMove) return;
			
			// 更新坐标原点
			const touch = ev.changedTouches[0];
			this.curPoint.x += touch.pageX - this.startPoint.x;
			this.curPoint.y += touch.pageY - this.startPoint.y;
			
			// 重置
			this.isTouchMove = false;
		},
		
		move(x, y) {
			x = x || 0;
			y = y || 0;
			this.xMove = x;
			this.yMove = y;
		},
		
		// 设置菜单相关方法
		closeSettingsMenu() {
			this.showSettingsMenu = false;
			this.$refs.settingsPopup.close();
		},
		
		openPasswordSetting() {
			this.closeSettingsMenu();
			this.showPasswordSetting = true;
		},
		
		openPhoneSetting() {
			this.closeSettingsMenu();
			this.phoneFormData.phone = this.presetPhone;
			this.showPhoneModal = true;
			this.$refs.phonePopup.open();
		},
		
		closePhoneModal() {
			this.showPhoneModal = false;
			this.$refs.phonePopup.close();
		},
		
		savePresetPhone() {
			this.$refs.phoneForm.validate().then(res => {
				if (res) {
					this.presetPhone = this.phoneFormData.phone;
					uni.setStorageSync('presetPhone', this.presetPhone);
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
					this.closePhoneModal();
				}
			}).catch(err => {
				console.log('表单验证失败:', err);
			});
		}

	}
}
</script>

<style scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
}

.nav-right-container {
	display: flex;
	align-items: center;
	gap: 10px;
}

.nav-right {
	padding: 5px;
}

.search-container {
	padding: 10px;
	background-color: white;
	margin-bottom: 10px;
}

.list-container {
	padding: 0 10px;
}

.list-item {
	display: flex;
	align-items: center;
	padding: 15px;
	background-color: white;
	margin-bottom: 10px;
	border-radius: 8px;
}

.item-left {
	margin-right: 15px;
}

.item-icon {
	width: 40px;
	height: 40px;
	border-radius: 20px;
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
	margin-left: 10px;
}

/* 分组容器样式 */
.group-container {
	margin-bottom: 10px;
}

/* 分组主项样式 */
.group-item {
	display: flex;
	align-items: center;
	padding: 15px;
	background-color: white;
	border-radius: 8px;
	margin-bottom: 2px;
}

/* 账号容器样式 */
.accounts-container {
	margin-left: 10px;
	margin-right: 10px;
	margin-top: 8px;
	border-left: 2px solid #e0e0e0;
	padding-left: 10px;
	overflow: hidden;
}

/* 无动画效果 */

/* 账号项样式 */
.account-item {
	display: flex;
	align-items: center;
	padding: 12px 15px;
	background-color: #f8f9fa;
	border-radius: 6px;
	margin-bottom: 5px;
	border-left: 3px solid #007aff;
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

/* 图标旋转动画 */
.rotate-icon {
	transition: transform 0.3s ease;
	transform: rotate(90deg);
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
}

.empty-text {
	color: #c0c4cc;
	font-size: 16px;
	margin-top: 20px;
}

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

/* 设置菜单样式 */
.settings-menu {
	width: 280px;
	background-color: white;
	border-radius: 12px;
	padding: 0;
	overflow: hidden;
}

.settings-title {
	font-size: 18px;
	font-weight: bold;
	text-align: center;
	padding: 20px;
	color: #333;
	border-bottom: 1px solid #f0f0f0;
}

.settings-item {
	display: flex;
	align-items: center;
	padding: 16px 20px;
	border-bottom: 1px solid #f0f0f0;
	transition: background-color 0.2s;
}

.settings-item:last-child {
	border-bottom: none;
}

.settings-item:active {
	background-color: #f5f5f5;
}

.settings-text {
	flex: 1;
	font-size: 16px;
	color: #333;
	margin-left: 12px;
}

.detail-item {
	display: flex;
	align-items: center;
	padding: 12px 0;
	border-bottom: 1px solid #f0f0f0;
	cursor: pointer;
}

.detail-item:last-child {
	border-bottom: none;
}

.detail-label {
	width: 60px;
	color: #666;
	font-size: 14px;
}

.detail-value {
	flex: 1;
	color: #333;
	font-size: 14px;
	margin-right: 10px;
	word-break: break-all;
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
}

/* 备份恢复弹窗样式 */
.backup-section {
	margin-bottom: 20px;
	padding: 15px;
	border: 1px solid #e0e0e0;
	border-radius: 8px;
	background-color: #f9f9f9;
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



/* 操作按钮样式 */
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

/* 交换模式样式 */
.swap-mode-overlay {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 999;
	background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15px;
}

.swap-tip {
	background-color: rgba(0, 122, 255, 0.9);
	color: white;
	padding: 10px 20px;
	border-radius: 20px;
	font-size: 14px;
	text-align: center;
	box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.swap-exit-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	background-color: rgba(255, 59, 48, 0.9);
	color: white;
	padding: 12px 24px;
	border-radius: 25px;
	font-size: 14px;
	box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
	transition: all 0.2s ease;
}

.swap-exit-btn:active {
	transform: scale(0.95);
	background-color: rgba(255, 59, 48, 1);
}

.exit-text {
	color: white;
	font-size: 14px;
}

/* 交换动画样式 */
.swap-animation {
	animation: swapPulse 1.5s infinite;
	transform: scale(1.05);
	box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
	border: 2px solid #007aff;
}

.swap-selected {
	background-color: #e3f2fd;
	border: 2px solid #007aff;
	transform: scale(1.02);
	box-shadow: 0 6px 20px rgba(0, 122, 255, 0.3);
}

.swap-disabled {
	opacity: 0.5;
	pointer-events: none;
}

@keyframes swapPulse {
	0%, 100% {
		transform: scale(1.05);
		box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
	}
	50% {
		transform: scale(1.08);
		box-shadow: 0 12px 30px rgba(0, 122, 255, 0.6);
	}
}

/* 交换模式时的列表容器 */
.list-container.swap-mode {
	padding-bottom: 120px;
}

.expand-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
}

/* 可拖拽悬浮按钮样式 */
.draggable-fab {
	position: fixed;
	right: 20px;
	bottom: 20px;
	width: 56px;
	height: 56px;
	border-radius: 28px;
	background-color: #007aff;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
	z-index: 100;
	transition: box-shadow 0.2s ease;
	cursor: pointer;
}

.draggable-fab:active {
	box-shadow: 0 6px 16px rgba(0, 122, 255, 0.6);
	transform: scale(0.95);
}

/* 分组项右侧布局调整 */
.group-item .item-right {
	display: flex;
	align-items: center;
	gap: 8px;
}

/* 账号项右侧布局调整 */
.account-item .item-right {
	display: flex;
	align-items: center;
}


</style>
