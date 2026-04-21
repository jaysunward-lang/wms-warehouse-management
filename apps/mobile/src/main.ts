import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

// Vant组件库
import { 
  Button, 
  Cell, 
  CellGroup, 
  NavBar, 
  Tabbar, 
  TabbarItem,
  Tab,
  Tabs,
  Field,
  Form,
  Toast,
  Dialog,
  List,
  PullRefresh,
  Search,
  Icon,
  Grid,
  GridItem,
  Card,
  Tag,
  Popup,
  Picker,
  DatePicker,
  TimePicker,
  NumberKeyboard,
  PasswordInput,
  Loading,
  Empty,
  Divider,
  Notify
} from 'vant';

import 'vant/lib/index.css';
import './styles/global.css';

const app = createApp(App);

// 注册Vant组件
const vantComponents = [
  Button, Cell, CellGroup, NavBar, Tabbar, TabbarItem, Tab, Tabs,
  Field, Form, Toast, Dialog, List, PullRefresh, Search,
  Icon, Grid, GridItem, Card, Tag, Popup, Picker,
  DatePicker, TimePicker, NumberKeyboard, PasswordInput, Loading,
  Empty, Divider, Notify
];

vantComponents.forEach(component => {
  app.use(component);
});

app.use(createPinia());
app.use(router);

app.mount('#app');
