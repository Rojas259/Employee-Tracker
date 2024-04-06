INSERT INTO
    department (id, name)
VALUES (1, "Sales"),
    (2, "Engineering"),
    (3, "Finance"),
    (4, "Legal");

INSERT INTO
    role (id, title, salary, department_id)
VALUES (1, "Sales Lead", 100000, 1),
    (2, "Salesperson", 80000, 1),
    (3, "Lead Engineer", 150000, 2),
    (4, "Software Engineer", 120000, 2),
    (5, "Account Manager", 160000, 3),
    (6, "Accountant", 125000, 3),
    (7, "Legal Team Lead", 250000, 4),
    (8, "Lawyer", 190000, 4);

INSERT INTO
    employee (
        first_name, last_name, role_id, manager_id
    )
VALUES ("Tammy", "Dill", 1, null),
    ("Jim", "Tobow", 2, 1),
    ("Tin", "Johnson", 3, null),
    ("John", "Thumbson", 4, 3),
    ("Brit", "Drang", 5, null),
    ("Josh", "DoomHammer", 6, 5),
    ("Mordy", "Teguy", 7, null),
    ("Rick", "Derwik", 8, 7);