<script lang="ts" setup>
import { useZIndex } from '@/hooks';

withDefaults(
  defineProps<{
    visible: boolean;
    precentage: number;
  }>(),
  {
    visible: false,
    precentage: 0,
  },
);
const { currentZIndex } = useZIndex();
</script>

<template>
  <transition name="fade" appear>
    <el-progress
      v-if="visible"
      fixed left-0 right-0 top-0
      :show-text="false"
      :stroke-width="2"
      :duration="50"
      :striped="true"
      :striped-flow="true"
      :percentage="precentage"
      :style="{ zIndex: currentZIndex }"
    />
  </transition>
</template>
