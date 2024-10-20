import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import '@unocss/reset/tailwind.css';
import 'uno.css';
import '@/assets/style/main.less';

// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

const app = createApp(App);

app
  .use(router)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
