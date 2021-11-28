const inquirer = require('inquirer')
require('colors');
require('dotenv').config();
var figlet = require('figlet');
const { printTable } = require('console-table-printer');
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    console.log(`Connected to the database.`.black.bgGreen)
);

init = () => {
    figlet.text('Employee Management System', {
        font: 'Calvin S',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 120,
        whitespaceBreak: true
        }, function(err, data) {
            if (err) {
                console.log('Something went wrong...'.black.bgRed);
                console.dir(err);
                return;
            }
            console.log('');
            console.log(data.brightBlue);
            userPrompt();
        })
    }

const askAgain = () => {
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'again',
            message: `Would you like to continue?`,
            choices: [`Yes`, `No`]
    }])   
        .then(({again}) => {
            if (again === `Yes`) {
                console.clear();
                userPrompt();
            } else {
                exit();
            }
        })
}

const userPrompt =  () => {
     inquirer
    .prompt([
        {
            type: 'list',
            name: 'userSelect',
            message: `What would you like to do?`,
            choices: [  `View All Employees`,
                        `Add Employee`,
                        `Remove Employee`,
                        `Update Employee role`,
                        `Update Employee Manager`,
                        `View All Employees By Department`,
                        `View All Department`,
                        `Add Department`,
                        `Remove Department`,
                        `View All Role`,
                        `Add Role`,
                        `Remove Role`,
                        `View All Employees By Manager`,
                        `View Total Utilized Budget By Department`,
                        `EXIT`,
                    ]}
    ])
        .then(({userSelect}) => {
            if (userSelect === `View All Employees`){
            viewAllEmployees()
            }
            if (userSelect === `View All Employees By Department`){
            viewEmpByDept()
            }
            if (userSelect === `View All Employees By Manager`){
            viewEmpByMgr()
            }
            if (userSelect === `Add Employee`){
            addEmp();
            }
            if (userSelect === `Remove Employee`){
            removeEmp();
            }
            if (userSelect === `Update Employee role`){
            updateEmp();
            }
            if (userSelect === `Update Employee Manager`){
            updateEmpMgr();
            }
            if (userSelect === `Add Department`){
            addDept();
            }
            if (userSelect === `Remove Department`){
            removeDept();
            }
            if (userSelect === `Add Role`){
            addRole();
            }
            if (userSelect === `Remove Role`){
            removeRole();
            }
            if (userSelect === `View All Department`){
            viewDept();
            }
            if (userSelect === `View All Role`){
            viewRoles();
            } 
            if (userSelect === `View Total Utilized Budget By Department`){
            viewBudget();
            } 
            if (userSelect === `EXIT`){
            exit();
            } 

        }) 
}

viewAllEmployees = () => 
db.promise().query(
    `SELECT employee.id,
    CONCAT (employee.first_name, " ", employee.last_name) AS employee,
    roles.title,
    department.name AS department ,
    roles.salary,
    CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee
    LEFT JOIN roles ON employee.role_id = roles.id
    LEFT JOIN department ON roles.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id;`)
.then( ([rows,fields]) => {
    printTable(rows);
    askAgain();
});

viewEmpByDept = () => 
db.promise().query(
    `SELECT department.name AS department,
    CONCAT (employee.first_name, " ", employee.last_name) as employee
    FROM employee 
    LEFT JOIN roles ON employee.role_id = roles.id 
    LEFT JOIN department ON roles.department_id = department.id
    ORDER by department DESC`)
.then( ([rows,fields]) => {
    printTable(rows);
    askAgain();
});

viewEmpByMgr = () => 
db.promise().query(
    `SELECT CONCAT (manager.first_name, " ", manager.last_name) AS manager,
    CONCAT (employee.first_name, " ", employee.last_name) as employee,
    department.name AS department
    FROM employee 
    LEFT JOIN roles ON employee.role_id = roles.id 
    LEFT JOIN department ON roles.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id
    ORDER by manager DESC;`)
.then( ([rows,fields]) => {
    printTable(rows);
    askAgain();
});

addEmp = () => {
inquirer
.prompt([
    {
        type: 'input',
        name: 'firstName',
        message: `Enter first name: `,
        validate: checkFirst => {
            if (checkFirst) {
                return true;
            } else {
                console.log('Please enter a first name'.red);
                return false;
            }
    }},
    {
        type: 'input',
        name: 'lastName',
        message: `Enter last name: `,
        validate: checkLast => {
            if (checkLast) {
                return true;
            } else {
                console.log('Please enter a last name'.red);
                return false;
            }
    }},
])
.then((answer) => {
    const employee = [answer.firstName, answer.lastName]

    db.promise().query(`SELECT roles.id, roles.title FROM roles`)
    .then( ([rows,fields]) => {
        const roles = rows.map(({ id, title }) => ({ name: title, value: id }));
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'role',
                message: `What is the employee's role?`,
                choices: roles
            }
        ])
        .then(answer => {
            employee.push(answer.role);
            db.promise().query(`SELECT * FROM employee`)
            .then( ([rows,fields]) => {
                const managers = rows.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: `Who is the employee's manager?`,
                        choices: managers
                    }
                ])
                .then(answer => {
                    employee.push(answer.manager);
                    console.log("Employee has been added!".black.bgGreen)
                    askAgain();
                    db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ? ,?)`, employee, (err, result) => {
                        if (err) {throw err}
                    })
                })
            });
        })
    });
})};

removeEmp = () => {
    db.query(`SELECT * FROM employee`, (err, data) => {
        if (err) throw err; 

    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

        inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: "Which employee would you like to delete?",
            choices: employees
        }
        ])
        .then(answer => {
            const employee = answer.name;

            db.query(`DELETE FROM employee WHERE id = ?`, employee, (err, result) => {
            if (err) throw err;
            console.log("Successfully Deleted!".black.bgGreen);
            
            askAgain();
        });
    });
    });
};

updateEmp = () => {
    db.query(`SELECT * FROM employee`, (err, data) => {
        if (err) throw err; 
    
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
    
        inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: "Which employee would you like to update?",
            choices: employees
        }
        ])
        .then(answer => {
            db.query(`SELECT * FROM roles`, (err, data) =>{
                if (err) throw err;
                const employee = answer.name;
                const roles = data.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: `What is the employee's new role?`,
                        choices: roles
                    }
                ])
                .then(answer => {
                    const role = answer.role;
                    const arr = [role,employee];
                    db.query(`UPDATE employee SET role_id = ? WHERE id = ?`, arr, (err, result) => {
                        if (err) throw err;
                        console.log("Employee has been updated!".black.bgGreen);
                        askAgain();
                    })
                })
            })
        });
    });
}

