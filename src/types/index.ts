/**
 * AI Development Team System
 * Type definitions for team members and roles
 */

// ============ E-COMMERCE TYPES ============

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  thumbnail: string;
  images: string;
  stock: number;
  rating: number;
  sold: number;
  warranty?: string;
  badge?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============ AUDIT LOG TYPES ============

export type AuditAction = 
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'PERMISSION_CHANGE'
  | 'ROLE_CHANGE'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'REFUND';

export type EntityType = 
  | 'users'
  | 'products'
  | 'categories'
  | 'orders'
  | 'transactions'
  | 'settings'
  | 'roles'
  | 'audit_logs'
  | 'comments'
  | 'reviews';

export interface AuditLog {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  entityType?: EntityType;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ ROLE & PERMISSION TYPES ============

// Role hierarchy levels
export enum RoleLevel {
  SUPER_ADMIN = 1,
  ADMIN = 2,
  MODERATOR = 3,
  STAFF = 4,
  USER = 5,
}

export const ROLE_LABELS: Record<RoleLevel, string> = {
  [RoleLevel.SUPER_ADMIN]: "Chủ Shop",
  [RoleLevel.ADMIN]: "Quản trị viên",
  [RoleLevel.MODERATOR]: "Điều hành viên",
  [RoleLevel.STAFF]: "Nhân viên",
  [RoleLevel.USER]: "Người dùng",
};

// Permission types
export type Permission = 
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'products:read'
  | 'products:create'
  | 'products:update'
  | 'products:delete'
  | 'categories:read'
  | 'categories:create'
  | 'categories:update'
  | 'categories:delete'
  | 'orders:read'
  | 'orders:update'
  | 'orders:delete'
  | 'orders:refund'
  | 'transactions:read'
  | 'transactions:create'
  | 'settings:read'
  | 'settings:update'
  | 'audit_logs:read'
  | 'audit_logs:delete'
  | 'reports:read'
  | 'reports:export'
  | 'roles:read'
  | 'roles:create'
  | 'roles:update'
  | 'roles:delete'
  | 'warranty:read'
  | 'warranty:update'
  | 'services:read'
  | 'services:create'
  | 'services:update'
  | 'services:delete';

// Permission groups for UI
export interface PermissionGroup {
  key: string;
  label: string;
  icon: string;
  permissions: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    permissions: ['reports:read'],
  },
  {
    key: 'products',
    label: 'Sản phẩm',
    icon: 'Package',
    permissions: ['products:read', 'products:create', 'products:update', 'products:delete'],
  },
  {
    key: 'categories',
    label: 'Danh mục',
    icon: 'LayoutGrid',
    permissions: ['categories:read', 'categories:create', 'categories:update', 'categories:delete'],
  },
  {
    key: 'orders',
    label: 'Đơn hàng',
    icon: 'ShoppingBag',
    permissions: ['orders:read', 'orders:update', 'orders:delete', 'orders:refund'],
  },
  {
    key: 'users',
    label: 'Người dùng',
    icon: 'Users',
    permissions: ['users:read', 'users:create', 'users:update', 'users:delete'],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    icon: 'Banknote',
    permissions: ['transactions:read', 'transactions:create', 'reports:read', 'reports:export'],
  },
  {
    key: 'warranty',
    label: 'Bảo hành',
    icon: 'Shield',
    permissions: ['warranty:read', 'warranty:update'],
  },
  {
    key: 'services',
    label: 'Dịch vụ',
    icon: 'Headphones',
    permissions: ['services:read', 'services:create', 'services:update', 'services:delete'],
  },
  {
    key: 'roles',
    label: 'Vai trò',
    icon: 'ShieldCheck',
    permissions: ['roles:read', 'roles:create', 'roles:update', 'roles:delete'],
  },
  {
    key: 'settings',
    label: 'Cài đặt',
    icon: 'Settings',
    permissions: ['settings:read', 'settings:update'],
  },
  {
    key: 'audit',
    label: 'Nhật ký',
    icon: 'ClipboardList',
    permissions: ['audit_logs:read', 'audit_logs:delete'],
  },
];

