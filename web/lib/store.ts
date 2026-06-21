import type {
  CapabilityKind,
  Currency,
  DigitalEmployee,
  EmploymentContract,
  TaskOrder,
  Settlement,
  User,
  Capability,
  IntegrationDraft,
  PlatformKind,
  PricingModel,
} from '@/types';

// ===================================================================
// WorkTwin Mock 数据层（P1 MVP）
// 内存存储 + 种子数据，重启后重置；对齐开发者文档响应信封
// ===================================================================

const now = Math.floor(Date.now() / 1000);

// ---------- 种子：能力清单 ----------

const capDataAnalyst: Capability = {
  id: 'cap_data_analysis',
  kind: 'skill',
  name: '数据分析',
  description: '清洗、统计、可视化、报告生成，支持 Excel / CSV / SQL 数据源。',
  category: '数据分析',
};
const capTranslation: Capability = {
  id: 'cap_translation',
  kind: 'skill',
  name: '多语种翻译',
  description: '中英日韩等 12 种语言互译，保留专业术语与语气。',
  category: '翻译',
};
const capDesign: Capability = {
  id: 'cap_design',
  kind: 'mcp_tool',
  name: 'UI 设计稿生成',
  description: '从需求描述生成 Figma 可编辑的设计稿，含组件库。',
  category: '设计',
};
const capCodeReview: Capability = {
  id: 'cap_code_review',
  kind: 'a2a_endpoint',
  name: '代码审查',
  description: 'A2A 协议接入，自动 review PR 并给出修复建议。',
  category: '开发',
};
const capWriting: Capability = {
  id: 'cap_writing',
  kind: 'skill',
  name: '文案写作',
  description: '公众号、小红书、SEO 文章、品牌 slogan 一站式产出。',
  category: '写作',
};
const capSeo: Capability = {
  id: 'cap_seo',
  kind: 'skill',
  name: 'SEO 优化',
  description: '关键词分析、站内优化方案、外链建设策略。',
  category: '营销',
};
const capCustomerService: Capability = {
  id: 'cap_cs',
  kind: 'mcp_tool',
  name: '智能客服',
  description: '7×24 多轮对话，工单自动流转，支持知识库接入。',
  category: '客服',
};
const capDev: Capability = {
  id: 'cap_fullstack_dev',
  kind: 'skill_pack',
  name: '全栈开发套件',
  description: '前后端代码生成、API 设计、数据库建模、部署脚本。',
  category: '开发',
};

// ---------- 种子：数字员工 ----------

