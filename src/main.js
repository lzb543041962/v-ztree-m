import zTreeM from './zTreeM.vue';

var components = [
  zTreeM
];
const install = function(Vue) {
  components.map(function(component) {
    Vue.component(component.name, component);
  });
};

export default {
  zTreeM,
  install
};
