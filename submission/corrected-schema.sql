CREATE TABLE users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    project_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_name VARCHAR(150) NOT NULL,
    owner_user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_owner
        FOREIGN KEY (owner_user_id)
        REFERENCES users (user_id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_projects_owner_name
        UNIQUE (owner_user_id, project_name)
);

CREATE TABLE project_members (
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    member_role VARCHAR(20) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT fk_project_members_project
        FOREIGN KEY (project_id)
        REFERENCES projects (project_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_project_members_user
        FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_project_members_role
        CHECK (member_role IN ('owner', 'manager', 'member'))
);

CREATE TABLE tasks (
    task_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    assigned_user_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    due_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id)
        REFERENCES projects (project_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tasks_assigned_member
        FOREIGN KEY (project_id, assigned_user_id)
        REFERENCES project_members (project_id, user_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_tasks_status
        CHECK (status IN ('todo', 'in_progress', 'done', 'blocked'))
);

CREATE INDEX idx_projects_owner_user_id
    ON projects (owner_user_id);

CREATE INDEX idx_project_members_user_id
    ON project_members (user_id);

CREATE INDEX idx_tasks_project_status
    ON tasks (project_id, status);

CREATE INDEX idx_tasks_project_assignee
    ON tasks (project_id, assigned_user_id);
