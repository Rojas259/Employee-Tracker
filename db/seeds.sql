INSERT INTO department (id, name)
VALUES
    (1, 'Engineering'),
    (2, 'Sales'),
    (3, 'Finance'),
    (4, 'Legal');
INSERT INTO role (id, title, salary, department_id)
VALUES
    (1, 'Lead Engineer', 100000, 1),
    (2, 'Software Engineer', 80000, 1),
    (3, 'Sales Lead', 80000, 2),
    (4, 'Salesperson', 50000, 2),
    (5, 'Accountant', 70000, 3),
    (6, 'Legal Team Lead', 75000, 4),
    (7, 'Lawyer', 70000, 4);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
    (1, 'John', 'Doe', 1, NULL),
    (2, 'Mike', 'Chan', 2, 1),
    (3, 'Ashley', 'Rodriguez', 3, NULL),
    (4, 'Kevin', 'Tupik', 4, 3),
    (5, 'Kunal', 'Singh', 5, NULL),
    (6, 'Malia', 'Brown', 6, NULL),
    (7, 'Sarah', 'Lourd', 7, 6);