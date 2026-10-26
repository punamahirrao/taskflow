-- TaskFlow: project roles - consolidated data script (SQLite)
-- Run AFTER `python manage.py migrate` (creates the tables and copies old owners/members).
-- Close the app and any other DB tool first, and back up db.sqlite3.
-- Safe to run more than once.

BEGIN;

-- 1. Roles table (the migration already seeds it; this is a no-op if present)
INSERT OR IGNORE INTO projects_projectrole (role_name) VALUES
  ('owner'), ('admin'), ('member'), ('viewer');

-- 2. Only the site administrator keeps is_staff (jon was promoted by mistake)
UPDATE accounts_user SET is_staff = 0 WHERE email = 'jon@jonson.com';

-- 3. Test roles on project 4 "My New Project" (owner: jon, id 7)
INSERT INTO projects_projectmembership (project_id, user_id, role_id, created_at)
VALUES
  (4, 6, (SELECT id FROM projects_projectrole WHERE role_name = 'admin'),  strftime('%Y-%m-%d %H:%M:%f', 'now')),
  (4, 9, (SELECT id FROM projects_projectrole WHERE role_name = 'member'), strftime('%Y-%m-%d %H:%M:%f', 'now')),
  (4, 8, (SELECT id FROM projects_projectrole WHERE role_name = 'viewer'), strftime('%Y-%m-%d %H:%M:%f', 'now'))
ON CONFLICT (project_id, user_id) DO UPDATE SET role_id = excluded.role_id;

COMMIT;

-- 4. Verify: who has which role on which project
SELECT p.id AS project_id, p.name AS project, u.id AS user_id, u.email, r.role_name AS role
FROM projects_projectmembership m
JOIN projects_project p     ON p.id = m.project_id
JOIN accounts_user u        ON u.id = m.user_id
JOIN projects_projectrole r ON r.id = m.role_id
ORDER BY p.id, r.id;

-- 5. Health checks (all should return no rows)
SELECT p.id, p.name FROM projects_project p
WHERE (SELECT COUNT(*) FROM projects_projectmembership m
       JOIN projects_projectrole r ON r.id = m.role_id
       WHERE m.project_id = p.id AND r.role_name = 'owner') <> 1;

SELECT m.* FROM projects_projectmembership m
JOIN accounts_user u ON u.id = m.user_id WHERE u.is_active = 0;
