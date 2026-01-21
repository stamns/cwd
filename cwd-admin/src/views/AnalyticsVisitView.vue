<template>
  <div class="page">
    <h2 class="page-title">访问统计</h2>
    <div
      v-if="toastVisible"
      class="toast"
      :class="toastType === 'error' ? 'toast-error' : 'toast-success'"
    >
      {{ toastMessage }}
    </div>

    <div class="card">
      <h3 class="card-title">整体概览</h3>
      <div v-if="loading" class="page-hint">加载中...</div>
      <div v-else-if="error" class="page-error">{{ error }}</div>
      <div v-else>
        <div class="stats-grid">
          <div class="stats-item">
            <div class="stats-label">全站总访问量</div>
            <div class="stats-value">{{ overview.totalPv }}</div>
          </div>
          <div class="stats-item">
            <div class="stats-label">有访问记录的页面数</div>
            <div class="stats-value">{{ overview.totalPages }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">页面访问明细（按 PV 排序）</h3>
      <div v-if="loading" class="page-hint">加载中...</div>
      <div v-else-if="error" class="page-error">{{ error }}</div>
      <div v-else-if="items.length === 0" class="page-hint">暂无访问数据</div>
      <div v-else class="domain-table">
        <div class="domain-table-header">
          <div class="domain-cell domain-cell-domain">页面标题</div>
          <div class="domain-cell">访问量</div>
          <div class="domain-cell">最后访问时间</div>
          <div class="domain-cell">页面地址</div>
        </div>
        <div
          v-for="item in items"
          :key="item.postSlug"
          class="domain-table-row"
        >
          <div class="domain-cell domain-cell-domain">
            {{ item.postTitle || item.postSlug }}
          </div>
          <div class="domain-cell">
            {{ item.pv }}
          </div>
          <div class="domain-cell">
            {{ formatTime(item.lastVisitAt) }}
          </div>
          <div class="domain-cell">
            <a
              v-if="item.postUrl"
              :href="item.postUrl"
              target="_blank"
              rel="noreferrer"
            >
              {{ item.postUrl }}
            </a>
            <span v-else>-</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  fetchVisitOverview,
  fetchVisitPages,
  type VisitOverviewResponse,
  type VisitPageItem,
} from "../api/admin";

const loading = ref(false);
const error = ref("");
const overview = ref<VisitOverviewResponse>({
  totalPv: 0,
  totalPages: 0,
});
const items = ref<VisitPageItem[]>([]);

const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");
const toastVisible = ref(false);

function showToast(msg: string, type: "success" | "error" = "success") {
  toastMessage.value = msg;
  toastType.value = type;
  toastVisible.value = true;
  window.setTimeout(() => {
    toastVisible.value = false;
  }, 2000);
}

function formatTime(value: string | null): string {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${mm}`;
}

async function loadData() {
  loading.value = true;
  error.value = "";
  try {
    const [overviewRes, pagesRes] = await Promise.all([
      fetchVisitOverview(),
      fetchVisitPages(),
    ]);
    overview.value = overviewRes;
    items.value = pagesRes.items || [];
  } catch (e: any) {
    const msg = e.message || "加载访问统计数据失败";
    error.value = msg;
    showToast(msg, "error");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  color: #24292f;
}

.card {
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #d0d7de;
  padding: 16px 18px;
}

.card-title {
  margin: 0 0 12px;
  font-size: 16px;
}

.page-hint {
  font-size: 14px;
  color: #57606a;
}

.page-error {
  font-size: 14px;
  color: #d1242f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stats-item {
  padding: 10px 12px;
  border-radius: 6px;
  background-color: #f6f8fa;
  border: 1px solid #d0d7de;
}

.stats-label {
  font-size: 14px;
  color: #57606a;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 26px;
  font-weight: 600;
  color: #24292f;
}

.domain-table {
  border: 1px solid #d0d7de;
  border-radius: 6px;
  overflow: hidden;
}

.domain-table-header {
  display: flex;
  background-color: #f6f8fa;
}

.domain-table-row {
  display: flex;
  border-top: 1px solid #eaeae0;
}

.domain-cell {
  flex: 1;
  padding: 10px 10px;
  font-size: 14px;
  color: #24292f;
  box-sizing: border-box;
}

.domain-cell a {
  color: #57606a;
}

.domain-cell-domain {
  flex: 2;
  font-weight: 500;
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  max-width: 320px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
  z-index: 1000;
}

.toast-success {
  background-color: #1a7f37;
  color: #ffffff;
}

.toast-error {
  background-color: #d1242f;
  color: #ffffff;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>

