<template>
  <div class="avatar-upload">
    <el-avatar :size="size" :src="modelValue">
      <el-icon :size="size * 0.45"><UserFilled /></el-icon>
    </el-avatar>
    <div class="actions">
      <el-upload
        action="#"
        :auto-upload="false"
        :show-file-list="false"
        accept="image/png,image/jpeg,image/webp"
        :on-change="handleChange"
      >
        <el-button size="small">选择图片</el-button>
      </el-upload>
      <el-button v-if="modelValue" size="small" link type="danger" @click="$emit('update:modelValue', '')">
        清除
      </el-button>
    </div>
  </div>
</template>

<script>
const MAX_SIZE = 2 * 1024 * 1024

/**
 * 头像选择组件（课件第 8 课：本地预览）
 *
 * 只做「选文件 → 转 dataURL → 预览」，不做真实上传：
 * 真实项目需要后端提供上传接口、FormData 请求和文件校验。
 * dataURL 直接存进用户对象，演示够用，但体积大，不适合生产。
 */
export default {
  name: 'AvatarUpload',
  props: {
    modelValue: { type: String, default: '' },
    size: { type: Number, default: 56 }
  },
  emits: ['update:modelValue'],
  methods: {
    handleChange(uploadFile) {
      const file = uploadFile && uploadFile.raw
      if (!file) return

      if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
        this.$message.error('只支持 PNG / JPG / WEBP 图片')
        return
      }
      if (file.size > MAX_SIZE) {
        this.$message.error('图片不能超过 2MB')
        return
      }

      const reader = new FileReader()
      reader.onload = () => this.$emit('update:modelValue', String(reader.result))
      reader.readAsDataURL(file)
    }
  }
}
</script>

<style scoped>
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
