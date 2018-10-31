<template>
  <div>
    <m-row>
      <m-col span='5' style='padding-right: 10px'>
        <m-select ref='searchSelect' filterable clearable :size='"default"' @on-query-change='search($event)' :transfer='false'>
          <m-option v-for='item in suggestData' :value='item.value' :key='item.value'>{{ item.label }}</m-option>
        </m-select>
      </m-col>
      <m-col span='5' style='padding-right: 10px'>
        <m-button size='default' type='primary' @click='search_ztree()'>{{$t('common.search')}}</m-button>
        <m-button v-show='check && checkSearch' size='default' type='error' @click='checkHighlightNodes()'>{{$t('common.tickToSearch')}}</m-button>
      </m-col>
      <m-col span='24' class="m-tree mgt10 js-tree__height">
        <ul class='ztree' ref='ztree'></ul>
      </m-col>
    </m-row>
  </div>
</template>

<script>
import { Row, Col, Select, Option, Button } from 'iview'
import ztree from 'ztree'
import 'ztree/css/zTreeStyle/zTreeStyle.css'
export default {
  name: 'VueZtreeModified',
  props: {
    setting: {
      type: Object,
      default: function () {
        return {}
      }
    },
    check: {
      type: Boolean,
      default: false
    },
    checkSearch: {
      type: Boolean,
      default: false
    },
    expandAll: {
      type: Boolean,
      default: false
    },
    treeOptions: {
      type: Object
    },
    data: {
      type: Array
    },
    height: {
      type: Number,
      default: 400
    }
  },
  components: {
    'm-select': Select,
    'm-option': Option,
    'm-button': Button,
    'm-row': Row,
    'm-col': Col
  },
  data () {
    return {
      treeId: '',
      searchKey: '',
      suggestData: [],
      detailData: {}
    }
  },
  methods: {
    createTree (editId) {
      let self = this
      this.treeId = 'zTree' + new Date().getTime()
      this.$refs.ztree.id = this.treeId
      if (this.treeOptions) {
        let options = {
          url: self.treeOptions.url,
          method: self.treeOptions.method || 'get',
          data: self.treeOptions.data || {}
        }
        if (options.method === 'get') {
          options.params = options.data
        }
        self.$axios(options).then(res => {
          self.calculateTreeHeight()
          if (res.data) {
            let data = res.data
            self.data = data
            $.fn.zTree.init($(self.$refs.ztree), self.setting, self.data)
            if (editId) {
              let intervalId = setInterval(function () {
                let treeObj = self.getSelectedNodes()
                let newTree = treeObj.zTree
                if (newTree) {
                  self.selectNode(editId)
                  clearInterval(intervalId)
                }
              }, 500)
            }
            if (self.expandAll) {
              $.fn.zTree.getZTreeObj(self.treeId).expandAll(true)
            }
          } else {
            $.fn.zTree.init($(self.$refs.ztree), self.setting, self.data)
            if (self.expandAll) {
              $.fn.zTree.getZTreeObj(self.treeId).expandAll(true)
            }
          }
        }, function (res) {
          $.fn.zTree.init($(self.$refs.ztree), self.setting, self.data)
          if (self.expandAll) {
            $.fn.zTree.getZTreeObj(self.treeId).expandAll(true)
          }
        })
      } else {
        $.fn.zTree.init($(self.$refs.ztree), self.setting, self.data)
        if (self.expandAll) {
          $.fn.zTree.getZTreeObj(self.treeId).expandAll(true)
        }
      }
    },
    addNode (newNode) {
      let treeObj = this.getSelectedNodes()
      treeObj.zTree.addNodes(treeObj.treeNode, Object.assign({}, newNode), true)
    },
    editNode (node) {
      let treeObj = this.getSelectedNodes()
      treeObj.zTree.updateNode(Object.assign(treeObj.treeNode, node))
    },
    checkedTreeNode () {
      let self = this
      let treeObj = $.fn.zTree.getZTreeObj(self.treeId)
      let treeNodes = treeObj.transformToArray(treeObj.getNodes())
      let result = []
      treeNodes.forEach(function (element) {
        if (element.checked === true) {
          result.push(element)
        }
      }, this)
      return result
    },
    search (key) {
      this.searchKey = key
      key = key || ''
      key = key.trim()
      let self = this
      let treeObj = $.fn.zTree.getZTreeObj(this.treeId)
      let nodes = treeObj.transformToArray(treeObj.getNodes())
      this.suggestData = []
      if (key.length !== 0) {
        for (let i = 0; i < nodes.length; i++) {
          if (self.suggestData.length > 9) {
            return
          }
          let ds = nodes[i]
          if (ds.name.toLowerCase().indexOf(key.toLowerCase()) >= 0) {
            self.suggestData.push({
              label: ds.name,
              value: ds.id
            })
          }
        }
      }
    },
    search_ztree: function (flag) {
      // <2>.得到模糊匹配搜索条件的节点数组集合
      let self = this
      let highlightNodes = []
      if (self.searchKey !== '') {
        let treeObj = $.fn.zTree.getZTreeObj(self.treeId)
        highlightNodes = treeObj.getNodesByParamFuzzy('name', self.searchKey, null)
      }
      // <3>.高亮显示并展示【指定节点s】
      this.highlightAndExpand_ztree(self.treeId, highlightNodes, self.searchKey, flag)
      this.$refs.searchSelect.clearSingleSelect()
    },

    /**
     * 高亮显示并展示【指定节点s】
     * @param treeId
     * @param highlightNodes 需要高亮显示的节点数组
     * @param flag           需要高亮显示的节点标识
     */
    highlightAndExpand_ztree: function (treeId, highlightNodes, tx, flag) {
      let self = this
      let treeObj = $.fn.zTree.getZTreeObj(treeId)
      let treeNodes = treeObj.transformToArray(treeObj.getNodes())
      for (let i = 0; i < treeNodes.length; i++) {
        treeNodes[i].highlight = false
        treeObj.updateNode(treeNodes[i])
      }
      treeObj.expandAll(false)
      setTimeout(function () {
        if (highlightNodes != null) {
          for (let i = 0; i < highlightNodes.length; i++) {
            if (flag != null && flag !== '') {
              if (highlightNodes[i].flag === flag) {
                // 高亮显示节点，并展开
                highlightNodes[i].highlight = true
                treeObj.updateNode(highlightNodes[i])
                // 高亮显示节点的父节点的父节点....直到根节点，并展示
                let parentNode = highlightNodes[i].getParentNode()
                let parentNodes = self.getParentNodes_ztree(treeId, parentNode)
                treeObj.expandNode(parentNodes, true, false, true)
                treeObj.expandNode(parentNode, true, false, true)
              }
            } else {
              // 高亮显示节点，并展开
              let t = highlightNodes[i].name
              highlightNodes[i].highlight = true
              highlightNodes[i].name = t
              treeObj.updateNode(highlightNodes[i])
              // 高亮显示节点的父节点的父节点....直到根节点，并展示
              let parentNode = highlightNodes[i].getParentNode()
              let parentNodes = self.getParentNodes_ztree(treeId, parentNode)
              treeObj.expandNode(parentNodes, true, false, true)
              treeObj.expandNode(parentNode, true, false, true)
            }
          }
        }
      }, 300)
    },

    /**
     * 递归得到指定节点的父节点的父节点....直到根节点
     */
    getParentNodes_ztree: function (treeId, node) {
      let self = this
      if (node != null) {
        // let treeObj = $.fn.zTree.getZTreeObj(treeId)
        let parentNode = node.getParentNode()
        return self.getParentNodes_ztree(treeId, parentNode)
      } else {
        return node
      }
    },
    checkHighlightNodes: function () {
      let self = this
      let treeObj = $.fn.zTree.getZTreeObj(self.treeId)
      let nodes = treeObj.transformToArray(treeObj.getNodes())
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].highlight === true) {
          treeObj.checkNode(nodes[i], true, true)
        }
      }
    },
    calculateTreeHeight: function () {
      let resourceTreeHeight = this.height
      let resourceTree = document.querySelector('.m-tree')
      let treeContent = document.querySelector('.ztree')
      resourceTree.style.height = resourceTreeHeight + 'px'
      treeContent.style.height = resourceTreeHeight - 45 + 'px'
    },
    getSelectedNodes: function () {
      let self = this
      let zTree = $.fn.zTree.getZTreeObj(this.treeId)
      let nodes = zTree.getSelectedNodes()
      let treeNode = nodes[0]
      return {
        zTree: zTree,
        nodes: nodes,
        treeNode: treeNode,
        treeId: self.treeId
      }
    },
    selectNode: function (editId) {
      let zTree = $.fn.zTree.getZTreeObj(this.treeId)
      let node = zTree.getNodeByParam('id', editId, null)
      zTree.selectNode(node)
      this.$emit('selected', node)
      zTree.expandNode(node)
      if (node.children) {
        node.open = true
      }
    }
  },
  mounted () {
    let self = this
    let onCheck = (event, treeId, treeNode) => {
      self.$emit('checked', self.checkedTreeNode())
    }
    self.setting = Object.assign({
      edit: {
        enable: true,
        showRemoveBtn: false,
        showRenameBtn: false
      },
      check: {
        enable: self.check,
        autoCheckTrigger: true,
        chkStyle: 'checkbox'
      },
      data: {
        keep: {
          parent: true,
          leaf: false
        },
        simpleData: {
          enable: true,
          idKey: 'code',
          pIdKey: 'pCode'
        }
      },
      view: {
        selectedMulti: false,
        dblClickExpand: false,
        fontCss: (treeId, treeNode) => {
          if (treeNode.isParent === false) {
            return (treeNode.highlight) ? {
              color: '#ff0000',
              'font-weight': 'bold'
            } : {
              color: '#333',
              'font-weight': 'normal'
            }
          } else {
            return (treeNode.highlight) ? {
              color: '#ff0000',
              'font-weight': 'bold'
            } : {
              color: '#333',
              'font-weight': 'normal'
            }
          }
        }
      },
      callback: {
        onAsyncSuccess: (event, treeId, treeNode, msg) => {
          if (self.expandAll) {
            $.fn.zTree.getZTreeObj(treeId).expandAll(true)
          }
        },
        onClick: function (e, treeId, treeNode) {
          self.$emit('selected', treeNode)
          let zTree = $.fn.zTree.getZTreeObj(treeId)
          zTree.expandNode(treeNode)
        }
      }
    }, self.setting)
    if (self.setting.check && self.setting.check.enable) {
      self.setting.callback.onCheck = onCheck
    }
    this.createTree()
  }
}
</script>