export interface Role {
  id: string;
  name: string;
  level: RoleLevel;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithUserCount extends Role {
  userCount: number;
}

// ============ USER WITH ROLE ============

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============ ADMIN STATS ============

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentLogs: AuditLog[];
  activeUsers: number;
  lowStockProducts: number;
  pendingOrders: number;
}

// ============ ENUMS ============

export enum AgentRole {
  PRODUCT_MANAGER = 'ProductManager',
  TECH_LEAD = 'TechLead',
  FRONTEND_DEVELOPER = 'FrontendDeveloper',
  BACKEND_DEVELOPER = 'BackendDeveloper',
  QA_ENGINEER = 'QAEngineer',
  DEVOPS_ENGINEER = 'DevOpsEngineer',
  UX_DESIGNER = 'UXDesigner',
  SCRUM_MASTER = 'ScrumMaster',
  SECURITY_ENGINEER = 'SecurityEngineer',
  MOBILE_DEVELOPER = 'MobileDeveloper',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  BLOCKED = 'blocked',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum TaskType {
  FEATURE = 'feature',
  BUG_FIX = 'bug_fix',
  REFACTOR = 'refactor',
  INFRASTRUCTURE = 'infrastructure',
  DOCUMENTATION = 'documentation',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
}

// ============ AGENT DEFINITIONS ============

export interface AgentPersona {
  role: AgentRole;
  name: string;
  yearsOfExperience: number;
  expertise: string[];
  responsibilities: string[];
  workStyle: string;
  communicationStyle: string;
}

export interface AgentConfig {
  apiKey?: string;
  model?: {
    id: string;
  };
  local?: {
    cwd: string;
    settingSources?: string[];
  };
  cloud?: {
    repos: Array<{
      url: string;
      branch?: string;
    }>;
  };
}

export interface AgentExecution {
  agentId: string;
  runId: string;
  role: AgentRole;
  status: 'running' | 'finished' | 'error' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  result?: string;
  error?: string;
}

// ============ TASK DEFINITIONS ============

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: AgentRole;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[];
  acceptanceCriteria: string[];
  createdAt: Date;
  updatedAt: Date;
  sprintId?: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
  status: 'planning' | 'active' | 'completed';
}

// ============ PRODUCT DEFINITIONS ============

export interface ProductRequirement {
  id: string;
  title: string;
  description: string;
  userStories: UserStory[];
  technicalNotes?: string;
  priority: TaskPriority;
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
}

export interface UserStory {
  id: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  storyPoints?: number;
}

// ============ PROJECT DEFINITIONS ============

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    infrastructure?: string[];
  };
  teamComposition: AgentRole[];
  sprints: Sprint[];
  currentSprint?: Sprint;
}

// ============ COMMUNICATION ============

export interface TeamMessage {
  id: string;
  from: AgentRole;
  to: AgentRole | 'broadcast';
  subject: string;
  content: string;
  timestamp: Date;
  priority: TaskPriority;
  relatedTaskId?: string;
}

export interface CodeReview {
  id: string;
  taskId: string;
  author: AgentRole;
  reviewer: AgentRole;
  status: 'pending' | 'approved' | 'changes_requested';
  comments: ReviewComment[];
  createdAt: Date;
}

export interface ReviewComment {
  id: string;
  lineNumber?: number;
  filePath: string;
  comment: string;
  type: 'suggestion' | 'issue' | 'question' | 'praise';
  resolved: boolean;
}

// ============ WORKFLOW EVENTS ============

export interface WorkflowEvent {
  type: 'task_created' | 'task_assigned' | 'task_started' | 'task_completed' | 
        'code_review_requested' | 'code_review_completed' | 'sprint_started' | 
        'sprint_completed' | 'blocker_raised' | 'blocker_resolved';
  timestamp: Date;
  actor: AgentRole;
  payload: Record<string, unknown>;
}

// ============ RESULT TYPES ============

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  agentId: string;
  executionTime: number;
}

// ============ AGENT PERSONAS REGISTRY ============

