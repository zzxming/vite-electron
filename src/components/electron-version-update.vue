<script lang="ts" setup>
import { useElectronVersionUpdate } from '@/hooks';

const { downloading, downloadPrecent } = useElectronVersionUpdate();
</script>

<template>
  <fixed-top-progress
    :visible="downloading"
    :precentage="downloadPrecent"
  />
</template>
