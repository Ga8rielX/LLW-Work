<template>
  <el-card shadow="never">
    <h1 class="page-title">角色管理</h1>
    <p class="page-description">
      角色决定「能看到哪些菜单」和「能点哪些按钮」。菜单可见性由路由 <code>meta.roles</code> 控制，
      按钮由 <code>v-permission</code> 指令控制；两者都只是界面层，真正的拦截必须由后端完成。
    </p>

    <div class="toolbar">
      <el-button type="primary" :disabled="loading" @click="openCreate">新增角色</el-button>
      <el-button :disabled="loading" @click="loadRoles">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="roles" border stripe empty-text="暂无角色">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名称" min-width="140" />
      <el-table-column prop="code" label="角色编码" min-width="120" />
      <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
      <el-table-column label="权限数" width="100">
        <template #default="{ row }">
          {{ row.permissions.includes('*') ? '全部' : row.permissions.length }}
        </template>
      </el-table-column>
      <el-table-column prop="userCount" label="用户数" width="90" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openPermission(row)">配置权限</el-button>
          <el-button link @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" :disabled="row.builtin" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增 / 编辑 -->
    <el-dialog
      v-model="formVisible"
      :title="form.id === null ? '新增角色' : '编辑角色'"
      width="480px"
    >
      <el-form ref="roleFormRef" :model="form" :rules="rules" :disabled="saving" label-width="84px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" maxlength="50" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model.trim="form.code" maxlength="30" :disabled="form.id !== null" placeholder="如 auditor" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="2" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitRole">保存</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置 -->
    <el-dialog v-model="permissionVisible" title="配置权限" width="520px">
      <div class="permission-head">
        <span>角色：{{ currentRole && currentRole.name }}</span>
        <span class="hint" v-if="currentRole && currentRole.code === 'admin'">
          超级管理员固定拥有全部权限
        </span>
        <div v-else class="permission-actions">
          <el-button link type="primary" @click="checkAll">全选</el-button>
          <el-button link @click="clearAll">清空</el-button>
        </div>
      </div>

      <el-tree
        ref="treeRef"
        :data="permissionTree"
        show-checkbox
        check-strictly
        node-key="id"
        default-expand-all
        :props="{ label: 'label', children: 'children' }"
        class="permission-tree"
      />

      <p class="hint">
        这里使用 <code>check-strictly</code>，父节点与子节点独立勾选，保存的就是勾选结果，
        不会出现「勾了父节点就送出一整棵子树」的意外授权。
      </p>

      <template #footer>
        <el-button :disabled="savingPermission" @click="permissionVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingPermission" @click="submitPermission">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import {
  getRoleList,
  addRole,
  editRole,
  deleteRole,
  getRolePermissions,
  saveRolePermissions
} from '../api/role'
import { PERMISSION_TREE, flattenPermissionIds } from '../config/permissions'

export default {
  name: 'RoleManagement',
  data() {
    return {
      loading: false,
      saving: false,
      savingPermission: false,
      roles: [],
      permissionTree: PERMISSION_TREE,
      formVisible: false,
      permissionVisible: false,
      currentRole: null,
      form: { id: null, name: '', code: '', description: '' },
      rules: {
        name: [{ required: true, whitespace: true, message: '请输入角色名称', trigger: 'blur' }],
        code: [
          { required: true, whitespace: true, message: '请输入角色编码', trigger: 'blur' },
          { pattern: /^[a-z][a-z0-9_-]*$/i, message: '只能包含字母、数字、下划线和短横线', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.loadRoles()
  },
  methods: {
    async loadRoles() {
      this.loading = true
      try {
        this.roles = await getRoleList()
      } catch {
        // 请求封装已提示
      } finally {
        this.loading = false
      }
    },
    openCreate() {
      this.form = { id: null, name: '', code: '', description: '' }
      this.formVisible = true
      this.$nextTick(() => this.$refs.roleFormRef && this.$refs.roleFormRef.clearValidate())
    },
    openEdit(row) {
      this.form = {
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description || ''
      }
      this.formVisible = true
      this.$nextTick(() => this.$refs.roleFormRef && this.$refs.roleFormRef.clearValidate())
    },
    async submitRole() {
      const valid = await this.$refs.roleFormRef.validate().catch(() => false)
      if (!valid) return

      this.saving = true
      try {
        const payload = {
          name: this.form.name,
          code: this.form.code,
          description: this.form.description
        }
        if (this.form.id === null) await addRole(payload)
        else await editRole(this.form.id, payload)

        this.formVisible = false
        this.$message.success('保存成功')
        await this.loadRoles()
      } catch {
        // 409 编码重复等错误保留弹窗
      } finally {
        this.saving = false
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm(`确定删除角色「${row.name}」吗？`, '删除确认', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        return
      }

      try {
        await deleteRole(row.id)
        this.$message.success('删除成功')
        await this.loadRoles()
      } catch {
        // 角色下还有用户时后端返回 400，已由请求封装提示
      }
    },
    async openPermission(row) {
      this.currentRole = row
      try {
        const { permissions } = await getRolePermissions(row.id)
        this.permissionVisible = true
        await this.$nextTick()
        const checked = permissions.includes('*') ? flattenPermissionIds() : permissions
        this.$refs.treeRef.setCheckedKeys(checked)
      } catch {
        this.permissionVisible = false
      }
    },
    checkAll() {
      this.$refs.treeRef.setCheckedKeys(flattenPermissionIds())
    },
    clearAll() {
      this.$refs.treeRef.setCheckedKeys([])
    },
    async submitPermission() {
      if (!this.currentRole) return
      this.savingPermission = true
      try {
        const permissions = this.$refs.treeRef.getCheckedKeys()
        await saveRolePermissions(this.currentRole.id, permissions)
        this.permissionVisible = false
        this.$message.success('权限已保存，重新登录后按新权限生效')
        await this.loadRoles()
      } catch {
        // 请求封装已提示
      } finally {
        this.savingPermission = false
      }
    }
  }
}
</script>

<style scoped>
.permission-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--wa-text-2);
}

.permission-actions {
  display: flex;
  gap: 4px;
}

.permission-tree {
  max-height: 320px;
  overflow: auto;
  padding: 8px;
  border: 1px solid var(--wa-border);
  border-radius: 8px;
}

code {
  padding: 1px 5px;
  background: #f1f3f7;
  border-radius: 4px;
  font-size: 12px;
}
</style>
