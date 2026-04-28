# TaskSphere Schema Review

## Problems in the original schema

1. No primary keys were defined, so rows could be duplicated and records could not be referenced reliably.
2. There were no foreign keys, which allowed tasks to reference users or projects that do not exist.
3. Relationships were based on names like `project_name`, `owner_name`, and `assigned_user` instead of stable identifiers.
4. The `UserProjects` table had no composite key or constraints, so duplicate membership rows could be inserted.
5. Several column types were invalid or inappropriate, such as `email ID(100)`, `user_name VAR(100)`, and `task_name INT(100)`.
6. Repeating descriptive text across tables increased redundancy and made updates error-prone.
7. There were no uniqueness rules for emails or project ownership naming, which weakens data quality.
8. No supporting indexes existed for common joins and filters, which contributes to slower queries at scale.

## Improvements in the redesigned schema

1. Added surrogate primary keys for `users`, `projects`, and `tasks`.
2. Converted the many-to-many relationship between users and projects into a constrained `project_members` join table.
3. Replaced name-based relationships with numeric foreign keys.
4. Enforced that an assigned task user must already belong to the same project through a composite foreign key.
5. Added `UNIQUE`, `CHECK`, and `NOT NULL` constraints to protect integrity.
6. Reduced redundancy so entity facts live in one place and relationships are modeled separately.
7. Added indexes on common access paths to keep joins and filtered task queries efficient.
