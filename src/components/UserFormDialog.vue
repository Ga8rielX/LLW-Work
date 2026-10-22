<template>
  <el-dialog
    :model-value="modelValue"
    :title="form.id === null ? '新增用户' : '编辑用户'"
    width="520px"
    :close-on-click-modal="!saving"
    :close-on-press-escape="!saving"
    :show-close="!saving"
    @update:model-value="value => $emit('update:modelValue', value)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" :disabled="saving" label-width="76px" @submit.prevent>
      <el-form-item label="头像">
        <AvatarUpload v-model="form.avatar" :size="64" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" maxlength="100" placeholder="选填" />
      </el-form-item>
      <el-form-item label="账号" prop="account">
        <el-input v-model.trim="form.account" maxlength="100" placeholder="必填，登录用" />
      </el-form-item>
      <el-form-item label="密码" prop="passwd">
        <el-input
          v-model="form.passwd"
          type="password"
          show-password
          maxlength="100"
          :placeholder="form.id === null ? '新增时必填' : '留空表示不修改'"
        />
      </el-form-item>
      <el-form-item label="角色" prop="roleCode">
        <el-select v-model="form.roleCode" placeholder="请选择角色" style="width: 100%">
          <el-option v-for="role in roles" :key="role.code" :label="role.name" :value="role.code" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="saving" @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script>
import AvatarUpload from './AvatarUpload.vue'

/**
 * 用户表单弹窗（课件第 6 课：props / emit + 自定义 v-model）
 *
 * 组件只负责「收集数据 + 校验」，保存请求交给父组件。
 * 这样同一个弹窗既能用于新增也能用于编辑，父组件决定调用哪个接口。
 */
export default {
  name: 'UserFormDialog',
  components: { AvatarUpload },
  props: {
    modelValue: { type: Boolean, default: false },
    // 传入的用户对象；id 为 null 表示新增
    user: { type: Object, default: null },
    roles: { type: Array, default: () => [] },
    saving: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'submit'],
  data() {
    return {
      form: { id: null, name: '', account: '', passwd: '', roleCode: 'member', avatar: '' }
    }
  },
  computed: {
    rules() {
      return {
        name: [{ max: 100, message: '姓名最多 100 个字符', trigger: 'blur' }],
        account: [
          { required: true, whitespace: true, message: '请输入账号', trigger: 'blur' },
          { max: 100, message: '账号最多 100 个字符', trigger: 'blur' }
        ],
        passwd: [
          { max: 100, message: '密码最多 100 个字符', trigger: 'blur' },
          {
            validator: (rule, value, done) => {
              if (this.form.id === null && !String(value || '').trim()) {
                done(new Error('新增用户必须填写密码'))
              } else {
                done()
              }
            },
            trigger: 'blur'
          }
        ],
        roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }]
      }
    }
  },
  watch: {
    modelValue(visible) {
      if (!visible) return
      const user = this.user || {}
      this.form = {
        id: user.id === undefined || user.id === null ? null : user.id,
        name: user.name || '',
        account: user.account || '',
        passwd: '',
        roleCode: user.roleCode || (this.roles[0] && this.roles[0].code) || 'member',
        avatar: user.avatar || ''
      }
      this.$nextTick(() => {
        if (this.$refs.formRef) this.$refs.formRef.clearValidate()
      })
    }
  },
  methods: {
    async handleSubmit() {
      const valid = await this.$refs.formRef.validate().catch(() => false)
      if (!valid) return

      const payload = {
        name: this.form.name,
        account: this.form.account.trim(),
        roleCode: this.form.roleCode,
        avatar: this.form.avatar
      }
      // 编辑时留空表示不修改密码，不要把空串发给后端
      if (this.form.id === null || this.form.passwd.trim()) {
        payload.passwd = this.form.passwd
      }
      this.$emit('submit', { id: this.form.id, data: payload })
    }
  }
}
</script>
