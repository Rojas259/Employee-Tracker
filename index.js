const inquirer = require('inquirer');
const mysql = require('mysql2')


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'tracker_db'
})

const introText = [{
    type: 'text',
    name: 'intro',
    message: `
    Welcome to the Employee Tracker!
    Please select an option from the menu below.

    `,
}]

const menu = [
    {
        type: "list",
        name: "menu",
        message: "What would you like to do?",
        choices: ["View all departments", "View all roles", "View all employees", new inquirer.Separator(), "Add a department", "Add a role", "Add an employee", "Update an employee role", new inquirer.Separator(),]
    },
]

function promptMenu() {
    inquirer
    .prompt(menu)
        .then((response) => {
            switch (response.menu) {
                case "View all departments":
                    allDepartmentsQuery();
                    break;

                case "View all roles":
                    allRolesQuery();
                    break;
                case "View all employees":
                    allEmployeesQuery();
                    break;
                case "Add a department":
                    addDepartmentQuery()
                    break;
                case "Add a role":
                    addRoleQuery()
                    break;
                case "Add an employee":
                    addEmployeeQuery()
                    break;
                case "Update an employee role":
                    updateEmployeeQuery()
                    break;
            }
        });
};

function updateEmployeeQuery() {
    // This gets a list of employees from the employee table to be used in the prompt questions.
    const employeeListSql = "SELECT CONCAT(first_name, ' ', last_name) AS employee_name FROM employee";

    connection.query(employeeListSql, (error, employeeList) => {
        if (error) {
            console.log("Error retreiving employee list: ", error);
            promptMenu();
        } else {
            const employeeChoices = employeeList.map((employee) => employee.employee_name);
            // This creates a list of available roles from the role table. 
            const roleOptionsSql = 'SELECT title FROM role';

            connection.query(roleOptionsSql, (error, roleResults) => {
                if (error) {
                    console.log("Error loading role options: ", error);
                    promptMenu();
                } else {
                    const roleChoices = roleResults.map((role) => role.title);
                    // These are the questions for the update employee prompts. 
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
                            // This is the SQL for updating the employee with the values input by our user. 
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
                                    }

                                    );
                                }
                            });
                        });

                }
            })

        }
    })
}



function addEmployeeQuery() {

    // Creates a list of roles to select when adding an employee
    const roleOptionsSql = "SELECT title FROM role";

    connection.query(roleOptionsSql, (error, roleResults) => {
        if (error) {
            console.log("Error retreiving roles: ", error);
            promptMenu();
        } else {
            const roleChoices = roleResults.map((role) => role.title);

            // Creates a list of managers to chosse for the new employee, or null. 
            const managerOptionsSql = 'SELECT CONCAT(first_name, " ", last_name) AS manager_name FROM employee';

            connection.query(managerOptionsSql, (error, managerResults) => {
                if (error) {
                    console.log("Error retreiving manager options: ", error);
                    promptMenu();
                } else {
                    const managerChoices = managerResults.map((manager) => manager.manager_name);

                    managerChoices.push('null');
                    // These are the questions it asks for making a new employee. 
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
// SQL for creating a new employee with the input given by the user. 
                            const insertEmployeeSql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";

                            selectRoleIdSql = "SELECT id FROM role WHERE title = ?";

                            // This gets role Id based on the role name. 
                            connection.query(selectRoleIdSql, [response.employee_role], (error, roleResults) => {
                                if (error) {
                                    console.log("Error retieving role ID:", error);
                                    promptMenu();
                                } else {
                                    // This checks to make sure we retreived the Id from the role
                                    const roleId = roleResults[0] ? roleResults[0].id : null;

                                    if (roleId !== null) {

                                        if (response.employee_manager !== 'null') {
                                            selectManagerIdSql = 'SELECT id FROM employee WHERE CONCAT(first_name, " ", last_name) = ?';
                                            // This will retreive the manager_id based on manager last name.
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

    const departmentOptionsSql = 'SELECT name FROM department';

    connection.query(departmentOptionsSql, (error, departmentResults) => {
        if (error) {
            console.log("Error loading department options: ", error);
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
                        type: "number",
                        message: "Role salary?",
                    },
                    {
                        name: "role_department",
                        type: "list",
                        message: "Select Department:",
                        choices: departmentChoices,
                    },
                ])
                .then((response) => {
                    const insertRoleSql = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
                    const selectDepartmentIdSql = 'SELECT id FROM department WHERE name = ?';
                    // This gets department ID based on the department name. 
                    connection.query(selectDepartmentIdSql, [response.role_department], (error, departmentResults) => {
                        if (error) {
                            console.log("Error retieving department ID:", error);
                            promptMenu();
                        } else {
                            // This checks to make sure we retreived the Id from the department
                            const departmentId = departmentResults[0] ? departmentResults[0].id : null;

                            if (departmentId !== null) {
                                // This is the SQL for the adding of a new role. 

                                connection.query(insertRoleSql, [response.role_title, response.role_salary, departmentId], (error, results) => {
                                    if (error) {
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
                    });

                });


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
            // This is the SQL for adding a new department. 
            const insertDepartmentSql = 'INSERT INTO department (name) VALUES (?)';

            connection.query(insertDepartmentSql, [response.department_name], (error, results) => {
                if (error) {
                    console.log("Error inserting into db: ", error);
                } else {
                    console.log("Added department: ", response.department_name);

                }

                promptMenu();
            })
        })
}


function allDepartmentsQuery() {
    // This SQL query selects all departments and displays them in a table. 

    connection.query('SELECT id AS Department_ID, name AS Department_Name FROM department;', (error, results) => {
        if (error) {
            console.log("Error getting query: ", error);
        } else {
            console.log("View All Departments:");
            console.table(results)
        }

        promptMenu();
    })
}

function allRolesQuery() {
    // This SQL query selects all roles and displays them in a table. 
    inquirer
    connection.query('SELECT role.title AS Role_Title, role.id AS Role_ID, department.name AS Department_Name, role.salary AS Salary FROM role JOIN department ON role.department_id = department.id;', (error, results) => {
        if (error) {
            console.log("Error getting query: ", error);
        } else {
            console.log("View All Roles:")
            console.table(results);
        }

        promptMenu();
    })
}

function allEmployeesQuery() {
    // This SQL query selects all employees and their department, manager, and salary, and displays them in a table. It uses aliases to seperate the managers and make the complex query more organized. We use left join to take the name data from the previous column to display their manager. 
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
        .then();
    promptMenu();


}



init();