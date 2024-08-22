import { select,input } from '@inquirer/prompts';
import { spawn } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import {validateURL} from './validateURL.js'


type aliasType =
{
    name:string,
    uri:string
}

let aliases = [];

try {
    const fileContent = fs.readFileSync('./dbdata.json', 'utf-8');
    aliases = JSON.parse(fileContent);
} catch (err) {
    console.error(chalk.red(`Error reading or parsing JSON file: ${err.message}`));
}

const initOptions = [
    {
        name: "connect to an alias",
        value: 1
    },
    {
        name: "add new alias",
        value: 2
    }
];

async function connectToDB() {
    try {
        const options = aliases.map((alias) => ({
            name: alias.name,
            value: alias.uri
        }));

        const answer = await select({
            message: "Select the alias to login",
            choices: options
        });

        const uri = answer;
        console.log(chalk.bgGreen('Connecting with mysqlsh...'));
        console.log(chalk.bgBlue('Use \\sql to switch to SQL syntax...'));

        const mysqlshProcess = spawn('mysqlsh', [`--uri`, `${uri}`], { stdio: 'inherit' });

        mysqlshProcess.on('close', (code) => { 
            console.log(chalk.bgYellowBright(`[mysqlsh] terminated with code ${code}`)); 
        });

        mysqlshProcess.on('error', (err) => {
            console.error(chalk.red(`Error spawning mysqlsh process: ${err.message}`));
        });

    } catch (err) {
        console.error(chalk.red(`Error in connectToDB function: ${err.message}`));
    }
}


async function addNewAlias(aliases:Array<aliasType>)
{
    const newAliasName = await input({message:"Enter Alias Name:"});
    console.log("new alias name:", newAliasName)

    for(let alias of aliases)
    {
        if(alias.name === newAliasName)
        {
            console.log(chalk.red("alias already exists!!!"));
            addNewAlias(aliases);
            return;
        }
    }

    const newURI = await input({message:"Enter uri for alias:"});

    let urlValidationResponse = validateURL(newURI);
    if(urlValidationResponse.success)
    {
        aliases.push({name:newAliasName,uri:newURI});
    
        fs.writeFileSync("./dbdata.json",JSON.stringify(aliases));
    
        console.log(chalk.green("Added new alias successfully"));
    }    
    else{
        console.log(chalk.red("alias addition failed:"),urlValidationResponse.message);
    }





}
async function main() {
    try {
        const option = await select({
            message: "What's on your mind?",
            choices: initOptions
        });

        switch (option) {
            case 1:
                connectToDB();
                break;
            case 2:
                addNewAlias(aliases);
                break;
                default:
                console.log(chalk.yellow('No valid option selected.'));
                break;
        }
    } catch (error) {
        console.error(chalk.red(`Error in main function: ${error.message}`));
    }
}

main();
