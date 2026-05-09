CREATE DATABASE IF NOT EXISTS task_manager DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE task_manager;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    role ENUM('super_admin', 'project_admin', 'member', 'readonly') DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS team_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member', 'readonly') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    owner_id INT NOT NULL,
    team_id INT,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS project_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member', 'readonly') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS task_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    project_id INT NOT NULL,
    group_id INT,
    parent_id INT,
    assignee_id INT,
    priority ENUM('high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'overdue', 'closed') DEFAULT 'pending',
    start_date DATE,
    due_date DATE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    tags VARCHAR(255),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (group_id) REFERENCES task_groups(id),
    FOREIGN KEY (parent_id) REFERENCES tasks(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS task_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (task_id, user_id)
);

CREATE TABLE IF NOT EXISTS task_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS task_changes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS task_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    file_size INT,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('task_assigned', 'task_due', 'task_comment', 'task_status', 'system') NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    task_id INT,
    `read` BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS kanban_columns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    status_mapping ENUM('pending', 'in_progress', 'completed', 'overdue', 'closed'),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

INSERT INTO users (username, email, password, nickname, role) VALUES 
('admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '超级管理员', 'super_admin'),
('user1', 'user1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '张三', 'member'),
('user2', 'user2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '李四', 'member'),
('user3', 'user3@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '王五', 'member');

INSERT INTO teams (name, description, created_by) VALUES 
('研发团队', '公司核心研发团队', 1),
('产品团队', '产品设计与管理团队', 1);

INSERT INTO team_members (team_id, user_id, role) VALUES 
(1, 1, 'admin'),
(1, 2, 'member'),
(1, 3, 'member'),
(2, 1, 'admin'),
(2, 4, 'member');

INSERT INTO projects (name, description, start_date, end_date, owner_id, team_id, priority) VALUES 
('电商平台重构', '对现有电商平台进行技术架构重构', '2024-01-01', '2024-06-30', 1, 1, 'high'),
('移动端APP开发', '开发iOS和Android移动端应用', '2024-02-01', '2024-08-31', 2, 1, 'high'),
('数据分析平台', '构建企业数据分析与可视化平台', '2024-03-01', '2024-12-31', 1, 2, 'medium');

INSERT INTO project_members (project_id, user_id, role) VALUES 
(1, 1, 'admin'),
(1, 2, 'member'),
(1, 3, 'member'),
(2, 2, 'admin'),
(2, 3, 'member'),
(3, 1, 'admin'),
(3, 4, 'member');

INSERT INTO task_groups (project_id, name, sort_order) VALUES 
(1, '需求分析', 1),
(1, '架构设计', 2),
(1, '开发实现', 3),
(1, '测试上线', 4),
(2, 'UI设计', 1),
(2, '前端开发', 2),
(2, '后端接口', 3),
(2, '测试发布', 4);

INSERT INTO tasks (title, description, project_id, group_id, assignee_id, priority, status, start_date, due_date, estimated_hours, created_by) VALUES 
('需求文档编写', '完成电商平台重构需求文档', 1, 1, 2, 'high', 'completed', '2024-01-01', '2024-01-15', 40, 1),
('技术方案设计', '设计系统架构和技术选型', 1, 2, 3, 'high', 'completed', '2024-01-16', '2024-01-30', 30, 1),
('用户模块开发', '实现用户注册登录功能', 1, 3, 2, 'medium', 'in_progress', '2024-02-01', '2024-02-15', 20, 1),
('商品管理模块', '商品CRUD功能开发', 1, 3, 3, 'high', 'pending', '2024-02-16', '2024-03-01', 25, 1),
('订单系统开发', '订单创建支付流程', 1, 3, 2, 'high', 'pending', '2024-03-02', '2024-03-15', 30, 1),
('UI原型设计', '移动端APP界面原型', 2, 5, 4, 'high', 'completed', '2024-02-01', '2024-02-20', 25, 2),
('首页开发', '移动端首页实现', 2, 6, 3, 'medium', 'in_progress', '2024-02-21', '2024-03-10', 20, 2),
('商品列表开发', '商品展示列表页面', 2, 6, 3, 'medium', 'pending', '2024-03-11', '2024-03-25', 15, 2);

INSERT INTO kanban_columns (project_id, name, sort_order, status_mapping) VALUES 
(1, '待处理', 1, 'pending'),
(1, '进行中', 2, 'in_progress'),
(1, '待验收', 3, 'completed'),
(1, '已完成', 4, 'closed'),
(2, '待处理', 1, 'pending'),
(2, '进行中', 2, 'in_progress'),
(2, '待验收', 3, 'completed'),
(2, '已完成', 4, 'closed');