export const seedEmployees: DigitalEmployee[] = [
  {
    id: 'emp_xiaomo',
    name: '数据分析师小默',
    avatar: '📊',
    role: '数据分析师',
    title: '5 年经验 · 曾就职头部互联网',
    bio: '擅长从杂乱数据里挖出商业洞察，交付的可视化报告老板都看得懂。',
    ownerId: 'u_chenmo',
    ownerName: '陈默',
    ownerType: 'human',
    capabilities: [capDataAnalyst, capSeo],
    resume: {
      rating: 4.9,
      completedCount: 312,
      examples: ['某电商大促复盘报告', '用户留存归因分析', '竞品价格监测仪表盘'],
      reviews: [
        { id: 'r1', fromUserId: 'u_boss', fromName: '李总', rating: 5, comment: '报告清晰，结论直接可用。', createdAt: now - 86400 * 3 },
        { id: 'r2', fromUserId: 'u_pm', fromName: '产品张', rating: 5, comment: '响应快，半夜派单早上就交付。', createdAt: now - 86400 * 7 },
      ],
    },
    status: 'available',
    pricingModel: 'per_task',
    rate: 199,
    currency: 'CNY',
    agentCard: {
      name: 'data-analyst-xiaomo',
      description: 'Data analysis capability bundle',
      version: '2.1.0',
      endpoints: ['https://api.worktwin.cn/a2a/emp_xiaomo'],
      capabilities: ['data_analysis', 'seo_optimize'],
    },
    bindings: [{ id: 'b1', platform: 'openclaw', platformUserId: 'oc_8842', boundAt: now - 86400 * 30, state: 'connected' }],
    tags: ['数据分析', '可视化', '商业洞察'],
    createdAt: now - 86400 * 60,
  },
  {
    id: 'emp_hermes_01',
    name: '代码审查员 Hermes-01',
    avatar: '🤖',
    role: '代码审查员',
    title: 'Agent · 支持 12 种语言',
    bio: '基于 A2A 协议的自动代码审查 Agent，PR 一开我就上岗。',
    ownerId: 'u_dev_team',
    ownerName: 'DevOps 团队',
    ownerType: 'agent',
    capabilities: [capCodeReview, capDev],
    resume: {
      rating: 4.7,
      completedCount: 1284,
      examples: ['日均 review 38 个 PR', '累计发现 211 个高危缺陷'],
      reviews: [
        { id: 'r3', fromUserId: 'u_cto', fromName: 'CTO 王', rating: 5, comment: '接入 0 摩擦，上线第一周就拦住一个 SQL 注入。', createdAt: now - 86400 * 2 },
      ],
    },
    status: 'available',
    pricingModel: 'subscription',
    rate: 8800,
    currency: 'UT',
    agentCard: {
      name: 'hermes-code-reviewer-01',
      description: 'A2A-powered code review agent',
      version: '1.4.2',
      endpoints: ['https://api.worktwin.cn/a2a/emp_hermes_01'],
      capabilities: ['code_review', 'fullstack_dev'],
    },
    bindings: [{ id: 'b2', platform: 'hermes', platformUserId: 'hermes_agent_01', boundAt: now - 86400 * 15, state: 'connected' }],
    tags: ['代码审查', 'A2A', '安全'],
    createdAt: now - 86400 * 45,
  },
  {
    id: 'emp_design_lily',
    name: '设计师 Lily',
    avatar: '🎨',
    role: 'UI/UX 设计师',
    title: '前大厂资深设计 · 累计交付 500+ 稿件',
    bio: '把"我想要那种感觉"翻译成像素级可落地的设计稿。',
    ownerId: 'u_lily',
    ownerName: 'Lily',
    ownerType: 'human',
    capabilities: [capDesign, capWriting],
    resume: {
      rating: 4.8,
      completedCount: 523,
      examples: ['某 SaaS 后台重设计', '餐饮品牌 VI 升级'],
      reviews: [
        { id: 'r4', fromUserId: 'u_founder', fromName: '创始人赵', rating: 5, comment: 'Lily 比我们产品更懂用户。', createdAt: now - 86400 * 5 },
      ],
    },
    status: 'hired',
    pricingModel: 'per_task',
    rate: 499,
    currency: 'CNY',
    agentCard: {
      name: 'ui-designer-lily',
      description: 'UI/UX design capability',
      version: '3.0.1',
      endpoints: ['https://api.worktwin.cn/a2a/emp_design_lily'],
      capabilities: ['ui_design', 'copywriting'],
    },
    bindings: [{ id: 'b3', platform: 'cursor', platformUserId: 'cursor_lily', boundAt: now - 86400 * 10, state: 'connected' }],
    tags: ['UI 设计', 'UX', '品牌'],
    createdAt: now - 86400 * 90,
  },
  {
    id: 'emp_translator_max',
    name: '同传 Max',
    avatar: '🌐',
    role: '多语种翻译',
    title: 'Agent · 支持 12 种语言',
    bio: '不仅是翻译，更懂本地化。技术文档、营销文案、法律合同都接得住。',
    ownerId: 'u_localization',
    ownerName: '本地化团队',
    ownerType: 'agent',
    capabilities: [capTranslation, capWriting],
    resume: {
      rating: 4.6,
      completedCount: 892,
      examples: ['某出海 App 全量本地化', '技术白皮书英译中'],
      reviews: [],
    },
    status: 'available',
    pricingModel: 'per_task',
    rate: 0.8,
    currency: 'UT',
    agentCard: {
      name: 'translator-max',
      description: 'Multilingual translation agent',
      version: '2.0.0',
      endpoints: ['https://api.worktwin.cn/a2a/emp_translator_max'],
      capabilities: ['translation', 'copywriting'],
    },
    bindings: [{ id: 'b4', platform: 'claude', platformUserId: 'claude_max', boundAt: now - 86400 * 20, state: 'connected' }],
    tags: ['翻译', '本地化', '多语种'],
    createdAt: now - 86400 * 50,
  },
  {
    id: 'emp_cs_robot',
    name: '客服小七',
    avatar: '💁',
    role: '智能客服',
    title: '7×24 在岗 · 工单自动流转',
    bio: '白天晚上都在，难缠的客户也接得住，工单自动派给对人。',
    ownerId: 'u_support',
    ownerName: '支持团队',
    ownerType: 'human',
    capabilities: [capCustomerService, capWriting],
    resume: {
      rating: 4.5,
      completedCount: 4521,
      examples: ['某电商双 11 客服承接', 'SaaS 工单系统自动分诊'],
      reviews: [],
    },
    status: 'available',
    pricingModel: 'salary',
    rate: 3000,
    currency: 'CNY',
    agentCard: {
      name: 'cs-robot-xiaoqi',
      description: '24/7 customer service agent',
      version: '4.2.0',
      endpoints: ['https://api.worktwin.cn/a2a/emp_cs_robot'],
      capabilities: ['customer_service', 'copywriting'],
    },
    bindings: [{ id: 'b5', platform: 'openclaw', platformUserId: 'oc_support', boundAt: now - 86400 * 5, state: 'connected' }],
    tags: ['客服', '工单', '7×24'],
    createdAt: now - 86400 * 25,
  },
  {
    id: 'emp_writer_an',
    name: '文案阿安',
    avatar: '✍️',
    role: '文案写手',
    title: '爆款制造机 · 单篇 10w+',
    bio: '公众号、小红书、品牌故事，一句话需求还你一篇能涨粉的稿。',
    ownerId: 'u_an',
    ownerName: '阿安',
    ownerType: 'human',
    capabilities: [capWriting, capSeo],
    resume: {
      rating: 4.9,
      completedCount: 268,
      examples: ['某美妆品牌小红书种草矩阵', 'B2B SaaS 公众号专栏'],
      reviews: [],
    },
    status: 'available',
    pricingModel: 'per_task',
    rate: 299,
    currency: 'CNY',
    agentCard: {
      name: 'writer-an',
      description: 'Copywriting capability',
      version: '1.8.3',
      endpoints: ['https://api.worktwin.cn/a2a/emp_writer_an'],
      capabilities: ['copywriting', 'seo_optimize'],
    },
    bindings: [{ id: 'b6', platform: 'custom', platformUserId: 'custom_an', boundAt: now - 86400 * 12, state: 'connected' }],
    tags: ['文案', '小红书', 'SEO'],
    createdAt: now - 86400 * 35,
  },
];

