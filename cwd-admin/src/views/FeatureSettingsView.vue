<template>
  <div class="page">
    <h2 class="page-title">评论功能开关</h2>
    <div
      v-if="toastVisible"
      class="toast"
      :class="toastType === 'error' ? 'toast-error' : 'toast-success'"
    >
      {{ toastMessage }}
    </div>
    <div v-if="loading" class="page-hint">加载中...</div>
    <div v-else>
      <div class="card">
        <h3 class="card-title">显示功能设置</h3>

        <div class="form-item">
          <label class="form-label">开启文章点赞功能</label>
          <label class="switch">
            <input v-model="enableArticleLike" type="checkbox" />
            <span class="slider" />
          </label>
          <div class="form-hint">开启后，评论区顶部会显示文章点赞（喜欢）按钮。</div>
        </div>

        <div class="form-item">
          <label class="form-label">开启评论点赞功能</label>
          <label class="switch">
            <input v-model="enableCommentLike" type="checkbox" />
            <span class="slider" />
          </label>
          <div class="form-hint">开启后，评论列表中的每条评论都会显示点赞按钮。</div>
        </div>

        <div
          v-if="message && messageType === 'error'"
          class="form-message form-message-error"
        >
          {{ message }}
        </div>

        <div class="card-actions">
          <button class="card-button" :disabled="saving" @click="save">
            <span v-if="saving">保存中...</span>
            <span v-else>保存</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { fetchFeatureSettings, saveFeatureSettings } from "../api/admin";

const enableCommentLike = ref(true);
const enableArticleLike = ref(true);
const loading = ref(false);
const saving = ref(false);
const message = ref("");
const messageType = ref<"success" | "error">("success");
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

async function load() {
  loading.value = true;
  try {
    const res = await fetchFeatureSettings();
    enableCommentLike.value = res.enableCommentLike;
    enableArticleLike.value = res.enableArticleLike;
  } catch (e: any) {
    message.value = e.message || "加载失败";
    messageType.value = "error";
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  message.value = "";
  try {
    const res = await saveFeatureSettings({
      enableCommentLike: enableCommentLike.value,
      enableArticleLike: enableArticleLike.value,
    });
    showToast(res.message || "保存成功", "success");
  } catch (e: any) {
    message.value = e.message || "保存失败";
    messageType.value = "error";
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 620px;
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
  margin-bottom: 1em;
}

.card-title {
  margin: 0 0 12px;
  font-size: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-label {
  font-size: 14px;
  color: #555555;
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

.switch {
  position: relative;
  display: inline-flex;
  width: 40px;
  height: 22px;
  align-items: center;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d0d7de;
  transition: 0.2s;
  border-radius: 999px;
}

.slider::before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  top: 3px;
  background-color: #ffffff;
  transition: 0.2s;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(27, 31, 36, 0.15);
}

.switch input:checked + .slider {
  background-color: #0969da;
}

.switch input:checked + .slider::before {
  transform: translateX(16px);
}

.card-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.card-button {
  padding: 8px 14px;
  border-radius: 4px;
  border: none;
  background-color: #0969da;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  min-width: 100px;
}

.card-button:disabled {
  opacity: 0.7;
  cursor: default;
}

.form-message {
  font-size: 13px;
  margin-bottom: 8px;
}

.form-message-error {
  color: #d1242f;
}

.page-hint {
  font-size: 14px;
  color: #57606a;
}
.form-hint {
  font-size: 12px;
  color: #57606a;
  margin-top: 4px;
  line-height: 1.5;
}
</style>
