import type { NotificationHandle } from 'element-plus';
import { listenNewVersionDownload } from '@/ipc';

export const useElectronVersionUpdate = () => {
  const downloading = ref(false);
  const downloadPrecent = ref(0);

  onMounted(() => {
    // window.ipcRenderer.on('update-not-available', (e, info) => {
    //   ElMessage.success('update-not-available');
    // });
    let notify: NotificationHandle;
    window.ipcRenderer.on('autoUpdater-update-available', (_, _info) => {
      downloading.value = true;
      downloadPrecent.value = 0;
      notify = ElNotification({
        type: 'info',
        message: '发现新版本，已自动开始下载',
      });
    });
    listenNewVersionDownload({
      'download-progress': (_, info) => {
        downloadPrecent.value = info.percent;
      },
      'downloaded': () => {
        downloading.value = false;
        notify.close();
      },
      'error': () => {
        downloading.value = false;
        notify.close();
        ElNotification({
          type: 'error',
          message: '自动更新下载失败',
        });
      },
    });
  });

  return {
    downloading,
    downloadPrecent,
  };
};
