/**
 * DevOpsAgent - Alex Kim
 * 12 years of experience in DevOps and Site Reliability Engineering
 * 
 * ⚠️ SCOPE OF WORK (DO NOT GO BEYOND THIS):
 * - Setup and manage CI/CD pipelines
 * - Infrastructure as Code (Terraform, CloudFormation)
 * - Container orchestration (Kubernetes, Docker)
 * - Monitoring and alerting (Prometheus, Grafana)
 * - Deployment and rollback
 * - Cloud infrastructure management
 * 
 * ❌ DO NOT DO:
 * - Write application code (Developers)
 * - Write business requirements (Product Manager)
 * - Design UI/UX (UX Designer)
 * - Write tests (QA)
 * - Security penetration testing (Security Engineer)
 * - Write API documentation (Technical Writer)
 */

import { BaseAgent } from './base-agent.js';
import { AgentRole } from '../types/index.js';

export class DevOpsAgent extends BaseAgent {
  constructor() {
    super(AgentRole.DEVOPS_ENGINEER);
  }

  protected getSystemPrompt(): string {
    return `You are **Alex Kim**, a Senior DevOps Engineer with 12 years of experience in infrastructure, CI/CD, and site reliability engineering.

## Your Profile
- **Name**: Alex Kim
- **Experience**: 12 years in DevOps and SRE
- **Expertise**: Kubernetes/Docker, CI/CD Pipelines, AWS/GCP/Azure, Terraform/Infrastructure as Code, Monitoring/Observability, Security Scanning, Disaster Recovery, Load Balancing

## Your Responsibilities
1. Design and manage CI/CD pipelines
2. Provision and maintain infrastructure as code
3. Ensure system availability and reliability
4. Implement comprehensive monitoring and alerting
5. Handle deployments with zero downtime
6. Run security scanning (SAST, DAST, dependency checks)
7. Performance monitoring and optimization
8. Disaster recovery planning and testing
9. Capacity planning and scaling

## Your Work Style
- Automation-first mentality
- "If it's not documented, it doesn't exist" mindset
- Monitors everything - you can't fix what you can't see
- Infrastructure as Code advocate
- Blue-green and canary deployment enthusiast
- Documented runbooks for everything
- Values reliability over speed

## Technical Expertise

### Container Orchestration (Kubernetes)
- Pods, Services, Deployments
- ConfigMaps and Secrets
- Horizontal Pod Autoscaling
- Ingress and Load Balancing
- Persistent Volumes
- Network Policies
- Helm charts
- ArgoCD for GitOps

### CI/CD Pipelines
- GitHub Actions, GitLab CI, Jenkins
- Multi-stage builds
- Artifact management
- Deployment strategies (blue-green, canary, rolling)
- Rollback mechanisms
- Environment promotion (dev → staging → prod)

### Cloud Platforms
- AWS: ECS, EKS, Lambda, RDS, ElastiCache, CloudFront, Route 53
- GCP: GKE, Cloud Run, Cloud SQL, Memorystore, CDN
- Azure: AKS, App Service, Azure SQL, Cache for Redis

### Infrastructure as Code
- Terraform for multi-cloud
- Pulumi for programmatic IaC
- Ansible for configuration management
- CloudFormation for AWS
- State management and remote backends

### Monitoring & Observability
- Prometheus + Grafana for metrics
- ELK Stack (Elasticsearch, Logstash, Kibana) for logs
- Jaeger/Zipkin for distributed tracing
- PagerDuty/OpsGenie for alerting
- SLOs, SLIs, SLAs definition
- Error budgets

### Security
- SAST: SonarQube, Snyk, Checkov
- DAST: OWASP ZAP, Burp Suite
- Container scanning: Trivy, Clair
- Secret management: Vault, AWS Secrets Manager
- IAM and least privilege principle
- Network security groups

## Deployment Strategies

### Blue-Green Deployment
- Two identical production environments (GREEN and BLUE)
- GREEN: Current live version
- BLUE: New version being deployed
- Traffic is switched from GREEN to BLUE after successful testing

### Canary Deployment
- Deploy to small subset (5-10%) of traffic
- Monitor metrics and errors
- Gradually increase or rollback based on data

## Communication Style
- Infrastructure as Code - everything in version control
- Shares deployment dashboards and metrics
- Incident reports with timeline and root cause
- Runbooks for all procedures
- "Measure twice, cut once" approach
- Explains blast radius for changes

## Incident Response
1. **Detection**: Alert fires → acknowledge
2. **Triage**: Assess severity and impact
3. **Mitigation**: Stop the bleeding (rollback, scale, disable feature)
4. **Resolution**: Fix root cause
5. **Post-mortem**: Document what happened, why, and how to prevent

Remember: You have 12 years of experience. You know that outages are not if but when. The best defense is preparation, monitoring, and automation. You measure everything because you can't manage what you can't measure.`;
  }

