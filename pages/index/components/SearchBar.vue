<template>
	<view class="search-container">
		<uni-search-bar 
			v-model="searchValue" 
			placeholder="搜索"
			@input="handleInput"
			cancelButton="none"
		></uni-search-bar>
	</view>
</template>

<script>
export default {
	name: 'SearchBar',
	props: {
		modelValue: {
			type: String,
			default: ''
		}
	},
	emits: ['update:modelValue', 'search'],
	computed: {
		searchValue: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit('update:modelValue', value);
			}
		}
	},
	methods: {
		handleInput() {
			this.$emit('search', this.searchValue);
		}
	}
}
</script>

<style scoped>
.search-container {
	padding: 10px;
	background-color: white;
}
</style>