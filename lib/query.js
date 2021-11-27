const { printTable } = require('console-table-printer');
const mysql = require('mysql2');
const inquirer = require('inquirer')

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    console.log(`Connected to the database.`)
  );

viewAllEmployees = () => 
db.promise().query(`SELECT employee.id,
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
});

viewEmpByDept = () => 
db.promise().query(`SELECT department.name AS department,
CONCAT (employee.first_name, " ", employee.last_name) as employee
FROM employee 
LEFT JOIN roles ON employee.role_id = roles.id 
LEFT JOIN department ON roles.department_id = department.id
ORDER by department DESC`)
.then( ([rows,fields]) => {
    printTable(rows);
});

viewEmpByMgr = () => 
db.promise().query(`SELECT CONCAT (manager.first_name, " ", manager.last_name) AS manager,
CONCAT (employee.first_name, " ", employee.last_name) as employee,
                      department.name AS department
               FROM employee 
               LEFT JOIN roles ON employee.role_id = roles.id 
               LEFT JOIN department ON roles.department_id = department.id
               LEFT JOIN employee manager ON employee.manager_id = manager.id
               ORDER by manager DESC;`)
.then( ([rows,fields]) => {
    printTable(rows);
});

addEmp = () => new Promise((resolve,reject) => {
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
                console.log('Please enter a first name');
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
                console.log('Please enter a last name');
                return false;
            }
    }},
])
.then((answer) => {
    const employee = [answer.firstName, answer.lastName]

        db.promise().query(`SELECT roles.id, roles.title FROM roles`)
        .then( ([rows,fields]) => {
            const options = rows.map(({ id, title }) => ({ name: title, value: id }));
            inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: `What is the employee's role?`,
                    choices: options
                }
            ])
            .then(answer => {
                employee.push(answer.role);
                console.log(employee)
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
                        console.log(employee)
                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ? ,?)`, employee, (err, result) => {
                            if (err) {throw err}
                        })
                    })
                });
            })
        });
    }), (err, res) => {
    if (err) {
        return reject(err)
    }else{
        console.log(res)
        return resolve(res)
    }

}});

module.exports = {viewAllEmployees, viewEmpByDept, viewEmpByMgr, addEmp};

