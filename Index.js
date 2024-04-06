const inquirer = require('inquirer');
const mysql2 = require('mysql2');

const connection = mysql2.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'employee_tracker_db',
});

const introText = [{
    type: 'text',
    name: 'intro',
    message: 'Welcome to the Employee Tracker! Press any key to continue.',
}]
function promptMenu() {
    inquirer
    .prompt(menu)
    .then((response) => {
            switch (response.menu) {
                case 'View All Departments':
                    viewDepartmentsQuery();
                    break;
                case 'View All Roles':
                    viewRolesQuery();
                    break;
                case 'View All Employees':
                    viewEmployeesQuery();
                    break;
                case 'Add Department':  
                    addDepartmentQuery();
                    break;
                case 'Add Role':
                    addRoleQuery();
                    break;
                case 'Add Employee':
                    addEmployeeQuery();
                    break;
                case 'Update Employee Role':
                    updateEmployeeRoleQuery();
                    break;
            }
        });
}
function updateEmployeeRoleQuery() {
    const employeeListSql = "SELECT CONCAT(first_name, ' ', last_name) AS employee_name FROM employee";
    connection.query(employeeListSql, (error, employeeList) => {
        if (error) {
            console.log("Error retreiving employee list: ", error);
            promptMenu();
        } else {
            const employeeChoices = employeeList.map((employee) => employee.employee_name);
            const roleOptionsSql = 'SELECT title FROM role';
            connection.query(roleOptionsSql, (error, roleResults) => {
                if (error) {
                    console.log("Error loading role options: ", error);
                    promptMenu();
                } else {
                    const roleChoices = roleResults.map((role) => role.title);
                    inquirer
                        .prompt([
                            {
                                name: "employee",
                                type: "list",
                                message: "Select the employee to update: ",
                                choices: employeeChoices,
                            },
                            {
                                name: "new_role",
                                type: "list",
                                message: "Select a new role: ",
                                choices: roleChoices,
                            }
                        ])
                        .then((response) => {
                            const updateEmployeeRoleSql = "UPDATE employee SET role_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?";
                            const roleIdSql = "SELECT id FROM role WHERE title = ?";
                            connection.query(roleIdSql, [response.new_role], (error, roleIdResults) => {
                                if (error) {
                                    console.log("Error retreiving role ID: ", error);
                                    promptMenu();
                                } else {
                                    const roleId = roleIdResults[0] ? roleIdResults[0].id : null;
                                    connection.query(updateEmployeeRoleSql, [roleId, response.employee], (error, results) => {
                                        if (error) {
                                            console.log("Error updating employee role: ", error);
                                        } else {
                                            console.log("Updated employee role for:", response.employee);
                                        }
                                        promptMenu();
                                    });
                                }
                            });
                        });
                }
            });
        }
    });
}
function addEmployeeQuery() {
    const roleOptionsSql = "SELECT title FROM role";
    connection.query(roleOptionsSql, (error, roleResults) => {
        if (error) {
            console.log("Error retreiving roles: ", error);
            promptMenu();
        } else {
            const roleChoices = roleResults.map((role) => role.title);
            const managerOptionsSql = 'SELECT CONCAT(first_name, " ", last_name) AS manager_name FROM employee';
            connection.query(managerOptionsSql, (error, managerResults) => {
                if (error) {
                    console.log("Error retreiving manager options: ", error);
                    promptMenu();
                } else {
                    const managerChoices = managerResults.map((manager) => manager.manager_name);
                    managerChoices.push('null');
                    inquirer
                        .prompt([
                            {
                                name: "employee_firstName",
                                type: "input",
                                message: "Employee first name?",
                            },
                            {
                                name: "employee_lastName",
                                type: "input",
                                message: "Employee last name?",
                            },
                            {
                                name: "employee_role",
                                type: "list",
                                message: "Select role: ",
                                choices: roleChoices
                            },
                            {
                                name: "employee_manager",
                                type: "list",
                                message: "Select Manager: ",
                                choices: managerChoices,
                            },
                        ])
                        .then((response) => {
                            const insertEmployeeSql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                            selectRoleIdSql = "SELECT id FROM role WHERE title = ?";
                            connection.query(selectRoleIdSql, [response.employee_role], (error, roleResults) => {
                                if (error) {
                                    console.log("Error retieving role ID:", error);
                                    promptMenu();
                                } else {
                                    const roleId = roleResults[0] ? roleResults[0].id : null;
                                    if (roleId !== null) {
                                        if (response.employee_manager !== 'null') {
                                            selectManagerIdSql = 'SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = ?';
                                            connection.query(selectManagerIdSql, [response.employee_manager], (error, managerResults) => {
                                                if (error) {
                                                    console.log("Error retrieving manager ID: ", error);
                                                    promptMenu();
                                                } else {
                                                    const managerId = managerResults[0] ? managerResults[0].id : null;
                                                    if (managerId !== null) {
                                                        connection.query(
                                                            insertEmployeeSql, [response.employee_firstName, response.employee_lastName, roleId, managerId], (error, results) => {
                                                                if (error) {
                                                                    console.log("Error inserting into db: ", error);
                                                                } else {
                                                                    console.log("Added employee: ", response.employee_firstName, response.employee_lastName);
                                                                }

                                                                promptMenu();
                                                            }
                                                        );
                                                    } else {
                                                        console.log("Manager not found. Employee not added.");
                                                        promptMenu();
                                                    }
                                                }
                                            });
                                        } else {
                                            connection.query(insertEmployeeSql, [response.employee_firstName, response.employee_lastName, roleId, null], (error, results) => {
                                                if (error) {
                                                    console.log("Error inserting into db: ", error);
                                                } else {
                                                    console.log("Added employee:", response.employee_firstName, response.employee_lastName);
                                                }

                                                promptMenu();
                                            })
                                        }
                                    } else {
                                        console.log("Role not found. Employee not added.");
                                        promptMenu();
                                    }
                                }
                            });
                        });
                }
            })
        }
    })
}
function addRoleQuery() {
    const departmentOptionsSql = "SELECT name FROM department";
    connection.query(departmentOptionsSql, (error, departmentResults) => {
        if ( error ) {
            console.log("Error retreiving departments: ", error);
            promptMenu();
        } else {
            const departmentChoices = departmentResults.map((department) => department.name);
            inquirer
                .prompt([
                    {
                        name: "role_title",
                        type: "input",
                        message: "Role title?",
                    },
                    {
                        name: "role_salary",
                        type: "input",
                        message: "Role salary?",
                    },
                    {
                        name: "role_department",
                        type: "list",
                        message: "Select department: ",
                        choices: departmentChoices,
                    },
                ])
                .then((response) => {
                    const insertRoleSql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
                    const selectDepartmentIdSql = 'SELECT id FROM department WHERE name = ?';
                    connection.query(selectDepartmentIdSql, [response.role_department], (error, departmentResults) => {
                        if ( error ) {
                            console.log("Error retreiving department ID: ", error);
                            promptMenu();
                        }else {
                            const departmentId = departmentResults[0] ? departmentResults[0].id : null;
                            if ( departmentId === null ) {
                                connection.query(insertRoleSql, [response.role_title, response.role_salary, departmentId], (error, results) => {
                                    if ( error ) {
                                        console.log("Error inserting into db: ", error);
                                    } else {
                                        console.log("Added role: ", response.role_title);
                                    }
                                    promptMenu();
                                })
                            } else {
                                console.log("Department not found. Role not added.");
                                promptMenu();
                            }
                        }
                })
            })
        }
    })
}
function addDepartmentQuery() {
    inquirer
        .prompt([
            {
                name: "department_name",
                type: "input",
                message: "Department name?",
            },
        ])
        .then((response) => {
            const insertDepartmentSql = 'INSERT INTO department (name) VALUES (?)';
            connection.query(insertDepartmentSql, [response.department_name], (error, results) => {
                if ( error ) {
                    console.log("Error inserting into db: ", error);
                } else {
                    console.log("Added department: ", response.department_name);
                }
                promptMenu();
            })
        })
}
function allDepartmentsQuery() {
    connection.query('SELECT id AS Department_ID, name AS Department_Name From department;', (error, results) => {
        if (error) {
            console.log("Error retreiving departments: ", error);
        } else {
            console.log("View All Departments:");
            console.table(results);
        }
        promptMenu();
    })
}
function viewRolesQuery() {
    connection.query('SELECT id AS Role_ID, title AS Role_Title, salary AS Salary, department_id AS Department_ID FROM role;', (error, results) => {
        if (error) {
            console.log("Error retreiving roles: ", error);
        } else {
            console.log("View All Roles:");
            console.table(results);
        }
        promptMenu();
    })
}
function viewDepartmentsQuery() {
    connection.query('SELECT id AS Department_ID, name AS Department_Name From department;', (error, results) => {
        if ( error ) {
            console.log("Error retreiving departments: ", error);
        } else {
            console.log("View All Departments:");
            console.table(results);
        }
        promptMenu();
    })
}
function viewEmployeesQuery() {
    connection.query('SELECT e.id AS Employee_ID, e.first_name AS First_Name, e.last_name AS Last_Name, r.title AS Job_Title, d.name AS Department_Name, r.salary AS Salary, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;', (error, results) => {
        if (error) {
            console.log("Error getting query: ", error);
        } else {
            console.log("View All Employees:")
            console.table(results);
        }

        promptMenu();
    })
}
function init() {
    inquirer
        .prompt(introText)
        .then(() => {
            promptMenu();
        });
}
init();