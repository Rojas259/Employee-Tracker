UPDATE Employees
SET ManagerID = new_manager_id
WHERE EmployeeID = employee_id;
SELECT *
FROM Employees
WHERE ManagerID = manager_id;
SELECT e.*
FROM Employees e
JOIN Roles r ON e.RoleID = r.RoleID
WHERE r.DepartmentID = department_id;
DELETE FROM Employees
WHERE RoleID = role_id;
DELETE FROM Roles
WHERE DepartmentID = department_id;
DELETE FROM Departments WHERE DepartmentID = department_id;
SELECT r.DepartmentID, d.DepartmentName, SUM(e.Salary) AS TotalBudget
FROM Employees e
JOIN Roles r ON e.RoleID = r.RoleID
JOIN Departments d ON r.DepartmentID = d.DepartmentID
WHERE r.DepartmentID = department_id
GROUP BY r.DepartmentID, d.DepartmentName;

