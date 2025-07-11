<template>
	<uni-nav-bar 
		title="密码备忘录" 
		:border="false" 
		background-color="#007aff" 
		color="white"
		:status-bar="true"
	>
		<template #right>
			<view class="nav-right-container">
				<view class="nav-right" @click="$emit('backup')">
					<uni-icons type="download" size="25" color="white"></uni-icons>
				</view>
				<view class="nav-right" @click="$emit('settings')">
					<uni-icons type="gear" size="25" color="white"></uni-icons>
				</view>
			</view>
		</template>
	</uni-nav-bar>
</template>

<script>
export default {
	name: 'NavBar',
	emits: ['backup', 'settings']
}
</script>

<style scoped>
.nav-right-container {
	display: flex;
	align-items: center;
	gap: 5px;
}

.nav-right {
	padding: 2px;
}
</style>