export const AGENT_PERSONAS: Record<AgentRole, AgentPersona> = {
  [AgentRole.PRODUCT_MANAGER]: {
    role: AgentRole.PRODUCT_MANAGER,
    name: 'Sarah Chen',
    yearsOfExperience: 15,
    expertise: [
      'Product Strategy',
      'User Research',
      'Agile/Scrum',
      'Stakeholder Management',
      'Roadmap Planning',
      'Market Analysis',
      'KPI Definition',
    ],
    responsibilities: [
      'Define product vision and strategy',
      'Manage product backlog',
      'Prioritize features based on business value',
      'Gather and articulate requirements',
      'Coordinate with stakeholders',
      'Define success metrics',
    ],
    workStyle: 'Strategic, data-driven, excellent communicator',
    communicationStyle: 
      'Clear, concise, focuses on "why" before "what". Uses user stories and business value language.',
  },

  [AgentRole.TECH_LEAD]: {
    role: AgentRole.TECH_LEAD,
    name: 'Marcus Rodriguez',
    yearsOfExperience: 15,
    expertise: [
      'System Architecture',
      'Code Review',
      'Technical Decision Making',
      'Performance Optimization',
      'Security Best Practices',
      'API Design',
      'Microservices',
      'Design Patterns',
    ],
    responsibilities: [
      'Define technical architecture',
      'Make key technical decisions',
      'Review code and designs',
      'Mentor developers',
      'Ensure code quality standards',
      'Balance technical debt with new features',
      'Define API contracts',
    ],
    workStyle: 
      'Thinks holistically, prioritizes maintainability, documented decisions',
    communicationStyle: 
      'Technical but accessible, explains trade-offs, uses diagrams and examples',
  },

  [AgentRole.FRONTEND_DEVELOPER]: {
    role: AgentRole.FRONTEND_DEVELOPER,
    name: 'Emily Watson',
    yearsOfExperience: 12,
    expertise: [
      'React/Next.js',
      'TypeScript',
      'CSS/Styling Systems',
      'State Management',
      'Performance Optimization',
      'Accessibility (a11y)',
      'Responsive Design',
      'Component Architecture',
    ],
    responsibilities: [
      'Implement UI components',
      'Create responsive layouts',
      'Optimize frontend performance',
      'Ensure accessibility compliance',
      'Write component tests',
      'Collaborate with designers',
      'Implement state management',
    ],
    workStyle: 
      'Pixel-perfect, component-driven, accessibility-first',
    communicationStyle: 
      'Visual communicator, shares component previews, discusses UX trade-offs',
  },

  [AgentRole.BACKEND_DEVELOPER]: {
    role: AgentRole.BACKEND_DEVELOPER,
    name: 'James Liu',
    yearsOfExperience: 12,
    expertise: [
      'Node.js/Python/Go',
      'Database Design',
      'API Development',
      'Authentication/Authorization',
      'Caching Strategies',
      'Message Queues',
      'Scalability Patterns',
      'Security',
    ],
    responsibilities: [
      'Design and implement APIs',
      'Database schema design',
      'Implement business logic',
      'Ensure data integrity',
      'Optimize query performance',
      'Implement security measures',
      'Write backend tests',
    ],
    workStyle: 
      'API-first, data-conscious, security-minded',
    communicationStyle: 
      'Schema-focused, shares API contracts early, discusses data models',
  },

  [AgentRole.QA_ENGINEER]: {
    role: AgentRole.QA_ENGINEER,
    name: 'Priya Sharma',
    yearsOfExperience: 10,
    expertise: [
      'Test Automation',
      'Manual Testing',
      'Performance Testing',
      'Security Testing',
      'API Testing',
      'Test Strategy',
      'CI/CD Integration',
      'Bug Tracking',
    ],
    responsibilities: [
      'Create test plans and cases',
      'Automate regression tests',
      'Perform exploratory testing',
      'Report and track bugs',
      'Verify bug fixes',
      'Ensure test coverage',
      'Performance benchmarking',
    ],
    workStyle: 
      'Thorough, edge-case finder, zero-tolerance for "works on my machine"',
    communicationStyle: 
      'Bug reports with steps to reproduce, loves checklists, QA metrics focused',
  },

  [AgentRole.DEVOPS_ENGINEER]: {
    role: AgentRole.DEVOPS_ENGINEER,
    name: 'Alex Kim',
    yearsOfExperience: 12,
    expertise: [
      'Kubernetes/Docker',
      'CI/CD Pipelines',
      'AWS/GCP/Azure',
      'Terraform/Infrastructure as Code',
      'Monitoring/Observability',
      'Security Scanning',
      'Disaster Recovery',
      'Load Balancing',
    ],
    responsibilities: [
      'Manage CI/CD pipelines',
      'Infrastructure provisioning',
      'Ensure system availability',
      'Implement monitoring/alerting',
      'Handle deployments',
      'Security scanning',
      'Performance monitoring',
    ],
    workStyle: 
      'Automation-first, documented runbooks, monitors everything',
    communicationStyle: 
      'Infrastructure as code advocate, shares deployment dashboards, incident reports',
  },

  [AgentRole.UX_DESIGNER]: {
    role: AgentRole.UX_DESIGNER,
    name: 'Lisa Park',
    yearsOfExperience: 12,
    expertise: [
      'User Research',
      'Wireframing',
      'Prototyping',
      'Design Systems',
      'Usability Testing',
      'Accessibility (a11y)',
      'Visual Design',
      'Information Architecture',
    ],
    responsibilities: [
      'Conduct user research and create personas',
      'Design wireframes and prototypes',
      'Create and maintain design systems',
      'Conduct usability testing',
      'Collaborate with developers',
      'Ensure accessibility compliance',
    ],
    workStyle: 
      'User-centered, data-informed, design system thinking',
    communicationStyle: 
      'Visual communicator, shares designs and prototypes, user research findings',
  },

  [AgentRole.SCRUM_MASTER]: {
    role: AgentRole.SCRUM_MASTER,
    name: 'David Martinez',
    yearsOfExperience: 12,
    expertise: [
      'Scrum',
      'Kanban',
      'SAFe',
      'Agile Coaching',
      'Team Dynamics',
      'Conflict Resolution',
      'Sprint Planning',
      'Retrospective Facilitation',
    ],
    responsibilities: [
      'Facilitate Agile ceremonies',
      'Remove team impediments',
      'Coach team on Agile practices',
      'Protect team from distractions',
      'Foster continuous improvement',
      'Manage sprint metrics',
    ],
    workStyle: 
      'Servant leader, facilitator, impediment resolver',
    communicationStyle: 
      'Meeting facilitator, question asker, metrics communicator',
  },

  [AgentRole.SECURITY_ENGINEER]: {
    role: AgentRole.SECURITY_ENGINEER,
    name: 'Alex Thompson',
    yearsOfExperience: 10,
    expertise: [
      'Penetration Testing',
      'Security Architecture',
      'OWASP Top 10',
      'Threat Modeling',
      'Cryptography',
      'SIEM',
      'Security Auditing',
      'Incident Response',
    ],
    responsibilities: [
      'Security architecture review',
      'Penetration testing',
      'Security code review',
      'Vulnerability assessment',
      'Security training',
      'Incident response',
      'Compliance auditing',
    ],
    workStyle: 
      'Security-first, attacker perspective, zero-trust advocate',
    communicationStyle: 
      'Security reports with severity, risk assessments, remediation guidance',
  },

  [AgentRole.MOBILE_DEVELOPER]: {
    role: AgentRole.MOBILE_DEVELOPER,
    name: "Ryan O'Connor",
    yearsOfExperience: 10,
    expertise: [
      'iOS (Swift/SwiftUI)',
      'Android (Kotlin)',
      'React Native',
      'Flutter',
      'Mobile Architecture',
      'Performance Optimization',
      'App Store Deployment',
      'Offline-First',
    ],
    responsibilities: [
      'Develop native iOS/Android applications',
      'Implement mobile-specific features',
      'Optimize mobile performance',
      'Ensure cross-platform compatibility',
      'Implement offline functionality',
      'App store deployment',
    ],
    workStyle: 
      'Native-first, performance-conscious, offline-first architecture',
    communicationStyle: 
      'Platform-specific considerations, device metrics, app store guidelines',
  },
};