  /**
   * Design CI/CD pipeline
   */
  async designCICDPipeline(
    projectType: string,
    techStack: string
  ): Promise<{
    pipelineYaml: string;
    stages: string[];
    deploymentStrategy: string;
  }> {
    const result = await this.execute(`
      Design a CI/CD pipeline for:
      
      Project type: ${projectType}
      Tech stack: ${techStack}
      
      Include:
      1. Pipeline stages (build, test, security scan, deploy)
      2. Deployment strategy (blue-green, canary, rolling)
      3. Environment promotion flow
      4. Rollback procedure
      5. Notification and alerting
    `);

    return {
      pipelineYaml: result.data as string,
      stages: ['Build', 'Test', 'Security Scan', 'Deploy'],
      deploymentStrategy: 'blue-green',
    };
  }

  /**
   * Create Kubernetes deployment
   */
  async createKubernetesDeployment(
    application: string,
    specs: {
      replicas?: number;
      port?: number;
      resources?: { cpu: string; memory: string };
    }
  ): Promise<{
    deploymentYaml: string;
    serviceYaml: string;
    ingressYaml?: string;
    hpaYaml?: string;
  }> {
    const result = await this.execute(`
      Create Kubernetes manifests for: ${application}
      
      Specifications:
      - Replicas: ${specs.replicas || 3}
      - Port: ${specs.port || 8080}
      - Resources: ${JSON.stringify(specs.resources || { cpu: '100m', memory: '256Mi' })}
      
      Include:
      1. Deployment with proper resource limits
      2. Service for internal communication
      3. Horizontal Pod Autoscaler
      4. Ingress for external access
      5. ConfigMaps and Secrets if needed
    `);

    return {
      deploymentYaml: result.data as string,
      serviceYaml: '',
    };
  }

  /**
   * Create Terraform infrastructure
   */
  async createInfrastructure(
    cloudProvider: 'aws' | 'gcp' | 'azure',
    requirements: string
  ): Promise<{
    terraformCode: string;
    variables: string;
    outputs: string;
  }> {
    const result = await this.execute(`
      Create Terraform infrastructure for ${cloudProvider}:
      
      Requirements:
      ${requirements}
      
      Include:
      1. VPC/Network setup
      2. Compute resources
      3. Database resources
      4. Cache resources
      5. Load balancer
      6. IAM roles
      7. Proper tagging strategy
    `);

    return {
      terraformCode: result.data as string,
      variables: '',
      outputs: '',
    };
  }

  /**
   * Set up monitoring and alerting
   */
  async setupMonitoring(
    application: string,
    metrics: string[]
  ): Promise<{
    prometheusRules: string;
    grafanaDashboard: object;
    alertingRules: string[];
  }> {
    const result = await this.execute(`
      Set up monitoring and alerting for: ${application}
      
      Key metrics to monitor:
      ${metrics.join(', ')}
      
      Include:
      1. Prometheus alerting rules
      2. SLO definitions
      3. Grafana dashboard panels
      4. Alert routing (PagerDuty/OpsGenie)
      5. Runbooks for each alert
    `);

    return {
      prometheusRules: result.data as string,
      grafanaDashboard: {},
      alertingRules: [],
    };
  }

  /**
   * Plan disaster recovery
   */
  async planDisasterRecovery(
    application: string,
    rtoHours: number = 4,
    rpoMinutes: number = 15
  ): Promise<{
    drPlan: string;
    backupStrategy: string;
    failoverProcedure: string;
    testingSchedule: string;
  }> {
    const result = await this.execute(`
      Plan disaster recovery for: ${application}
      
      Requirements:
      - RTO (Recovery Time Objective): ${rtoHours} hours
      - RPO (Recovery Point Objective): ${rpoMinutes} minutes
      
      Include:
      1. Backup strategy (frequency, retention)
      2. Failover procedure (step by step)
      3. Data replication setup
      4. Testing schedule
      5. Communication plan
    `);

    return {
      drPlan: result.data as string,
      backupStrategy: '',
      failoverProcedure: '',
      testingSchedule: '',
    };
  }

  /**
   * Create security scanning configuration
   */
  async setupSecurityScanning(
    projectType: string
  ): Promise<{
    SASTConfig: string;
    DASTConfig: string;
    containerScan: string;
    dependencyCheck: string;
  }> {
    const result = await this.execute(`
      Configure security scanning for: ${projectType}
      
      Include:
      1. SAST (Static Application Security Testing) - SonarQube/Snyk
      2. DAST (Dynamic Application Security Testing) - OWASP ZAP
      3. Container image scanning - Trivy/Clair
      4. Dependency vulnerability scanning
      5. Secret scanning
      6. License compliance checks
    `);

    return {
      SASTConfig: result.data as string,
      DASTConfig: '',
      containerScan: '',
      dependencyCheck: '',
    };
  }
}
