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
import { loginAdmin } from "../api/admin";

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

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 100vh;
  padding: 10px;
  box-sizing: border-box;
  background: var(--bg-body);
  background: radial-gradient(circle at top, var(--bg-hover) 0, var(--bg-body) 100%);
}

.login-card {
  background-color: var(--bg-card);
  padding: 32px 32px 28px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-login);
  width: 100%;
  max-width: 420px;
  box-sizing: border-box;
}

.login-icon {
  max-width: 80px;
  display: block;
  margin: 0 auto;
  margin-bottom: 10px;
}

.login-title {
  margin: 0;
  font-size: inherit;
  text-align: center;
  color: var(--text-primary);
  letter-spacing: 0.03em;
}

.login-subtitle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0 28px;
  font-size: 13px;
  text-align: center;
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.form-input {
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  font-size: 14px;
  outline: none;
  background-color: var(--bg-input);
  color: var(--text-primary);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.form-input:focus {
  border-color: var(--primary-color);
  background-color: var(--bg-input);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.18);
}

.form-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input-wrapper .form-input {
  width: 100%;
  padding-right: 38px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.password-toggle svg {
  width: 16px;
}

.form-error {
  font-size: 13px;
  color: var(--color-danger);
  margin-top: 4px;
}

.form-button {
  margin-top: 8px;
  padding: 10px 0;
  border-radius: 30px;
  border: none;
  background: var(--primary-color);
  color: var(--text-inverse);
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease,
    background 0.12s ease;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.28);
  width: 100%;
}

.form-button:disabled {
  opacity: 0.7;
  cursor: default;
  box-shadow: none;
  transform: none;
}

.form-button:not(:disabled):hover {
  filter: brightness(1.03);
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.32);
}

.form-button:not(:disabled):active {
  transform: translateY(0);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.26);
}

.login-link {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  gap: 10px;
}

.login-link a {
  color: var(--text-secondary);
  text-decoration: none;
}

.login-link a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}
</style>
