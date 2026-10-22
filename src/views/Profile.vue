<template>
  <el-card shadow="never" class="profile-card">
    <h1 class="page-title">个人中心</h1>
    <p class="page-description">
      头像只做本地上传预览（转 dataURL），不经过后端；姓名通过 PUT /api/auth/me 保存。
    </p>

    <el-form :model="form" label-width="90px" :disabled="saving" class="profile-form">
      <el-form-item label="头像">
        <AvatarUpload v-model="form.avatar" :size="72" />
      </el-form-item>
      <el-form-item label="账号">
        <el-input :model-value="account" disabled />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="form.name" maxlength="100" placeholder="选填" />
      </el-form-item>
      <el-form-item label="角色">
        <el-tag effect="plain">{{ roleName }}</el-tag>
      </el-form-item>
      <el-form-item label="权限">
        <div class="permissions">
          <el-tag v-for="item in permissionLabels" :key="item" size="small" effect="plain" class="tag">
            {{ item }}
          </el-tag>
          <span v-if="!permissionLabels.length" class="hint">该角色没有额外功能权限</span>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
        <el-button :disabled="saving" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import AvatarUpload from '../components/AvatarUpload.vue'
import { updateProfileApi } from '../api/auth'

const PERMISSION_LABELS = {
  '*': '全部权限',
  'dashboard:view': '仪表盘',
  'dashboard:chart': '仪表盘图表',
  'user:view': '用户查看',
  'user:add': '用户新增',
  'user:edit': '用户编辑',
  'user:delete': '用户删除',
  'user:batch': '批量删除',
  'system:view': '系统管理',
  'role:view': '角色查看',
  'role:manage': '角色维护',
  'menu:view': '菜单查看',
  'chat:use': '群聊',
  'ai:use': 'AI 助手'
}

export default {
  name: 'UserProfile',
  components: { AvatarUpload },
  data() {
    return {
      saving: false,
      form: { name: '', avatar: '' }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {}
    },
    account() {
      return this.userInfo.account || ''
    },
    roleName() {
      return this.userInfo.roleName || ''
    },
    permissionLabels() {
      return (this.userInfo.permissions || []).map(code => PERMISSION_LABELS[code] || code)
    }
  },
  created() {
    this.reset()
  },
  methods: {
    reset() {
      this.form = {
        name: this.userInfo.name || '',
        avatar: this.userInfo.avatar || ''
      }
    },
    async save() {
      if (this.saving) return
      this.saving = true
      try {
        const user = await updateProfileApi({ name: this.form.name, avatar: this.form.avatar })
        // 后端可能只返回部分字段，这里合并保留角色与权限
        this.$store.commit('setUserInfo', { ...this.userInfo, ...user })
        this.$message.success('保存成功')
      } catch {
        // 请求封装已提示
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.profile-card {
  max-width: 720px;
}

.profile-form {
  margin-top: 8px;
}

.permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  margin: 0;
}
</style>
