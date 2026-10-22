<template>
  <el-card shadow="never">
    <h1 class="page-title">用户管理</h1>
    <p class="page-description">
      列表、详情、新增、编辑、删除与批量删除都走真实接口。搜索为后端搜索
      （<code>GET /api/users?page=&amp;keyword=</code>），分页每页 20 条，页码由服务端返回。
    </p>

    <SearchBar
      v-model="keyword"
      placeholder="按姓名或账号搜索"
      :loading="busy"
      @search="handleSearch"
      @reset="resetSearch"
    >
      <el-button :disabled="busy" @click="loadUsers(page)">刷新</el-button>
      <el-button v-permission="'user:add'" type="primary" :disabled="busy" @click="openAdd">
        新增用户
      </el-button>
      <el-button
        v-permission="'user:batch'"
        type="danger"
        plain
        :disabled="busy || !selectedIds.length"
        @click="handleBatchDelete"
      >
        批量删除{{ selectedIds.length ? `（${selectedIds.length}）` : '' }}
      </el-button>
    </SearchBar>

    <el-table
      v-loading="loading"
      :data="items"
      row-key="id"
      border
      stripe
      empty-text="没有匹配的用户"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="46" :selectable="row => !isSelf(row)" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="姓名" min-width="150">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="26" :src="row.avatar">{{ (row.name || row.account).slice(0, 1) }}</el-avatar>
            <span>{{ row.name || '未填写' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="account" label="账号" min-width="140" />
      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          <el-tag size="small" effect="plain" :type="row.roleCode === 'admin' ? 'danger' : 'info'">
            {{ row.roleName || row.roleCode }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="150" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link @click="openDetail(row)">详情</el-button>
          <el-button v-permission="'user:edit'" link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button
            v-permission="'user:delete'"
            link
            type="danger"
            :loading="deletingId === row.id"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      :disabled="busy"
      layout="total, prev, pager, next, jumper"
      @current-change="handlePageChange"
    />

    <!-- 详情：单独请求 GET /api/users/{id}，不直接用表格行数据 -->
    <el-dialog v-model="detailVisible" title="用户详情" width="460px">
      <el-descriptions v-if="detailUser" :column="1" border>
        <el-descriptions-item label="ID">{{ detailUser.id }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ detailUser.name || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ detailUser.account }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ detailUser.roleName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailUser.createTime }}</el-descriptions-item>
      </el-descriptions>
      <p class="hint">数据来自 GET /api/users/{id}，后端不返回密码。</p>
    </el-dialog>

    <UserFormDialog
      v-model="dialogVisible"
      :user="editingUser"
      :roles="roles"
      :saving="saving"
      @submit="submitForm"
    />
  </el-card>
</template>

<script>
import SearchBar from '../components/SearchBar.vue'
import UserFormDialog from '../components/UserFormDialog.vue'
import { getUserList, getUser, addUser, editUser, deleteUser, batchDeleteUser } from '../api/user'
import { getRoleList } from '../api/role'

export default {
  name: 'UserManagement',
  components: { SearchBar, UserFormDialog },
  data() {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      keyword: '',
      appliedKeyword: '',
      roles: [],
      loading: false,
      saving: false,
      deletingId: null,
      batching: false,
      confirming: false,
      selectedIds: [],
      dialogVisible: false,
      editingUser: null,
      detailVisible: false,
      detailUser: null
    }
  },
  computed: {
    busy() {
      return this.loading || this.saving || this.deletingId !== null || this.batching || this.confirming
    },
    selfId() {
      return this.$store.state.userInfo && this.$store.state.userInfo.id
    }
  },
  created() {
    this.loadRoles()
    this.loadUsers(1)
  },
  methods: {
    isSelf(row) {
      return row.id === this.selfId
    },
    async loadRoles() {
      try {
        this.roles = await getRoleList()
      } catch {
        this.roles = []
      }
    },
    async loadUsers(page = this.page) {
      this.loading = true
      try {
        let result = await getUserList(page, this.appliedKeyword)
        // 删掉最后一页最后一条后，服务端页码可能已经越界，回退到有效页
        if (page > result.totalPages) {
          result = await getUserList(result.totalPages, this.appliedKeyword)
        }
        this.items = result.items
        this.page = result.page
        this.total = result.total
      } catch {
        // 请求封装已提示原因
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.appliedKeyword = this.keyword.trim()
      this.loadUsers(1)
    },
    resetSearch() {
      this.keyword = ''
      this.appliedKeyword = ''
      this.loadUsers(1)
    },
    handlePageChange(page) {
      if (this.busy) return
      this.loadUsers(page)
    },
    handleSelectionChange(rows) {
      this.selectedIds = rows.map(row => row.id)
    },
    openAdd() {
      this.editingUser = null
      this.dialogVisible = true
    },
    async openDetail(row) {
      if (this.busy) return
      this.loading = true
      try {
        this.detailUser = await getUser(row.id)
        this.detailVisible = true
      } catch {
        // 查询失败不展示旧详情
      } finally {
        this.loading = false
      }
    },
    async openEdit(row) {
      if (this.busy) return
      this.loading = true
      try {
        // 编辑前先 GET 回填，避免用表格里的过期数据覆盖别人刚改过的字段
        this.editingUser = await getUser(row.id)
        this.dialogVisible = true
      } catch {
        // 详情请求失败就不打开弹窗
      } finally {
        this.loading = false
      }
    },
    async submitForm({ id, data }) {
      if (this.saving) return
      this.saving = true
      try {
        const isEdit = id !== null
        const saved = isEdit ? await editUser(id, data) : await addUser(data)

        this.dialogVisible = false
        this.$message.success(isEdit ? '修改成功' : '新增成功')

        if (isEdit && saved.id === this.selfId) {
          if (data.passwd) {
            // 改了自己的密码，后端会作废旧 Token，这里直接请用户重新登录
            this.$store.commit('clearUserInfo')
            this.$message.success('密码已修改，请重新登录')
            await this.$router.replace('/login')
            return
          }
          this.$store.commit('setUserInfo', saved)
        }

        await this.loadUsers(isEdit ? this.page : 1)
      } catch {
        // 409 账号重复等错误保留弹窗和已填内容，便于修改后重试
      } finally {
        this.saving = false
      }
    },
    async handleDelete(row) {
      if (this.busy) return
      if (this.isSelf(row)) {
        this.$message.warning('不能删除当前登录账号')
        return
      }

      this.confirming = true
      try {
        await this.$confirm(`确定删除账号「${row.account}」吗？`, '删除确认', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        return
      } finally {
        this.confirming = false
      }

      this.deletingId = row.id
      try {
        await deleteUser(row.id)
        this.$message.success('删除成功')
        await this.loadUsers(this.page)
      } catch {
        // 失败与取消分开处理，不要把错误当成取消
      } finally {
        this.deletingId = null
      }
    },
    async handleBatchDelete() {
      if (this.busy || !this.selectedIds.length) return

      this.confirming = true
      try {
        await this.$confirm(`确定删除选中的 ${this.selectedIds.length} 个账号吗？`, '批量删除', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        return
      } finally {
        this.confirming = false
      }

      this.batching = true
      try {
        // 真实后端只有单条删除接口，这里由前端串行调用
        await batchDeleteUser(this.selectedIds)
        this.$message.success('批量删除完成')
        this.selectedIds = []
        await this.loadUsers(this.page)
      } catch (error) {
        this.$message.error(error.userMessage || '批量删除中断，请刷新后重试')
        await this.loadUsers(this.page)
      } finally {
        this.batching = false
      }
    }
  }
}
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

code {
  padding: 1px 5px;
  background: #f1f3f7;
  border-radius: 4px;
  font-size: 12px;
}
</style>
