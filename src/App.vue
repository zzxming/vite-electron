<script setup lang="ts">
import { routes } from '@/router';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const route = useRoute();

const versionInfo = ref<Record<string, any> | null>(null);

onMounted(async () => {
  versionInfo.value = await window.ipcRenderer.getVersion();

  // ElMessage.success('noooooooooooo new version');
  // ElMessage.error('safowmfawmfa www');
  // window.ipcRenderer.on('update-not-available', (e, info) => {
  //   ElMessage.success('update-not-available');
  //   ElNotification({
  //     message: info,
  //     duration: 0,
  //   });
  // });
  // window.ipcRenderer.on('update-available', (e, info) => {
  //   ElMessage.success('update-available');
  //   ElNotification({
  //     message: info,
  //     duration: 0,
  //   });
  // });

  window.ipcRenderer.on('download-progress', (_, info: {
    speed: number;
    percent: number;
  }) => {
    console.log(info);
    ElNotification({
      message: JSON.stringify(info),
    });
  });
  window.ipcRenderer.on('update-downloaded', () => {
    // eslint-disable-next-line no-alert
    const res = confirm('新版本已下载，是否立即安装？');
    if (res) {
      window.ipcRenderer.invoke('install');
    }
  });
});
</script>

<template>
  <div>
    <el-config-provider :locale="zhCn">
      <el-menu
        :default-active="$route.path"
        mode="horizontal"
        :ellipsis="false"
        router
      >
        <el-menu-item
          v-for="routeItem in routes"
          :key="routeItem.path"
          :index="routeItem.path"
        >
          {{ routeItem.meta.name }}
        </el-menu-item>
      </el-menu>

      <div w="1500px" mx-auto pt-8 px="5%">
        <el-breadcrumb mx-auto mb-2 separator="/">
          <el-breadcrumb-item :to="{ path: route.path }">
            {{ route.meta.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
        <router-view />
      </div>
    </el-config-provider>
  </div>
</template>
