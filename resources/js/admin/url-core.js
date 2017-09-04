/*-----------------------------------------------------------------------------
 * @Description:    后台管理--配置url地址 (url-core.js)
 * @Version: 	    V2.0.0
 * @author: 		cuiy(361151713@qq.com)
 * @date			2015.11.02
 * ==NOTES:=============================================
 * v1.0.0(2015.11.02):
 * 经项目实践,发现目前项目架构不适合调试使用,需要不断修改IO层,这样会对前\后端的开发带来不便,故决定使用此插件来解决问题
 * ---------------------------------------------------------------------------*/
(function(){
    var
        site ={
            website:'/', //站点地址
            staticWebsite: '/', // 前端服务器地址
            puiWebsite: '/resources/tool/pui2/'
        };


    _pw_apiData = {
        // 用户管理
        UserManagement: [
            // 员工管理--列表
            ['delEmployee', site.staticWebsite + 'mock/admin/employee-list.json', 'get', '删除员工'],
            ['convertEmployeeStatus', site.staticWebsite + 'mock/admin/employee-list.json', 'get', '转换员工的状态,即启用\停用互换'],
            ['sendEmployeeId', site.staticWebsite + 'mock/admin/employee-table.json', 'get', '获取当前员工的所管辖餐台,为气泡所用'],
            ['searchEmployee', site.staticWebsite + 'mock/admin/employee-list.json', 'get', '搜索当前角色下的员工'],
            // 员工管理--员工添加\编辑
            ['sendEmployeePhone', site.staticWebsite + 'mock/admin/hasEmployee.json', 'get', '判断员工的电话是否重复'],
            ['sendEmployeeUserName', site.staticWebsite + 'mock/admin/hasEmployee.json', 'get', '判断员工的用户命是否重复'],
            ['sendEmployeeNo', site.staticWebsite + 'mock/admin/hasEmployee.json', 'get', '判断员工的编号是否重复']
        ],
        //  后台登录
        Login:[
            ['getLogin', site.staticWebsite + 'mock/admin/login.json', 'get', '后台登录']
        ],
        // 基本信息管理
        BaseInfoManagement: [
            // 搜索风向标
            ['addOrder', site.staticWebsite + 'mock/admin/add-order.json', 'get', '添加风向标关键字'],
            ['delOrder', site.staticWebsite + 'mock/admin/del-order.json', 'get', '删除风向标关键字'],

            // 首页图片管理
            ['delImg', site.staticWebsite + 'mock/admin/del-order.json', 'get', '删除图片'],
            ['setImg', site.staticWebsite + 'mock/admin/del-order.json', 'get', '设置图片为首页'],
            ['delOrder', site.staticWebsite + 'mock/admin/del-order.json', 'get', '删除风向标关键字'],

            //打印机管理
            ['delPrinter',site.staticWebsite + 'mock/admin/del-printer.json', 'get', '删除打印机'],
            ['changePrinterType',site.staticWebsite + 'mock/admin/change-printer-type.json', 'get', '改变打印机类型']
        ],
        // 饭店管理
        RestaurantManagement:[
            //餐台管理--列表
            //table-management-list.html
            ['changeTableStatus', site.staticWebsite + 'mock/admin/login.json', 'get', '改变餐台状态（停用、恢复）'],
            ['delOneTable', site.staticWebsite + 'mock/admin/login.json', 'get', '删除单个餐台'],
            ['searchTable', site.staticWebsite + 'mock/admin/table-list.json', 'get','搜索餐台'],
            ['batchDelete', site.staticWebsite + 'mock/admin/login.json', 'get', '批量删除'],
            ['editSendId', site.staticWebsite + 'mock/admin/login.json', 'get', '编辑时发送餐台ID'],
            //餐台管理--添加\编辑
            //table-management-add.html
            ['sendTableName',site.staticWebsite + 'mock/admin/login.json','get','判断餐台名称是否重复'],

            //餐台区域管理
            ['saveNewArea', site.staticWebsite + 'mock/admin/save-new-area.json', 'get','保存新添加区域信息'],
            ['saveEditArea', site.staticWebsite + 'mock/admin/login.json', 'get','保存编辑原有区域信息结果'],
            ['delAreaId', site.staticWebsite + 'mock/admin/login.json', 'get', '删除餐台区域时，发送需删除的id'],

             //常用备注管理
            ['chooseRemarkBigTag', site.staticWebsite + 'mock/admin/remarks-management.json', 'get','选择备注大类渲染对应的列表内容'],
            ['delSmallClassify', site.staticWebsite + 'mock/admin/remark.json', 'get','删除备注小类'],
            ['addSmallClassify', site.staticWebsite + 'mock/admin/remark-add.json', 'get','增加备注小类'],
            ['editSmallClassify', site.staticWebsite + 'mock/admin/remark-edit.json', 'get','编辑备注小类'],
            ['delRemarkContentId', site.staticWebsite + 'mock/admin/remark.json', 'get','删除备注内容'],
            ['addRemarkContent', site.staticWebsite + 'mock/admin/remark-add.json', 'get','增加备注内容'],
            ['editRemarkContent', site.staticWebsite + 'mock/admin/remark-edit.json', 'get','编辑备注内容'],

            //餐段管理
            ['setCurrentPeriod', site.staticWebsite + 'mock/admin/login.json', 'get','设置当前餐段'],
            ['delPeriod', site.staticWebsite + 'mock/admin/login.json', 'get', '删除餐段'],
            ['getWeight', site.staticWebsite + 'mock/admin/periodRank.json', 'get', '添加餐段时获取默认排序'],
            ['changeStatus', site.staticWebsite + 'mock/admin/login.json', 'get', '改变状态'],
            ['saveEditItem', site.staticWebsite + 'mock/admin/login.json', 'get', '保存编辑项'],
            //呼叫类型管理
            ['delCall', site.staticWebsite + 'mock/admin/login.json', 'get', '删除呼叫类型'],
            ['getRank', site.staticWebsite + 'mock/admin/callRank.json', 'get', '添加呼叫类型时获取默认排序'],
            ['changeState', site.staticWebsite + 'mock/admin/login.json', 'get', '改变状态'],
            ['saveEditTerm', site.staticWebsite + 'mock/admin/login.json', 'get', '保存编辑项']
        ],
        // 库存管理
        StoreManagement: [
            // 供货商管理
            ['addSupplier',  site.staticWebsite + 'mock/admin/login.json', 'get','添加供货商'],
            ['editSupplier',  site.staticWebsite + 'mock/admin/login.json', 'get','编辑供货商'],
            ['delSupplier',  site.staticWebsite + 'mock/admin/login.json', 'get','删除供货商'],

            // 库存分类管理
            ['addStoreClassify', site.staticWebsite + 'mock/admin/login.json', 'get','添加库存分类'],
            ['editStoreClassify', site.staticWebsite + 'mock/admin/login.json', 'get','编辑库存分类'],
            ['delStoreClassify', site.staticWebsite + 'mock/admin/login.json', 'get','删除库存分类'],

            // 库存物品管理
            ['delStoreItem', site.staticWebsite + 'mock/admin/login.json', 'get','删除库存物品'],
            ['editStoreItemConversionRatio', site.staticWebsite + 'mock/admin/login.json', 'get','编辑换算比例'],
            ['getCostCardUnit', site.staticWebsite + 'mock/admin/get-cost-card-unit.json', 'get', '获取成本卡单位'],
            ['submitStorageItem', site.staticWebsite + 'mock/admin/submit-store-item.json', 'get', '提交添加的库存物品'],
            ['submitEditedStorageItem', site.staticWebsite + 'mock/admin/submit-edited-store-item.json', 'get', '提交编辑的库存物品'],
            ['getStorageUnitRelatedSettings', site.staticWebsite + 'mock/admin/get-storage-unit-related-settings.json', '获取库存预警、总数量'],

            //存放点管理
            ['delDepot', site.staticWebsite + 'mock/admin/del-depot.json', 'get', '删除存放点'],

            //结算中心管理
            ['getSettlementList', site.staticWebsite + 'mock/admin/settlement-list.json', 'get', '获取结算列表'],

            // 库存单据管理
            ['getMoney', site.staticWebsite + 'mock/admin/get-bill.json', 'get', '获取当前物品小计'],
            ['delStoreBill', site.staticWebsite + 'mock/admin/login.json', 'get', '删除库存单据'],
            ['addStoreBill', site.staticWebsite + 'mock/admin/login.json', 'get', '添加库存单据'],
            ['editStoreBill', site.staticWebsite + 'mock/admin/login.json', 'get', '编辑库存单据'],
            ['checkStoreBill', site.staticWebsite + 'mock/admin/login.json', 'get', '审核库存单据'],
            ['sendIngredientKeyword', site.staticWebsite + 'mock/admin/get-search-ingredient.json', 'get', '搜索原材料返回原材料信息'],
            ['checkEnableAdd', site.staticWebsite + 'mock/admin/check-enable-add.json', 'get', '验证是否能合理添加'],

            //原配料管理
            ['delIngredient', site.staticWebsite + 'mock/admin/del-ingredient.json', 'get', '删除原配料，发送当前原配料id'],
            ['hasName', site.staticWebsite + 'mock/admin/has-name.json', 'get', '判断原配料名称是否重复'],
            ['submitIngredient', site.staticWebsite + 'mock/admin/submit-ingredient.json', 'get', '提交添加的原配料'],
            ['submitEditIngredient', site.staticWebsite + 'mock/admin/submit-ingredient.json', 'get', '提交编辑页的原配料'],
            ['getRelatedSettings', site.staticWebsite + 'mock/admin/get-related-settings.json', 'get', '获取均价、结存、总数量'],
            
             //原配料管理
            ['inventory', site.staticWebsite + 'mock/admin/inventory-management.json', 'get', '库存盘点']
        ],
        // 菜品管理
        DishManagement: [
            // 单位管理--列表
            ['saveUnit', site.staticWebsite + 'mock/admin/save-unit.json', 'get', '编辑单位'],
            ['saveNewUnit', site.staticWebsite + 'mock/admin/save-unit.json', 'get', '添加单位'],
            ['delUnit', site.staticWebsite + 'mock/admin/login.json', 'get', '删除单位'],

            //菜品管理--列表
            ['delDish', site.staticWebsite + 'mock/admin/dish.json', 'get', '删除菜品'],
            ['changeDishStatus', site.staticWebsite + 'mock/admin/dish.json', 'get', '编辑菜品状态'],
            ['sendClassLinkage', site.staticWebsite + 'mock/admin/big-classify.json', 'get', '发送菜品分类id,获取菜品小分类'],
            //['getIngredient', site.staticWebsite + 'mock/admin/ingredient-list.json', 'get', '获取原材料'],
            //['delIngredient', site.staticWebsite + 'mock/admin/ingredient-list.json', 'get', '删除原材料'],
            //菜品管理--编辑菜品图片
            ['delPic', site.staticWebsite + 'mock/admin/dish.json', 'get', '删除菜品图片'],

            //菜品分类管理
            ['addClassify', site.staticWebsite + 'mock/admin/dish.json', 'get', '添加菜品分类'],
            ['editClassify', site.staticWebsite + 'mock/admin/dish.json', 'get', '编辑菜品分类'],
            ['delClassify', site.staticWebsite + 'mock/admin/dish.json', 'get', '删除菜品分类'],
            ['search', site.staticWebsite + 'mock/admin/dish-classify-list.json', 'get', '搜索菜品'],

            //今日特价
            ['revoteSpecials', site.staticWebsite + 'mock/admin/revote-specials.json', 'get', '撤销今日特价菜品'],
            ['selectDishClassifyOfSpecials', site.staticWebsite + 'mock/admin/today-specials-list.json', 'get','选择今日特价中的菜品分类'],
            ['sendSelectedDishOfSpecials',site.staticWebsite + 'mock/admin/send-specials-selected-dish.json', 'get','发送今日特价中的被选中的菜品'],

            //销量排行
            ['revoteSales', site.staticWebsite + 'mock/admin/revote-sales.json', 'get', '撤销销量排行菜品'],
            ['selectDishClassifyOfSales', site.staticWebsite + 'mock/admin/sales-ranking-list.json', 'get','选择销量排行中的菜品分类'],
            ['sendSelectedDishOfSales',site.staticWebsite + 'mock/admin/send-sales-selected-dish.json', 'get','发送销量排行中的被选中的菜品'],

            //本店特色
            ['revoteSpecialities', site.staticWebsite + 'mock/admin/revote-specialities.json', 'get', '撤销本店特色菜品'],
            ['selectDishClassifyOfSpecialities', site.staticWebsite + 'mock/admin/rest-specialities-list.json', 'get','选择本店特色中的菜品分类'],
            ['sendSelectedDishOfSpecialities',site.staticWebsite + 'mock/admin/send-specialities-selected-dish.json', 'get','发送本店特色中的被选中的菜品'],
             //菜品口味
            ['deleteTaste', site.staticWebsite + 'mock/admin/dish.json', 'get', '删除菜品口味'],
            ['saveEditTaste', site.staticWebsite + 'mock/admin/dish.json', 'get', '发送编辑的菜品口味'],
            ['saveAddTaste', site.staticWebsite + 'mock/admin/dish.json', 'get', '发送新添加的菜品口味'],

            // 套餐管理
            ['delPackageDish', site.staticWebsite + 'mock/admin/dish.json', 'get', '删除套餐'],
            ['changePackageDishStatus', site.staticWebsite + 'mock/admin/dish.json', 'get', '修改套餐状态'],
            ['getPackageDishTotalMoney', site.staticWebsite + 'mock/admin/dish.json', 'get', '获取套餐总金额'],
            // ['delDishInPackage', site.staticWebsite + 'mock/admin/dish.json', 'get', '删除套餐中的菜品'],
            // ['addDishInPackage', site.staticWebsite + 'mock/admin/dish.json', 'get', '添加套餐中的菜品'],
            ['getPackagePriceAndQuantity', site.staticWebsite + 'mock/admin/package-price-quantity.json', 'get', '更新当前套餐中已选菜品的总金额和数量'],
            //成本卡管理
            ['delCostCard', site.staticWebsite + 'mock/admin/del-plan.json', 'get', '删除成本卡'],
            ['getUnit', site.staticWebsite + 'mock/admin/get-unit.json', 'get', '选择原材料后返回原材料的单位'],
            ['getIngredientsName', site.staticWebsite + 'mock/admin/get-ingredient-list.json', 'get', '成本卡明细添加也页-获取相应的值,搜索选择，返回原材料信息'],
            ['afterAddIngredient', site.staticWebsite + 'mock/admin/get-price.json', 'get', '获取菜品成本卡的一些列成本'],
            ['afterEditIngredient', site.staticWebsite + 'mock/admin/get-price.json', 'get', '获取菜品成本卡的一些列成本'],
            ['delIngredient', site.staticWebsite + 'mock/admin/get-price.json', 'get', '删除原配料'],
            ['submitData', site.staticWebsite + 'mock/admin/href.json', 'get', '保存成本卡所有信息'],
            ['getPrice', site.staticWebsite + 'mock/admin/get-price.json', 'get','手动添加成本时，发送成本']
        ],
        // 权限管理
        AuthorityManagement:[
            //权限管理\启用、禁用权限
            ['sendAuthorityId',site.staticWebsite + 'mock/admin/change-authority.json','get','改变权限时，发送当前权限的id'],
            //权限组管理\删除权限组
            ['delAuthorityGroup',site.staticWebsite + 'mock/admin/del-authority-group.json','get','删除权限组时，发送当前权限组的id和当前用户的id'],

            //base-config.html
            ['saveAuthority', site.staticWebsite + 'mock/admin/save-authority.json', 'get','保存编辑后的权限'],
            ['saveNewAuthority',site.staticWebsite + 'mock/admin/save-authority.json','get','保存新添加的权限'],
            ['delAuthority', site.staticWebsite + 'mock/admin/login.json', 'get', '删除权限时，发送权限id'],

            //authority-group-list.html
            ['saveAuthorityGroup',site.staticWebsite + 'mock/admin/save-authority.json', 'get','保存编辑后的权限组'],
            ['saveNewAuthorityGroup',site.staticWebsite + 'mock/admin/save-authority.json', 'get','保存新添加的权限组'],
            ['deleteAuthorityGroup', site.staticWebsite + 'mock/admin/login.json','get','删除权限时，发送权限组id'],

            //authority-group-config.html
            ['delAuthorityOfGroup',site.staticWebsite + 'mock/admin/login.json','get','权限组配置页面，删除权限']
        ],
        //会员管理
        VipManagement:[
            //vip-dish-price-plan-management.html
            ['sendEditPlan', site.staticWebsite + 'mock/admin/login.json', 'get', '保存编辑后的方案'],
            ['delPlan', site.staticWebsite + 'mock/admin/login.json', 'get', '删除时发送ID'],
            //vip-dish-price-management.html
            ['sendSearchInfo', site.staticWebsite + 'mock/admin/vip-dish-price.json', 'get','搜索'],
            ['sendEditInfo', site.staticWebsite + 'mock/admin/login.json', 'get', '保存'],
            ['sendData', site.staticWebsite + 'mock/admin/login.json', 'get', '自动生成发送数据'],
            // 会员管理
            ['sendVipId', site.staticWebsite + 'mock/admin/change-vip-status.json', 'get', '改变会员状态时，发送会员id'],
            // 会员管理--列表--删除
            ['delVip', site.staticWebsite + 'mock/admin/del-vip.json', 'get', '删除会员时，发送会员id'],
            //会员管理--添加\编辑
            ['hasVip', site.staticWebsite + 'mock/admin/hasVip.json', 'get', '发送新添加会员的手机号，与数据库进行判重'],
            //多倍积分方案管理--删除
            ['delExsitedPlan', site.staticWebsite + 'mock/admin/del-plan.json', 'get', '删除多倍积分方案时，发送方案id'],
            //多倍积分方案管理--停用/启用
            ['sendModifiedPlan', site.staticWebsite + 'mock/admin/send-modified-plan.json', 'get', '停用、启用时，发送当前方案的id和status'],
            //多倍积分方案管理--新方案的“保存”
            ['sendAddedPlan', site.staticWebsite + 'mock/admin/send-added-plan.json', 'get', '保存新添加的方案时，发送方案内容，返回该方案的id'],
            //多倍积分方案管理--修改后的方案“保存”
            ['sendEditedPlan', site.staticWebsite + 'mock/admin/send-edited-plan.json', 'get', '保存修改后的方案时，发送方案内容'],
            //充值方案管理
            ['sendEditInfo', site.staticWebsite + 'mock/admin/login.json', 'get', '保存编辑数据'],
            ['sendAddInfo', site.staticWebsite + 'mock/admin/save-new-area.json', 'get', '保存新添数据'],
            ['delPlanId', site.staticWebsite + 'mock/admin/login.json', 'get', '发送删除数据id'],
            ['changeStatus', site.staticWebsite + 'mock/admin/login.json', 'get', '改变状态'],
            //会员等级页面 vip-grade-list.html
            ['delGrade', site.staticWebsite + 'mock/admin/login.json', 'get', '删除等级时发送id'],
            ['sendMinConsumption', site.staticWebsite + 'mock/admin/login.json', 'get', '填写最低消费时判断是否重复'],
            //会员账户信息管理--停用/启用
            ['changeAccountStatus', site.staticWebsite + 'mock/admin/change-account-status.json', '点击停用/启用时，发送当前账户的id和status'],
            //会员卡管理
            ['changeStatus', site.staticWebsite + 'mock/admin/vip-operator.json', 'get', '挂失、解挂时，发送当前会员卡的id和status'],
            ['delCardId', site.staticWebsite + 'mock/admin/login.json', 'get', 'ajax发送删除的会员卡id'],
            ['sendSaveInfo',site.staticWebsite + 'mock/admin/vip-operator.json', 'get', 'ajax发送会员卡id,修改的有效期和是否永久有效'],
            //会员积分管理
            ['sendStatus', site.staticWebsite + 'mock/admin/login.json', 'get','积分管理是否开启积分'],
            ['sendId', site.staticWebsite + 'mock/admin/login.json', 'get', '删除是发送Id']
        ],  
        // 营收统计
        Statistics: [
            //账单统计
            ['billAuditSum', site.staticWebsite + 'mock/admin/bill-audit-sum.json', 'get', '账单统计']
        ],
        // 公共模块
        Module: [
            ['mulSelectSearch', site.staticWebsite + 'mock/admin/search-item-list.json', 'get', '多选'],
            ['getAssistantCode', site.staticWebsite + 'mock/admin/get-assistantCode.json', 'get', '获取名称对应的助记码'],
            //['getName', site.staticWebsite + 'mock/admin/get-name-list.json', 'get', '获取相应的值,搜索选择'],
            ['getDishsName', site.staticWebsite + 'mock/admin/get-dish-list.json', 'get', '套餐添加页-获取相应的值,搜索选择，返回菜品信息'],
            ['getGoodsName', site.staticWebsite + 'mock/admin/get-goods-list.json', 'get', '库存单据管理页-获取相应的值,搜索选择，返回物品信息'],
            ['getDish', site.staticWebsite + 'mock/admin/get-dish-list-inCostCard.json', 'get', '成本卡添加页-搜索菜品，返回菜品信息'],
            ['getIngredient', site.staticWebsite + 'mock/admin/inventory-ingredient.json', 'get', '发送keyword，返回原材料信息']
        ]
    };
})();