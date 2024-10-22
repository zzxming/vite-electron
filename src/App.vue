<script setup lang="ts">
import { getVersion } from '@/ipc';
import { routes } from '@/router';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const route = useRoute();

const versionInfo = ref<Record<string, any> | null>(null);

onMounted(async () => {
  getVersion()
    .then(info => versionInfo.value = info)
    .catch((error) => {
      console.log('get version error:', error);
    });
});
</script>

<template>
  <div>
    <electron-version-update />
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

      <div w="1500px" mx-auto py-8 px="5%">
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