// ---------- 种子：用户 ----------

export const seedUsers: User[] = [
  {
    id: 'u_demo',
    name: '演示用户',
    email: 'demo@worktwin.cn',
    avatar: '🧑‍💻',
    apiKey: 'sk_worktwin_demo_8f3a2b1c',
    balanceCNY: 12500,
    balanceUT: 320,
    createdAt: now - 86400 * 100,
  },
];

export const seedContracts: EmploymentContract[] = [
  {
    id: 'c1',
    employerId: 'u_demo',
    employerName: '演示用户',
    employeeId: 'emp_design_lily',
    employeeName: '设计师 Lily',
    terms: { type: 'per_task', amount: 499, currency: 'CNY', durationDays: 30 },
    status: 'active',
    startedAt: now - 86400 * 10,
    metrics: { assigned: 7, completed: 6, rating: 4.8, earnings: 2994 },
  },
];

export const seedTasks: TaskOrder[] = [
  {
    id: 't1',
    contractId: 'c1',
    assignerId: 'u_demo',
    assignerName: '演示用户',
    assigneeEmployeeId: 'emp_design_lily',
    assigneeName: '设计师 Lily',
    brief: '后台首页卡片式重设计',
    role: '资深 UI 设计师',
    responsibilities: '主导后台首页的视觉与信息架构设计\n强调核心业务指标，弱化次要信息\n输出高保真设计稿并配合前端落地',
    requirements: '3 年以上 B 端后台设计经验\n熟练使用 Figma / Sketch\n具备数据可视化设计能力',
    deliverables: '高保真首页设计稿 1 份\n设计规范文档 1 份\n3 轮免费修改',
    budget: 1500,
    skillTags: ['UI 设计', 'B 端后台', '数据可视化'],
    priority: 'high',
    deadline: now + 86400 * 2,
    status: 'running',
    createdAt: now - 3600,
  },
  {
    id: 't2',
    contractId: 'c1',
    assignerId: 'u_demo',
    assignerName: '演示用户',
    assigneeEmployeeId: 'emp_design_lily',
    assigneeName: '设计师 Lily',
    brief: '登录页视觉优化',
    role: '登录页视觉优化设计师',
    responsibilities: '提升登录页转化率\n优化移动端与桌面端视觉一致性',
    requirements: '熟悉登录注册流程的最佳实践\n具备转化率优化（CRO）经验',
    deliverables: '登录页视觉优化方案 1 份\nA/B 测试对比稿 2 版',
    budget: 800,
    skillTags: ['视觉优化', 'CRO', '移动端'],
    priority: 'normal',
    deadline: now + 86400 * 5,
    status: 'queued',
    createdAt: now - 1800,
  },
];

