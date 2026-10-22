<template>
  <div v-loading="loading">
    <el-alert
      :title="alertText"
      type="info"
      :closable="false"
      class="alert"
    />

    <div class="stat-grid">
      <div class="stat-card">
        <div class="label">用户总数</div>
        <div class="value">{{ total }}</div>
        <div class="extra">来自 GET /api/users 的 total</div>
      </div>
      <div class="stat-card">
        <div class="label">角色数量</div>
        <div class="value">{{ roles.length }}</div>
        <div class="extra">来自 GET /api/roles</div>
      </div>
      <div class="stat-card">
        <div class="label">近 7 天新增</div>
        <div class="value">{{ newIn7Days }}</div>
        <div class="extra">按 createTime 统计</div>
      </div>
      <div class="stat-card">
        <div class="label">管理类账号</div>
        <div class="value">{{ adminCount }}</div>
        <div class="extra">角色不是普通用户</div>
      </div>
    </div>

    <div class="chart-grid">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>近 7 天注册趋势</span>
            <span class="card-sub">数据由用户列表计算，非写死</span>
          </div>
        </template>
        <div ref="lineRef" class="chart"></div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>角色分布</span>
            <span class="card-sub">按 roleCode 聚合</span>
          </div>
        </template>
        <div ref="pieRef" class="chart"></div>
      </el-card>
    </div>

    <el-card shadow="never" class="recent">
      <template #header>
        <div class="card-header">
          <span>最近注册的用户</span>
          <router-link v-if="canViewUsers" to="/users">进入用户管理</router-link>
        </div>
      </template>
      <el-table :data="recentUsers" size="small" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="140">
          <template #default="{ row }">{{ row.name || '未填写' }}</template>
        </el-table-column>
        <el-table-column prop="account" label="账号" width="160" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.roleName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" min-width="150" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getUserList } from '../api/user'
import { getRoleList } from '../api/role'
import { USE_MOCK } from '../api/request'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      loading: false,
      users: [],
      roles: [],
      total: 0,
      lineChart: null,
      pieChart: null,
      observers: []
    }
  },
  computed: {
    alertText() {
      return USE_MOCK
        ? '当前为 Mock 模式：所有数字都来自本地种子数据（28 条用户），可在用户管理里增删后回来看变化。'
        : '当前为真实后端模式：数字来自 GET /api/users 与 GET /api/roles，后端没有任务/趋势接口，因此不展示那类图表。'
    },
    canViewUsers() {
      return this.$store.getters.roleCode !== 'member'
    },
    newIn7Days() {
      const limit = this.dateString(-6)
      return this.users.filter(user => (user.createTime || '').slice(0, 10) >= limit).length
    },
    adminCount() {
      return this.users.filter(user => user.roleCode !== 'member').length
    },
    recentUsers() {
      return this.users.slice(0, 5)
    }
  },
  mounted() {
    this.loadData()
  },
  beforeUnmount() {
    this.observers.forEach(observer => observer.disconnect())
    // 容器被隐藏或初始化失败时 dispose 可能抛错，不能让它影响路由切换
    try {
      if (this.lineChart) this.lineChart.dispose()
    } catch {
      /* 忽略销毁异常 */
    }
    try {
      if (this.pieChart) this.pieChart.dispose()
    } catch {
      /* 忽略销毁异常 */
    }
  },
  methods: {
    dateString(offsetDays) {
      const date = new Date()
      date.setDate(date.getDate() + offsetDays)
      const pad = value => String(value).padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    },
    async loadData() {
      this.loading = true
      try {
        await this.loadAllUsers()
        this.roles = await getRoleList()
        await this.$nextTick()
        this.renderCharts()
      } catch {
        // 请求封装已提示错误
      } finally {
        this.loading = false
      }
    },
    /** 分页接口一次只给 20 条，统计需要把所有页拉完 */
    async loadAllUsers() {
      const first = await getUserList(1)
      let list = first.items.slice()
      for (let page = 2; page <= first.totalPages; page++) {
        const result = await getUserList(page)
        list = list.concat(result.items)
      }
      this.users = list
      this.total = first.total
    },
    renderCharts() {
      const days = []
      const counts = []
      for (let offset = -6; offset <= 0; offset++) {
        const day = this.dateString(offset)
        days.push(day.slice(5))
        counts.push(this.users.filter(user => (user.createTime || '').slice(0, 10) === day).length)
      }

      this.lineChart = this.lineChart || echarts.init(this.$refs.lineRef)
      this.lineChart.setOption({
        grid: { left: 40, right: 20, top: 30, bottom: 30 },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: days,
          axisLine: { lineStyle: { color: '#d8dee9' } },
          axisLabel: { color: '#7b8794' }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          splitLine: { lineStyle: { color: '#eef1f6' } },
          axisLabel: { color: '#7b8794' }
        },
        series: [
          {
            type: 'line',
            smooth: true,
            data: counts,
            symbolSize: 6,
            lineStyle: { width: 2, color: '#2b6de5' },
            itemStyle: { color: '#2b6de5' },
            areaStyle: { color: 'rgba(43,109,229,0.10)' }
          }
        ]
      })

      const roleMap = {}
      this.users.forEach(user => {
        const name = user.roleName || user.roleCode || '未知'
        roleMap[name] = (roleMap[name] || 0) + 1
      })

      this.pieChart = this.pieChart || echarts.init(this.$refs.pieRef)
      this.pieChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0, icon: 'circle', textStyle: { color: '#5b6675' } },
        series: [
          {
            type: 'pie',
            radius: ['46%', '68%'],
            center: ['50%', '44%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: '#fff', borderWidth: 2 },
            label: { formatter: '{b} {d}%', color: '#5b6675' },
            data: Object.keys(roleMap).map(name => ({ name, value: roleMap[name] }))
          }
        ]
      })

      this.observeResize(this.$refs.lineRef, this.lineChart)
      this.observeResize(this.$refs.pieRef, this.pieChart)
    },
    /** 侧边栏折叠会改变容器宽度，用 ResizeObserver 比监听 window 更准 */
    observeResize(element, chart) {
      if (!element || typeof ResizeObserver === 'undefined') return
      const observer = new ResizeObserver(() => chart.resize())
      observer.observe(element)
      this.observers.push(observer)
    }
  }
}
</script>

<style scoped>
.alert {
  margin-bottom: 16px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.card-sub {
  color: var(--wa-text-3);
  font-size: 12px;
  font-weight: 400;
}

.chart {
  height: 260px;
}

.recent {
  margin-bottom: 8px;
}
</style>