updateEmpMgr = () => {
    db.query(`SELECT * FROM employee`, (err, data) => {
        if (err) throw err; 
    
    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
    
        inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: "Which employee would you like to update?",
            choices: employees
        }
        ])
        .then(answer => {
                const arr = [];
                const employee = answer.name;
                arr.push(employee);
                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: `Who is the employee's new manager?`,
                        choices: managers
                    }
                ])
                .then(answer => {
                    const manager = answer.manager;
                    arr.unshift(manager);
                    db.query(`UPDATE employee SET manager_id = ? WHERE id = ?`, arr, (err, result) => {
                        if (err) throw err;
                        console.log("Employee has been updated!".black.bgGreen);
                        askAgain();
                    })
                })
            
        });
    });
}

addDept = () => {

    inquirer
    .prompt([
        {
            type: 'input',
            name: 'department',
            message: `Enter new department: `
        }
    ])
    .then(answer => {
        db.query(`INSERT INTO department (name) VALUES (?)`,answer.department, (err, result) => {
            if (err) throw err;
            console.log("Department has been added!".black.bgGreen);
            askAgain();
        })
    })
}

addRole = () => {

    inquirer
    .prompt([
        {
            type: 'input',
            name: 'role',
            message: `Enter new role: `
        }
    ])
    .then(answer => {
        let arr = [answer.role]

        db.query(`SELECT * FROM department`, (err,data) => {
            if (err) throw err;

            const departments = data.map (({ name, id }) => ({ name: name, value: id }));

            inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: "Which department is this role in?",
                choices: departments
            }
            ])
            .then(answer => {
                arr.push(answer.name);

                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'salary',
                        message: "What is the salary for this role?",
                    }
                ])
                .then(answer => {
                    arr.push(answer.salary);
                    db.query(`INSERT INTO roles (title, department_id, salary) VALUES (?, ?, ?)`, arr, (err,result) => {
                        if (err) throw err;
                        console.log("Role has been added!".black.bgGreen);
                        askAgain();
                    })
                })
            })
        })
    })
}

removeDept = () => {
    db.query(`SELECT * FROM department`, (err, data) => {
        if (err) throw err; 

    const department = data.map(({ id, name }) => ({ name: name , value: id }));

        inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: "Which department would you like to delete?",
            choices: department
        }
        ])
        .then(answer => {
            db.query(`DELETE FROM department WHERE id = ?`, answer.name, (err, result) => {
            if (err) throw err;
            console.log("Successfully Deleted!".black.bgGreen);
            
            askAgain();
        });
    });
    });
};

removeRole = () => {
    db.query(`SELECT * FROM roles`, (err, data) => {
        if (err) throw err; 

    const role = data.map(({ id, title }) => ({ name: title , value: id }));

        inquirer.prompt([
        {
            type: 'list',
            name: 'name',
            message: "Which role would you like to delete?",
            choices: role
        }
        ])
        .then(answer => {
            db.query(`DELETE FROM roles WHERE id = ?`, answer.name, (err, result) => {
            if (err) throw err;
            console.log("Successfully Deleted!".black.bgGreen);
            
            askAgain();
        });
    });
    });
};

viewDept = () => {
    db.query(`SELECT department.name AS department FROM department`, (err, data) => {
        if (err) throw err;
        printTable(data);
        askAgain();
    })
}

viewRoles = () => {
    db.query(`SELECT roles.title,
        roles.salary,
        department.name AS department
        FROM roles LEFT JOIN department ON roles.department_id = department.id;`, (err, data) => {
        if (err) throw err;
        printTable(data);
        askAgain();
    })
}

viewBudget = () => {
    db.query(`SELECT department.name AS department,
    SUM(roles.salary) as budget
    FROM department
    LEFT JOIN roles ON department_id = department.id
    GROUP BY department.id;`, (err, data) => {
        if (err) throw err;
        printTable(data);
        askAgain();
    })
}

exit = () => {
    figlet.text('carlsantiago @ GitHub', {
        font: 'Mini',
        horizontalLayout: 'Fitted',
        verticalLayout: 'Fitted',
        width: 80,
        whitespaceBreak: true
    }, function(err, data) {
        if (err) {
            console.log('Something went wrong...'.black.bgRed);
            console.dir(err);
            return;
        }
        console.log('');
        console.log(data.brightBlue);
        process.exit();
    })
}

init()