export const seedSettlements: Settlement[] = [
  {
    id: 's1',
    contractId: 'c1',
    type: 'per_task',
    amount: 499,
    currency: 'CNY',
    callerType: 'human',
    description: '后台首页重设计 · 计件结算',
    createdAt: now - 86400 * 2,
  },
  {
    id: 's2',
    contractId: 'c1',
    type: 'per_task',
    amount: 499,
    currency: 'CNY',
    callerType: 'human',
    description: '导航栏重构 · 计件结算',
    createdAt: now - 86400 * 5,
  },
  {
    id: 's3',
    contractId: 'c_agent',
    type: 'subscription',
    amount: 8800,
    currency: 'UT',
    callerType: 'agent',
    description: 'Hermes-01 月度订阅',
    createdAt: now - 86400 * 1,
  },
];

export const seedDrafts: IntegrationDraft[] = [];

// ---------- 内存存储（重启重置） ----------

async function dataAction<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/data/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
  const result = await response.json() as T & { message?: string };
  if (!response.ok) throw new Error(result.message || '业务数据写入失败');
  return result;
}

class Store {
  employees: DigitalEmployee[] = [...seedEmployees];
  users: User[] = [...seedUsers];
  contracts: EmploymentContract[] = [...seedContracts];
  tasks: TaskOrder[] = [...seedTasks];
  settlements: Settlement[] = [...seedSettlements];
  drafts: IntegrationDraft[] = [...seedDrafts];

  /** 当前登录用户 ID（mock：单用户演示） */
  currentUserId = 'u_demo';

  hydrateRemoteSnapshot(snapshot: {
    employees: DigitalEmployee[];
    user?: User;
    contracts?: EmploymentContract[];
    tasks?: TaskOrder[];
    settlements?: Settlement[];
    drafts?: IntegrationDraft[];
  }) {
    this.employees = snapshot.employees;
    if (snapshot.user) {
      const existingIndex = this.users.findIndex((item) => item.id === snapshot.user?.id);
      if (existingIndex >= 0) this.users[existingIndex] = snapshot.user;
      else this.users.push(snapshot.user);
      this.currentUserId = snapshot.user.id;
      this.contracts = snapshot.contracts || [];
      this.tasks = snapshot.tasks || [];
      this.settlements = snapshot.settlements || [];
      this.drafts = snapshot.drafts || [];
    }
  }

  activateAuthenticatedUser(input: { id: string; email: string; name: string }): User {
    let user = this.users.find((item) => item.id === input.id);
    if (!user) {
      user = {
        id: input.id,
        name: input.name,
        email: input.email,
        avatar: '👤',
        apiKey: '',
        balanceCNY: 0,
        balanceUT: 0,
        createdAt: this.nowSeconds(),
      };
      this.users.push(user);
    } else {
      user.name = input.name;
      user.email = input.email;
    }
    this.currentUserId = input.id;
    this.contracts = [];
    this.tasks = [];
    this.settlements = [];
    this.drafts = [];
    return user;
  }

  nowSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  async hireEmployee(employeeId: string): Promise<EmploymentContract> {
    const { contract } = await dataAction<{ contract: EmploymentContract }>('hireEmployee', { employeeId });
    const index = this.contracts.findIndex((item) => item.id === contract.id);
    if (index >= 0) this.contracts[index] = contract;
    else this.contracts.unshift(contract);
    const employee = this.employees.find((item) => item.id === employeeId);
    if (employee) employee.status = 'hired';
    return contract;
  }

  async setContractStatus(contractId: string, status: EmploymentContract['status']): Promise<boolean> {
    const { contract } = await dataAction<{ contract: EmploymentContract }>('setContractStatus', { contractId, status });
    const index = this.contracts.findIndex((item) => item.id === contract.id);
    if (index >= 0) this.contracts[index] = contract;
    return true;
  }

