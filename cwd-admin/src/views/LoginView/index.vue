<template>
  <div class="login-page">
    <div class="login-card">
      <img class="login-icon" src="https://cwd.js.org/icon.png" alt="icon" />
      <div class="login-subtitle">
        <h1 class="login-title">CWD</h1>
        - 简洁的自托管评论系统管理面板
      </div>
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-item">
          <label class="form-label">API 地址</label>
          <input v-model="apiBaseUrl" class="form-input" type="text" />
        </div>
        <div class="form-item">
          <label class="form-label">管理员账号</label>
          <input v-model="name" class="form-input" type="text" autocomplete="username" />
        </div>
        <div class="form-item">
          <label class="form-label">密码</label>
          <div class="form-input-wrapper">
            <input
              v-model="password"
              class="form-input"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-eye-icon lucide-eye"
              >
                <path
                  d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-eye-off-icon lucide-eye-off"
              >
                <path
                  d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
                />
                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                <path
                  d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
                />
                <path d="m2 2 20 20" />
              </svg>
            </button>
          </div>
        </div>
        <div v-if="error" class="form-error">{{ error }}</div>
        <button class="form-button" type="submit" :disabled="submitting">
          <span v-if="submitting">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>
    </div>
    <!-- <div class="login-link">
      <a href="https://github.com/anghunk/cwd" target="_blank">Github</a>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { loginAdmin } from "../../api/admin";

const router = useRouter();
const defaultAdminName = (import.meta.env.VITE_ADMIN_NAME || "").trim();
const defaultAdminPassword = (import.meta.env.VITE_ADMIN_PASSWORD || "").trim();
const name = ref(defaultAdminName);
const password = ref(defaultAdminPassword);
const showPassword = ref(false);
const submitting = ref(false);
const error = ref("");
const apiBaseUrl = ref("");

const rawEnvApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const defaultApiBaseUrl = rawEnvApiBaseUrl.replace(/\/+$/, "");

onMounted(() => {
  const stored = (localStorage.getItem("cwd_admin_api_base_url") || "").trim();
  if (stored) {
    apiBaseUrl.value = stored;
    return;
  }
  apiBaseUrl.value = defaultApiBaseUrl;
});

async function handleSubmit() {
  const normalizedApiBaseUrl = apiBaseUrl.value.trim().replace(/\/+$/, "");
  if (!normalizedApiBaseUrl) {
    error.value = "请输入 API 地址";
    return;
  }
  if (!name.value || !password.value) {
    error.value = "请输入账号和密码";
    return;
  }
  error.value = "";
  submitting.value = true;
  try {
    localStorage.setItem("cwd_admin_api_base_url", normalizedApiBaseUrl);
    await loginAdmin(name.value, password.value);
    router.push({ name: "comments" });
  } catch (e: any) {
    error.value = e.message || "登录失败";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped lang="less">
@import "../../styles/components/login.less";
</style>
