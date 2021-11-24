const inquirer = require('inquirer')
const mysql = require('mysql2');
require('dotenv').config();
const { printTable } = require('console-table-printer');

const viewAllEmployees = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department , role.salary, CONCAT (manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id;`

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: process.env.DB_USER,
      // TODO: Add MySQL password here
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    console.log(`Connected to the database.`)
  );

const askAgain = () => {
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'again',
            message: `Would you like to continue?`,
            choices: [`Yes`, `No`]
        }
    ])
        .then(({again}) => {
            if (again === `Yes`) {
                userPrompt();
            } else {
                process.exit();
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
                        `View All Employees By Department`,
                        `View All Employees By Manager`,
                        `Add Employee`,
                        `Remove Employee`,
                        `Update Employee role`,
                        `Update Employee Manager`,
                        `Add Department`,
                        `Add Role`
                    ]}
    ])
        .then(({userSelect}) => {
            if (userSelect === `View All Employees`){
                viewEmployees();
            }
        })
    
}

viewEmployees = () => {
    db.query(viewAllEmployees, (err, rows) => {
        printTable(rows);
        askAgain();
        });
}


userPrompt();