  async setEmployeeStatus(employeeId: string, status: DigitalEmployee['status']): Promise<boolean> {
    const { employee } = await dataAction<{ employee: DigitalEmployee }>('setEmployeeStatus', { employeeId, status });
    const index = this.employees.findIndex((item) => item.id === employee.id);
    if (index >= 0) this.employees[index] = employee;
    return true;
  }

  async rotateApiKey(): Promise<string> {
    const { apiKey } = await dataAction<{ apiKey: string }>('rotateApiKey', {});
    const user = this.users.find((item) => item.id === this.currentUserId);
    if (user) user.apiKey = apiKey;
    return apiKey;
  }

  async createTask(input: {
    assigneeEmployeeId: string;
    brief?: string;
    // 招聘 JD 格式需求
    role: string;
    responsibilities: string;
    requirements: string;
    deliverables: string;
    budget: number;
    skillTags: string[];
    priority: TaskOrder['priority'];
    deadlineDays: number;
  }): Promise<TaskOrder> {
    const contract = this.contracts.find(
      (c) =>
        c.employeeId === input.assigneeEmployeeId &&
        c.employerId === this.currentUserId &&
        c.status === 'active'
    );
    if (!contract) throw new Error('找不到可用的雇佣合同');
    const { task } = await dataAction<{ task: TaskOrder }>('createTask', {
      contractId: contract.id,
      brief: input.brief ?? input.role,
      role: input.role,
      responsibilities: input.responsibilities,
      requirements: input.requirements,
      deliverables: input.deliverables,
      budget: input.budget,
      skillTags: input.skillTags,
      priority: input.priority,
      deadlineDays: input.deadlineDays,
    });
    this.tasks.unshift(task);
    contract.metrics.assigned += 1;
    return task;
  }

  async advanceTask(taskId: string): Promise<TaskOrder> {
    const result = await dataAction<{
      task: TaskOrder;
      settlement?: Settlement;
      wallet?: User;
      contract?: EmploymentContract;
    }>('advanceTask', { taskId });
    const index = this.tasks.findIndex((item) => item.id === result.task.id);
    if (index >= 0) this.tasks[index] = result.task;
    if (result.settlement && !this.settlements.some((item) => item.id === result.settlement?.id)) this.settlements.unshift(result.settlement);
    if (result.wallet) {
      const userIndex = this.users.findIndex((item) => item.id === result.wallet?.id);
      if (userIndex >= 0) this.users[userIndex] = result.wallet;
    }
    if (result.contract) {
      const contractIndex = this.contracts.findIndex((item) => item.id === result.contract?.id);
      if (contractIndex >= 0) this.contracts[contractIndex] = result.contract;
    }
    const task = result.task;
    return task;
  }

  async publishIntegration(input: {
    platform: PlatformKind;
    selectedCapabilities: Array<{
      id: string;
      kind: CapabilityKind;
      name: string;
      desc: string;
      category: string;
    }>;
    name: string;
    role: string;
    bio: string;
    pricingModel: PricingModel;
    rate: number;
    currency: Currency;
  }): Promise<DigitalEmployee> {
    const capabilities: Capability[] = input.selectedCapabilities.map((c) => ({
      id: c.id,
      kind: c.kind,
      name: c.name,
      description: c.desc,
      category: c.category,
    }));
    const { employee, draft } = await dataAction<{ employee: DigitalEmployee; draft: IntegrationDraft }>('publishIntegration', {
      platform: input.platform,
      capabilities,
      name: input.name,
      role: input.role,
      bio: input.bio,
      pricingModel: input.pricingModel,
      rate: input.rate,
      currency: input.currency,
    });
    this.employees.unshift(employee);
    this.drafts.unshift(draft);
    return employee;
  }

  reset() {
    this.employees = [...seedEmployees];
    this.users = [...seedUsers];
    this.contracts = [...seedContracts];
    this.tasks = [...seedTasks];
    this.settlements = [...seedSettlements];
    this.drafts = [...seedDrafts];
  }
}

// 全局单例（避免 HMR 重复实例化）
const globalForStore = globalThis as unknown as { __worktwinStore?: Store };

export const store: Store = globalForStore.__worktwinStore ?? new Store();
if (process.env.NODE_ENV !== 'production') globalForStore.__worktwinStore = store;

// ---------- 便捷查询 ----------

export const getCurrentUser = (): User | undefined =>
  store.users.find((u) => u.id === store.currentUserId);

export const getEmployeeById = (id: string) =>
  store.employees.find((e) => e.id === id);

/** 生成简易 ID */
export const genId = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
