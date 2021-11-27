const inquirer = require('inquirer')
require('dotenv').config();
//figlet

const query = require ('./lib/query');


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
        .then(async ({userSelect}) => {
            if (userSelect === `View All Employees`){
                await viewAllEmployees()
                askAgain();
            }
            if (userSelect === `View All Employees By Department`){
                await viewEmpByDept()
                askAgain();
            }
            if (userSelect === `View All Employees By Manager`){
                await viewEmpByMgr()
                askAgain();
            }
            if (userSelect === `Add Employee`){
                await addEmp()

            }
        }) 
}

userPrompt();
