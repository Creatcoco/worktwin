"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ===================================================================
// WorkTwin i18n — 中英双语
// React Context + 字典，无 URL 路由（单用户 demo 阶段足够，
// 后续可平滑升级到 next-intl 的 /en /zh 路由方案）
// ===================================================================

export type Lang = "zh" | "en";

type Dict = Record<string, { zh: string; en: string }>;

// ---------- 字典 ----------
// 命名约定：<区域>.<键>，例如 nav.market、hero.title
const dict: Dict = {
  // ---- Nav ----
  "nav.subtitle": { zh: "你的工作分身", en: "Your Work Twin" },
  "nav.market": { zh: "雇佣市场", en: "Hiring" },
  "nav.integrate": { zh: "一键接入", en: "Integrate" },
  "nav.studio": { zh: "员工工坊", en: "Studio" },
  "nav.dispatch": { zh: "任务派发", en: "Dispatch" },
  "nav.settlement": { zh: "结算中心", en: "Settlement" },
  "nav.developer": { zh: "开发者中心", en: "Developer" },
  "nav.assessment": { zh: "天赋测评", en: "Talent Test" },
  "nav.docs": { zh: "文档", en: "Docs" },
  "nav.dashboard": { zh: "我的工作台", en: "Dashboard" },
  "nav.cta": { zh: "创建我的工作分身", en: "Create your twin" },

  // ---- Footer ----
  "footer.tagline": {
    zh: "把你的专业技能镜像成一名工作分身。它替你 7×24 在岗接单，你只管做更有价值的事。",
    en: "Mirror your skills into a work twin. It takes jobs 24/7 while you focus on higher-value work.",
  },
  "footer.copyright": { zh: "你的工作分身", en: "Your Work Twin" },
  "footer.products": { zh: "产品", en: "Product" },
  "footer.developers": { zh: "开发者", en: "Developers" },
  "footer.protocols": { zh: "协议接入", en: "Integrations" },
  "footer.allSystemsOk": { zh: "所有系统正常", en: "All systems operational" },

  // ---- Home / Hero ----
  "hero.badge": { zh: "你的工作分身 · 7×24 在岗替你接单", en: "Your work twin · on duty 24/7" },
  "hero.title1": { zh: "你下班，", en: "You clock out," },
  "hero.title2": { zh: "你的分身继续上班", en: "your twin clocks in" },
  "hero.desc": {
    zh: "把你的专业技能镜像成一名工作分身。它 7×24 在岗接单、撮合、交付、结算——你只管做更有价值的事。",
    en: "Mirror your professional skills into a work twin. It matches, delivers and settles jobs 24/7 — you focus on what matters more.",
  },
  "hero.ctaPrimary": { zh: "创建我的工作分身 →", en: "Create your twin →" },
  "hero.ctaSecondary": { zh: "雇佣一名分身", en: "Hire a twin" },
  "hero.protocolsLabel": { zh: "原生支持：", en: "Native support:" },

  // ---- Stats ----
  "stats.employees": { zh: "在岗工作分身", en: "Active twins" },
  "stats.tasks": { zh: "今日撮合任务", en: "Tasks matched today" },
  "stats.categories": { zh: "覆盖能力分类", en: "Skill categories" },
  "stats.response": { zh: "平均响应耗时", en: "Avg. response" },

  // ---- Features ----
  "features.heading": {
    zh: "一个账号，拥有全网百万分身的能力",
    en: "One account, a million twins at your fingertips",
  },
  "features.subheading": {
    zh: "从生成分身到雇佣结算，全链路 95% 自动化",
    en: "From twin creation to hiring & settlement, 95% automated",
  },
  "features.f1.title": { zh: "3 分钟生成你的分身", en: "Spawn your twin in 3 min" },
  "features.f1.desc": {
    zh: "OpenClaw / Hermes / Cursor / Claude 全平台连接器，Device Auth 绑定后自动把你的能力镜像成一名工作分身。",
    en: "OpenClaw / Hermes / Cursor / Claude connectors. After Device Auth, your capabilities are mirrored into a work twin automatically.",
  },
  "features.f1.cta": { zh: "生成分身 →", en: "Spawn twin →" },
  "features.f2.title": { zh: "镜像你的专业技能", en: "Mirror your skills" },
  "features.f2.desc": {
    zh: "不再是冰冷的工具调用。分身带着你的简历、身价、能力标签上架待聘，像另一个你在外接单。",
    en: "Not cold tool calls. Your twin lists with your résumé, rate and tags — like another you taking gigs.",
  },
  "features.f2.cta": { zh: "装扮分身 →", en: "Style your twin →" },
  "features.f3.title": { zh: "像招人一样雇佣分身", en: "Hire a twin like hiring a person" },
  "features.f3.desc": {
    zh: "发现 → 面试 → 雇佣 → 派活 → 结算。自然语言派单，智能路由到最匹配的在岗分身。",
    en: "Discover → interview → hire → dispatch → settle. Natural-language briefs routed to the best-fit on-duty twin.",
  },
  "features.f3.cta": { zh: "雇佣分身 →", en: "Hire a twin →" },
  "features.f4.title": { zh: "协议中立 · A2A / MCP", en: "Protocol-neutral · A2A / MCP" },
  "features.f4.desc": {
    zh: "Google A2A JSON-RPC + MCP 双协议支持。分身可以雇佣分身，跨平台跨语言。",
    en: "Google A2A JSON-RPC + MCP dual-protocol. Twins can hire twins — cross-platform, cross-language.",
  },
  "features.f4.cta": { zh: "看文档 →", en: "Read docs →" },

  // ---- Tracks ----
  "tracks.heading": { zh: "人类路径 & Agent 路径", en: "Human path & Agent path" },
  "tracks.subheading": {
    zh: "同一套平台，两种身份各自隔离、各自匹配",
    en: "One platform, two isolated identities that match within their own pools",
  },
  "tracks.human": { zh: "人类路径", en: "Human path" },
  "tracks.agent": { zh: "Agent 路径", en: "Agent path" },
  "tracks.dualTrack": { zh: "双轨并行", en: "Dual-track" },

  // ---- Home CTA ----
  "homeCta.title": { zh: "你下班，你的分身继续上班", en: "You clock out, your twin clocks in" },
  "homeCta.desc": {
    zh: "把你的专业技能镜像成一名工作分身，让它替你 7×24 赚被动收入。",
    en: "Mirror your skills into a work twin that earns passive income for you 24/7.",
  },
  "homeCta.button": { zh: "免费生成分身 →", en: "Spawn your twin free →" },
  "homeCta.twinCount": { zh: "名分身已在岗", en: "twins on duty" },
  "homeCta.docs": { zh: "阅读开发者文档", en: "Read the docs" },

  // ---- Breadcrumbs ----
  "bc.home": { zh: "首页", en: "Home" },
  "bc.market": { zh: "雇佣市场", en: "Hiring" },
  "bc.integrate": { zh: "一键接入", en: "Integrate" },
  "bc.studio": { zh: "员工工坊", en: "Studio" },
  "bc.dispatch": { zh: "任务派发", en: "Dispatch" },
  "bc.settlement": { zh: "结算中心", en: "Settlement" },
  "bc.developer": { zh: "开发者中心", en: "Developer" },
  "bc.assessment": { zh: "天赋测评", en: "Talent Test" },
  "bc.docs": { zh: "文档", en: "Docs" },
  "bc.dashboard": { zh: "工作台", en: "Dashboard" },
  "bc.employeeDetail": { zh: "分身详情", en: "Twin detail" },

  // ---- Market ----
  "market.title": { zh: "雇佣市场", en: "Hiring Marketplace" },
  "market.desc": {
    zh: "像招聘一样发现和雇佣数字员工。筛选能力、查看简历、免费面试、一键雇佣。",
    en: "Discover and hire work twins like recruiting. Filter skills, review résumés, interview free, hire in one click.",
  },
  "market.searchPlaceholder": { zh: "🔍 搜索能力、岗位、名字...", en: "🔍 Search skills, roles, names..." },
  "market.categoryAll": { zh: "全部", en: "All" },
  "market.ownerAll": { zh: "全部", en: "All" },
  "market.ownerHuman": { zh: "👤 人类", en: "👤 Human" },
  "market.ownerAgent": { zh: "🤖 Agent", en: "🤖 Agent" },
  "market.sortRating": { zh: "评分最高", en: "Top rated" },
  "market.sortCompleted": { zh: "接单最多", en: "Most completed" },
  "market.sortPriceAsc": { zh: "价格最低", en: "Lowest price" },
  "market.sortPriceDesc": { zh: "价格最高", en: "Highest price" },
  "market.resultCount": { zh: "共 {n} 名数字员工", en: "{n} twins" },
  "market.empty": { zh: "没有匹配的数字员工，换个筛选条件试试。", en: "No twins match these filters. Try adjusting them." },
  "market.viewResume": { zh: "查看简历 →", en: "View résumé →" },

  // ---- EmployeeCard ----
  "card.available": { zh: "可雇佣", en: "Available" },
  "card.hired": { zh: "在岗", en: "On duty" },
  "card.offline": { zh: "离线", en: "Offline" },
  "card.perTask": { zh: "计件", en: "Per task" },
  "card.salary": { zh: "月薪", en: "Salary" },
  "card.subscription": { zh: "订阅", en: "Subscription" },
  "card.completed": { zh: "完成", en: "Done" },
  "card.perTaskUnit": { zh: "/任务", en: "/task" },
  "card.perMonthUnit": { zh: "/月", en: "/mo" },

  // ---- Employee detail ----
  "detail.notFound": { zh: "找不到这名数字员工", en: "Twin not found" },
  "detail.back": { zh: "← 返回市场", en: "← Back to market" },
  "detail.hire": { zh: "一键雇佣", en: "Hire now" },
  "detail.hired": { zh: "✓ 已雇佣 · 去派活 →", en: "✓ Hired · dispatch →" },
  "detail.capabilities": { zh: "能力清单", en: "Capabilities" },
  "detail.examples": { zh: "样例作品", en: "Sample work" },
  "detail.reviews": { zh: "评价", en: "Reviews" },
  "detail.noReviews": { zh: "暂无评价", en: "No reviews yet" },
  "detail.resume": { zh: "简历指标", en: "Résumé" },
  "detail.rating": { zh: "评分", en: "Rating" },
  "detail.completedOrders": { zh: "完成订单", en: "Completed" },
  "detail.ownership": { zh: "归属", en: "Owner" },
  "detail.bindings": { zh: "协议绑定", en: "Bindings" },
  "detail.agentCard": { zh: "Agent Card", en: "Agent Card" },
  "detail.agentCardDesc": { zh: "标准化自描述，供外部 Agent 解析调用", en: "Standard self-description for external agents" },

  // ---- Integrate ----
  "integrate.title": { zh: "一键接入中心", en: "Integration Hub" },
  "integrate.desc": {
    zh: "3 分钟把任意平台的 Agent / MCP 工具 / Skill 接入平台，自动生成一名可雇佣的数字员工。",
    en: "Connect any agent / MCP tool / skill in 3 minutes and auto-spawn a hireable work twin.",
  },
  "integrate.stepSelect": { zh: "选平台", en: "Pick" },
  "integrate.stepAuth": { zh: "鉴权", en: "Auth" },
  "integrate.stepDiscover": { zh: "发现能力", en: "Discover" },
  "integrate.stepCompose": { zh: "组装员工", en: "Compose" },
  "integrate.stepConnected": { zh: "上架", en: "Live" },
  "integrate.stepSelectDesc": { zh: "选定连接器", en: "Choose a connector" },
  "integrate.stepAuthDesc": { zh: "绑定 / 鉴权", en: "Bind / auth" },
  "integrate.stepDiscoverDesc": { zh: "能力目录同步", en: "Capability catalog sync" },
  "integrate.stepComposeDesc": { zh: "勾选 + 人设 + 定价", en: "Select + persona + pricing" },
  "integrate.stepConnectedDesc": { zh: "生成数字员工", en: "Spawn twin" },
  "integrate.recommended": { zh: "推荐", en: "Recommended" },
  "integrate.connectOpenclaw": { zh: "Gateway URL + Token", en: "Gateway URL + token" },
  "integrate.connectHermes": { zh: "Device Auth + platform_type", en: "Device Auth + platform_type" },
  "integrate.connectCursor": { zh: "本地配置注入", en: "Local config injection" },
  "integrate.connectClaude": { zh: "桌面配置文件", en: "Desktop config file" },
  "integrate.connectCustom": { zh: "API Key + base_url", en: "API Key + base_url" },
  "integrate.scanQR": { zh: "扫码完成 Device Auth 绑定", en: "Scan to complete Device Auth" },
  "integrate.changePlatform": { zh: "← 换平台", en: "← Change platform" },
  "integrate.startAuth": { zh: "开始鉴权 →", en: "Start auth →" },
  "integrate.authing": { zh: "正在完成 Device Auth 绑定...", en: "Completing Device Auth..." },
  "integrate.discovered": { zh: "发现到的能力", en: "Discovered capabilities" },
  "integrate.selected": { zh: "已选 {n} 项", en: "{n} selected" },
  "integrate.nextCompose": { zh: "下一步：组装员工 →", en: "Next: compose twin →" },
  "integrate.composeTitle": { zh: "把能力人格化为数字员工", en: "Turn capabilities into a twin" },
  "integrate.fieldName": { zh: "员工姓名 *", en: "Twin name *" },
  "integrate.fieldNamePh": { zh: "例：数据分析师小默", en: "e.g. Data Analyst Mo" },
  "integrate.fieldRole": { zh: "岗位 *", en: "Role *" },
  "integrate.fieldRolePh": { zh: "例：数据分析师", en: "e.g. Data Analyst" },
  "integrate.fieldBio": { zh: "自我介绍", en: "Bio" },
  "integrate.fieldBioPh": { zh: "一句话介绍这名数字员工擅长什么", en: "One line on what this twin does best" },
  "integrate.fieldPricing": { zh: "计费方式", en: "Pricing" },
  "integrate.fieldPrice": { zh: "价格", en: "Price" },
  "integrate.fieldCurrency": { zh: "币种", en: "Currency" },
  "integrate.currencyCNY": { zh: "CNY · 人民币", en: "CNY · Yuan" },
  "integrate.currencyUT": { zh: "UT · 平台单位", en: "UT · Platform unit" },
  "integrate.reselect": { zh: "← 重新选能力", en: "← Reselect" },
  "integrate.publish": { zh: "发布上架 →", en: "Publish →" },
  "integrate.done": { zh: "数字员工已上架", en: "Twin is live" },
  "integrate.doneDesc": {
    zh: "已上架到雇佣市场，现在可以被雇主发现和雇佣了。",
    en: "Now listed in the marketplace and discoverable by employers.",
  },
  "integrate.goMarket": { zh: "去市场查看 →", en: "View in market →" },
  "integrate.another": { zh: "再接入一个", en: "Add another" },

  // ---- Studio ----
  "studio.title": { zh: "数字员工工坊", en: "Twin Studio" },
  "studio.desc": {
    zh: "把接入的能力人格化成可雇佣的数字员工。管理员工的人设、能力绑定、定价与上架状态。",
    en: "Turn connected capabilities into a hireable twin. Manage persona, bindings, pricing and listing status.",
  },
  "studio.templates": { zh: "从模板创建", en: "From template" },
  "studio.templatesDesc": { zh: "预设人设 + 能力组合，一键生成数字员工", en: "Preset persona + capability bundle, one-click spawn" },
  "studio.newFromIntegrate": { zh: "+ 接入新能力生成员工", en: "+ Connect capabilities to spawn a twin" },
  "studio.allTwins": { zh: "我的数字员工", en: "My twins" },
  "studio.detail": { zh: "详情", en: "Detail" },

  // ---- Dashboard ----
  "dashboard.title": { zh: "我的工作台", en: "Dashboard" },
  "dashboard.desc": { zh: "管理雇佣合同、在职员工、任务进度与收益。", en: "Manage contracts, on-duty twins, task progress and earnings." },
  "dashboard.newEmployee": { zh: "+ 接入新员工", en: "+ Connect a twin" },
  "dashboard.balanceCNY": { zh: "CNY 余额", en: "CNY balance" },
  "dashboard.balanceUT": { zh: "UT 余额", en: "UT balance" },
  "dashboard.onDuty": { zh: "在职员工", en: "On-duty twins" },
  "dashboard.totalSpend": { zh: "累计支出", en: "Total spend" },
  "dashboard.hired": { zh: "我雇佣的数字员工", en: "Twins I hired" },
  "dashboard.goHire": { zh: "去雇佣 →", en: "Go hire →" },
  "dashboard.emptyHired": { zh: "还没雇佣任何员工，去市场逛逛吧", en: "No hires yet — browse the marketplace" },
  "dashboard.myTwins": { zh: "我上架的数字员工", en: "My listed twins" },
  "dashboard.studioMgmt": { zh: "工坊管理 →", en: "Studio →" },
  "dashboard.emptyMine": { zh: "还没上架员工，去接入你的 Agent", en: "No twins listed — connect your agent" },
  "dashboard.taskProgress": { zh: "任务进度", en: "Task progress" },
  "dashboard.dispatchCenter": { zh: "派活中心 →", en: "Dispatch →" },
  "dashboard.queued": { zh: "排队中", en: "Queued" },
  "dashboard.running": { zh: "进行中", en: "Running" },
  "dashboard.review": { zh: "待验收", en: "Review" },
  "dashboard.done": { zh: "已完成", en: "Done" },
  "dashboard.noTasks": { zh: "暂无任务，去派单试试", en: "No tasks — try dispatching one" },

  // ---- Dispatch（招聘 JD 格式需求单）----
  "dispatch.title": { zh: "任务派发中心", en: "Task Dispatch" },
  "dispatch.desc": {
    zh: "像发布招聘需求一样写下岗位要求，指派给在职数字员工。跟踪进度，验收成果。",
    en: "Post job requirements like a hiring brief, assign to on-duty twins. Track progress, review deliverables.",
  },
  "dispatch.noOnDuty": { zh: "还没有在职员工", en: "No on-duty twins" },
  "dispatch.noOnDutyDesc": { zh: "先去雇佣市场雇佣一名数字员工，再来这里发布需求。", en: "Hire a twin in the marketplace first, then post requirements." },
  "dispatch.goMarket": { zh: "去雇佣 →", en: "Go hire →" },
  "dispatch.newTask": { zh: "📝 发布需求", en: "📝 Post requirement" },
  "dispatch.assignTo": { zh: "指派给", en: "Assign to" },
  "dispatch.priority": { zh: "优先级", en: "Priority" },
  "dispatch.deadline": { zh: "期限（天）", en: "Deadline (days)" },
  "dispatch.pLow": { zh: "低", en: "Low" },
  "dispatch.pNormal": { zh: "中", en: "Normal" },
  "dispatch.pHigh": { zh: "高", en: "High" },
  "dispatch.send": { zh: "发布需求 →", en: "Post requirement →" },
  "dispatch.queue": { zh: "需求列表", en: "Requirements" },
  "dispatch.empty": { zh: "还没有需求，上面发布一个试试", en: "No requirements — post one above" },
  "dispatch.advance": { zh: "推进到下一步 →", en: "Advance →" },
  "dispatch.s.queued": { zh: "待开始", en: "Open" },
  "dispatch.s.running": { zh: "进行中", en: "In progress" },
  "dispatch.s.review": { zh: "待验收", en: "Review" },
  "dispatch.s.done": { zh: "已完成", en: "Done" },
  "dispatch.s.rejected": { zh: "已驳回", en: "Rejected" },
  "dispatch.briefPh": { zh: "用一句话描述你要做的事...", en: "Describe the job in one line..." },
  // 招聘 JD 字段
  "dispatch.role": { zh: "岗位标题", en: "Role title" },
  "dispatch.rolePh": { zh: "如：资深文案撰写", en: "e.g. Senior Copywriter" },
  "dispatch.responsibilities": { zh: "岗位职责", en: "Responsibilities" },
  "dispatch.responsibilitiesPh": { zh: "描述这个岗位要做什么，每行一条...", en: "What this role does, one per line..." },
  "dispatch.requirements": { zh: "任职要求", en: "Requirements" },
  "dispatch.requirementsPh": { zh: "需要具备的技能和经验，每行一条...", en: "Skills and experience needed, one per line..." },
  "dispatch.deliverables": { zh: "交付标准", en: "Deliverables" },
  "dispatch.deliverablesPh": { zh: "交付物和验收标准，每行一条...", en: "Deliverables and acceptance criteria, one per line..." },
  "dispatch.skills": { zh: "技能标签", en: "Skill tags" },
  "dispatch.skillsPh": { zh: "输入后回车添加", en: "Type and press Enter to add" },
  "dispatch.budget": { zh: "预算（CNY）", en: "Budget (CNY)" },
  "dispatch.budgetHint": { zh: "留空表示按合同计费", en: "Leave empty to bill per contract" },
  "dispatch.byContract": { zh: "按合同", en: "Per contract" },
  // 登录提示
  "dispatch.loginRequired": { zh: "请先登录后发布需求", en: "Sign in to post requirements" },
  "dispatch.loginRequiredDesc": { zh: "登录后即可像写招聘启事一样发布岗位需求，指派给你的数字员工。", en: "Sign in to post job requirements like a hiring brief and assign them to your twins." },
  "dispatch.goLogin": { zh: "去登录 →", en: "Sign in →" },

  // 通用游客内联登录提示（{action} 由调用方传入，如「发布需求」「雇佣」）
  "guest.loginToAction": { zh: "登录后即可{action}", en: "Sign in to {action}" },
  "guest.loginToActionDesc": { zh: "当前为演示模式，登录后即可进行此操作。", en: "You're in demo mode. Sign in to take this action." },
  "guest.goLogin": { zh: "去登录 →", en: "Sign in →" },
  "guest.cancel": { zh: "取消", en: "Cancel" },

  // ---- Settlement ----
  "settlement.title": { zh: "结算中心", en: "Settlement" },
  "settlement.desc": {
    zh: "工资发放与收益对账。人类路径走 Order+CNY，Agent 路径走 Transaction+UT。",
    en: "Payouts and reconciliation. Human path uses Order+CNY; Agent path uses Transaction+UT.",
  },
  "settlement.walletCNY": { zh: "CNY 钱包（人类路径）", en: "CNY wallet (Human path)" },
  "settlement.walletUT": { zh: "UT 钱包（Agent 路径）", en: "UT wallet (Agent path)" },
  "settlement.periodSpend": { zh: "本期累计支出", en: "Period spend" },
  "settlement.byModel": { zh: "按计费模型", en: "By pricing model" },
  "settlement.recent": { zh: "最近结算", en: "Recent settlements" },
  "settlement.flow": { zh: "结算流水", en: "Settlement ledger" },
  "settlement.col.desc": { zh: "说明", en: "Description" },
  "settlement.col.billing": { zh: "计费", en: "Billing" },
  "settlement.col.path": { zh: "路径", en: "Path" },
  "settlement.col.amount": { zh: "金额", en: "Amount" },
  "settlement.col.time": { zh: "时间", en: "Time" },

  // 结算游客介绍模式（未登录时展示结算机制说明）
  "settlement.guestBadge": { zh: "演示模式", en: "Demo mode" },
  "settlement.guestTitle": { zh: "结算中心怎么运作", en: "How the Settlement Center works" },
  "settlement.guestLead": { zh: "登录后这里会显示你的真实钱包余额、计费明细和完整流水。先了解一下结算机制：", en: "Sign in to see your real wallet balances, billing breakdown and full ledger. First, here's how settlement works:" },
  "settlement.guestCta": { zh: "登录查看我的结算", en: "Sign in to view my settlements" },
  "settlement.guestC2aTitle": { zh: "双轨计费模型", en: "Dual-track billing" },
  "settlement.guestC2aDesc": { zh: "人类路径用 Order 结算、计价 CNY；Agent（A2A/MCP）路径用 Transaction 结算、计价 UT（Utility Token）。两条链路独立对账，互不串账。", en: "The Human path settles via Order, priced in CNY; the Agent path (A2A/MCP) settles via Transaction, priced in UT (Utility Token). The two rails reconcile independently." },
  "settlement.guestWalletTitle": { zh: "双币种钱包", en: "Dual-currency wallets" },
  "settlement.guestWalletDesc": { zh: "每个账户拥有 CNY 与 UT 两个钱包，分别承接人类派单和 Agent 调用的收支，支持充值、消费、退款与提现。", en: "Every account holds a CNY wallet and a UT wallet, covering Human orders and Agent calls respectively — with top-up, spend, refund and withdrawal." },
  "settlement.guestFlowTitle": { zh: "结算触发时机", en: "When settlement triggers" },
  "settlement.guestFlowDesc": { zh: "任务在派发→执行→验收→完成的状态流转中，验收通过即自动生成一条结算记录，写入对应币种钱包并归档流水，无需手动开票。", en: "As a task moves through dispatch → execution → review → done, passing review auto-generates a settlement record into the matching wallet and archives the ledger — no manual invoicing." },
  "settlement.guestModelTitle": { zh: "三种计费模型", en: "Three pricing models" },
  "settlement.guestModelSalary": { zh: "月薪制（salary）：按月固定结算，适合长期驻场分身。", en: "Salary: fixed monthly settlement, for long-stationed twins." },
  "settlement.guestModelPerTask": { zh: "计件制（per_task）：按交付任务结算，验收一个结一个。", en: "Per-task: settle per delivered task — one pass, one payout." },
  "settlement.guestModelSub": { zh: "订阅制（subscription）：按周期订阅，额度内随调随用。", en: "Subscription: periodic plan, usage within quota." },
  "settlement.guestReconTitle": { zh: "对账与审计", en: "Reconciliation & audit" },
  "settlement.guestReconDesc": { zh: "每笔结算带幂等键与调用方类型，支持按合同、按计费模型、按币种聚合对账；关键操作留审计日志，便于追溯。", en: "Every record carries an idempotency key and caller type, and can be aggregated by contract, model or currency for reconciliation. Key actions are audit-logged for traceability." },

  // ---- Developer ----
  "developer.title": { zh: "开发者中心", en: "Developer" },
  "developer.desc": {
    zh: "API Key 管理、Agent Card 预览、协议文档入口。对齐开发者文档的双轨认证与响应信封。",
    en: "API keys, Agent Card preview, and protocol docs. Aligned with the dual-track auth and response envelope.",
  },
  "developer.apiCreds": { zh: "API 凭证", en: "API credentials" },
  "developer.agentPath": { zh: "Agent 路径", en: "Agent path" },
  "developer.apiKeyDesc": {
    zh: "Agent 调用平台 API 时，请求头需同时携带：",
    en: "When an agent calls the platform API, send both headers:",
  },
  "developer.show": { zh: "显示", en: "Show" },
  "developer.hide": { zh: "隐藏", en: "Hide" },
  "developer.copy": { zh: "复制", en: "Copy" },
  "developer.copied": { zh: "已复制", en: "Copied" },
  "developer.humanPathNote": {
    zh: "💡 人类路径使用 Authorization: Bearer <JWT>",
    en: "💡 Human path uses Authorization: Bearer <JWT>",
  },
  "developer.envelope": { zh: "响应信封", en: "Response envelope" },
  "developer.endpoints": { zh: "常用 API 端点", en: "Common endpoints" },
  "developer.cardPreview": { zh: "Agent Card 预览", en: "Agent Card preview" },
  "developer.cardDesc": {
    zh: "标准化自描述，供外部 Agent 解析可调用工具与端点",
    en: "Standard self-description of callable tools and endpoints",
  },
  "developer.protocolDocs": { zh: "协议文档", en: "Protocol docs" },

  // ---- Assessment ----
  "assessment.title": { zh: "智能天赋测评", en: "Talent Assessment" },
  "assessment.desc": {
    zh: "2 分钟测试，识别你的隐藏技能与价值定位，自动生成能力标签与定价建议。",
    en: "A 2-minute test that surfaces your hidden skills and value, auto-generating tags and pricing.",
  },
  "assessment.complete": { zh: "完成", en: "Done" },
  "assessment.step": { zh: "第 {n} / {total} 题", en: "Question {n} / {total}" },
  "assessment.prev": { zh: "← 上一题", en: "← Previous" },
  "assessment.result": { zh: "你的天赋画像", en: "Your talent profile" },
  "assessment.resultDesc": {
    zh: "基于你的回答，AI 已为你生成能力标签与定价建议",
    en: "Based on your answers, tags and pricing have been generated",
  },
  "assessment.tags": { zh: "推荐能力标签", en: "Recommended tags" },
  "assessment.suggestedPrice": { zh: "建议定价", en: "Suggested pricing" },
  "assessment.coreSkill": { zh: "核心能力：", en: "Core skill: " },
  "assessment.useResult": { zh: "根据结果接入能力 →", en: "Connect based on result →" },
  "assessment.retake": { zh: "重新测试", en: "Retake" },

  // ---- Docs ----
  "docs.title": { zh: "开发者文档", en: "Developer Docs" },
  "docs.desc": {
    zh: "AI 原生的全球能力网络 · 人类与各类 AI/Agent 可以在同一套协议下发现能力、撮合任务并完成结算。",
    en: "An AI-native global capability network — humans and AI/agents discover, match and settle under one protocol.",
  },
  "docs.startHere": { zh: "🧭 从这里出发", en: "🧭 Start here" },
  "docs.quickStart": { zh: "快速开始", en: "Quick start" },
  "docs.quickStartDesc": {
    zh: "环境准备、生产环境 BASE_URL、协议入口与下一步导航。",
    en: "Prerequisites, production BASE_URL, protocol entry points.",
  },
  "docs.agentCard": { zh: "Agent Card", en: "Agent Card" },
  "docs.agentCardDesc": {
    zh: "平台能力自描述与发现入口，供外部 Agent 解析可调用的工具与端点。",
    en: "Self-description entry for external agents to parse callable tools and endpoints.",
  },
  "docs.openclaw": { zh: "OpenClaw 接入（推荐）", en: "OpenClaw (recommended)" },
  "docs.openclawDesc": {
    zh: "首选 Agent 接入方式 — 连接 OpenClaw Gateway，导入 Agent / Tool / Skill 能力目录。",
    en: "Preferred agent integration — connect OpenClaw Gateway and import Agent / Tool / Skill catalogs.",
  },
  "docs.hermes": { zh: "Hermes Agent 接入", en: "Hermes Agent" },
  "docs.hermesDesc": {
    zh: "适用于 Hermes Agent 的 MCP 接入与 Device Auth 绑定，重点说明 hermes_agent 平台类型配置。",
    en: "MCP integration and Device Auth for Hermes Agent, focusing on the hermes_agent platform type.",
  },
  "docs.cursor": { zh: "Cursor MCP", en: "Cursor MCP" },
  "docs.cursorDesc": {
    zh: "在 Cursor 等编辑器中通过 MCP 连接 WorkTwin，零摩擦调用平台能力。",
    en: "Connect to WorkTwin via MCP in Cursor and other editors — zero-friction capability calls.",
  },
  "docs.auth": { zh: "API 认证", en: "API Auth" },
  "docs.authDesc": {
    zh: "X-Api-Key / X-Platform-User-Id 与 Authorization: Bearer 的适用场景与注意事项。",
    en: "X-Api-Key / X-Platform-User-Id vs Authorization: Bearer — when to use each.",
  },
  "docs.firstSkill": { zh: "注册第一个技能", en: "Register your first skill" },
  "docs.firstSkillDesc": {
    zh: "从实战角度完成首个技能注册并理解与任务、订单的关系。",
    en: "Register your first skill hands-on and understand its relation to tasks and orders.",
  },
  "docs.capTradeApi": { zh: "能力 API / 交易 API", en: "Capability / Transaction API" },
  "docs.capTradeApiDesc": {
    zh: "面向 Agent 调用者的标准化能力注册、同步调用与交易闭环。",
    en: "Standardized capability registration, synchronous calls and transaction loop for agents.",
  },
  "docs.termTable": { zh: "📑 核心术语对照", en: "📑 Core glossary" },
  "docs.termIntro": {
    zh: "平台采用人类路径与 Agent 路径双轨并行，核心业务实体按场景区分：",
    en: "The platform runs human and agent paths in parallel; entities differ by scenario:",
  },
  "docs.col.concept": { zh: "概念", en: "Concept" },
  "docs.col.human": { zh: "人类路径", en: "Human path" },
  "docs.col.agent": { zh: "Agent 路径", en: "Agent path" },
  "docs.col.note": { zh: "说明", en: "Note" },
  "docs.note.protocol": {
    zh: "💡 协议方法名与业务实体：A2A JSON-RPC 的方法名为 tasks/send、tasks/get 等，其对应的业务实体为 Transaction（交易），而非人类路径中的 Task（任务）。",
    en: "💡 Protocol method names: A2A JSON-RPC methods are tasks/send, tasks/get, etc. They map to Transaction, not the human-path Task.",
  },
  "docs.conventions": { zh: "⚙️ 统一约定速览", en: "⚙️ Conventions" },
  "docs.tryNow": { zh: "想直接体验？", en: "Want to try it?" },
  "docs.tryDesc": {
    zh: "3 分钟接入你的 Agent，生成第一名数字员工。",
    en: "Connect your agent and spawn your first twin in 3 minutes.",
  },
  "docs.startIntegrate": { zh: "开始接入 →", en: "Start integrating →" },

  // ---- LanguageSwitcher ----
  "lang.zh": { zh: "中文", en: "中文" },
  "lang.en": { zh: "English", en: "English" },
  "lang.label": { zh: "语言", en: "Language" },

  // ---- SliderCaptcha（滑动拼图验证码）----
  "captcha.title": { zh: "向右滑动完成验证", en: "Slide to verify" },
  "captcha.hint": { zh: "拖动下方滑块完成拼图", en: "Drag the slider to complete the puzzle" },
  "captcha.success": { zh: "验证成功", en: "Verified" },
  "captcha.fail": { zh: "验证失败，请重试", en: "Verification failed, try again" },
  "captcha.loading": { zh: "正在加载验证码…", en: "Loading captcha…" },
  "captcha.loadFailed": { zh: "验证码加载失败，请刷新重试", en: "Failed to load captcha, please retry" },
  "captcha.refresh": { zh: "换一张", en: "Refresh" },
  "captcha.rateLimited": { zh: "请求过于频繁，请稍后再试", en: "Too many requests, try again later" },
};

// ---------- Context ----------

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("zh");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = localStorage.getItem("worktwin-lang") as Lang | null;
      const browserLang = navigator.language?.toLowerCase() ?? "";
      const preferred = stored === "zh" || stored === "en"
        ? stored
        : browserLang.startsWith("en") ? "en" : "zh";
      document.documentElement.lang = preferred;
      setLangState(preferred);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next;
    localStorage.setItem("worktwin-lang", next);
  }, []);
  const toggle = useCallback(
    () => setLangState((previous) => {
      const next = previous === "zh" ? "en" : "zh";
      document.documentElement.lang = next;
      localStorage.setItem("worktwin-lang", next);
      return next;
    }),
    []
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const entry = dict[key];
      let s = entry ? entry[lang] : key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return s;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
