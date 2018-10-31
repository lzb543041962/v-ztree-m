# v-ztree-m

> Vue+iView+zTree的简单树插件

## Build Setup

安装

npm i vue-ztree-m --S

使用

在main.js中

import VueZtreeModified from 'v-ztree-m';

Vue.use(VueZtreeModified);

例：

&emsp;&emsp;VueZtreeModified的使用 直接在template标签内使用： 

    <VueZtreeModified ref='tree'
      @selected='selected'
      @checked='checked'
      :data='treeData'
      :expand-all='false'
      :check='false'>
    </VueZtreeModified>
<br>

## v-ztree-m 支持以下功能 ##
* [`多选`]()  
* [`搜索并展开搜索节点标红`]()  
* [`勾选搜索结果`]()  
* [`新增、编辑、修改节点数据`]()  
* [`获取勾选结果`]()  
* [`获取选中节点`]()  
* [`自定义ztree的setting配置`]()  

## API文档 ##
## 1. 属性 ##
## check(Boolean) ##
&emsp;&emsp;默认false，当check = true时，树开启可勾选状态。  
## checkSearch(Boolean) ##
&emsp;&emsp;默认false，当checkSearch = true时，（check必须等于true）树支持勾选搜索结果。  
## expandAll(Boolean) ##
&emsp;&emsp;默认false，当expandAll = true时，创建的树为展开状态。  
## treeOptions(Object) ##
&emsp;&emsp;没有默认值，可配置异步请求节点数据的请求参数，默认有三个参数，形如treeOptions { url: '请求树节点的接口url', method: '请求方式，如get，post', data: '请求数据'}。  
## data(Array) ##
&emsp;&emsp;没有默认值，默认树节点必须的属性有[{
  'code': '节点唯一标识',
  'pCode': '节点对应父节点唯一标识',
  'name': '节点名'
}]  
标识的key值可以通过setting配置进行修改。
## height(Number) ##
&emsp;&emsp;默认400，可配置树的高度。  
## 2. 方法 ##
## selected(Function) ##
&emsp;&emsp;方法返回一个参数node，也就是选中节点的数据  
## checked(Function) ##
&emsp;&emsp;方法返回一个参数result，也就是当前勾选所有节点的数据  
