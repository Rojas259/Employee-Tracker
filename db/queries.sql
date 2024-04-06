-- All Departments
SELECT id AS Department_ID, name AS Department_Name
FROM department;

-- All Roles 
SELECT role.title AS Role_Title, role.id AS Role_ID, department.name AS Department_Name, role.salary AS Salary
FROM role
JOIN department ON role.department_id = department.id;

-- All Employees
SELECT e.id AS Employee_ID, e.first_name AS First_Name, e.last_name AS Last_Name, r.title AS Job_Title, d.name AS Department_Name, r.salary AS Salary, CONCAT(m.first_name, ' ', m.last_name) AS Manager 
FROM employee e
JOIN role r ON e.role_id = r.id 
JOIN department d ON r.department_id = d.id
LEFT JOIN employee m ON e.manager_id = m.id;