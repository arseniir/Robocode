const fs = require('fs')
const dbFile = './chat.db'
const exists = fs.existsSync(dbFile)
const sqlite3 = require('sqlite3').verbose()
const dbWrapper = require('sqlite')
const crypto = require('crypto')
let db

dbWrapper.open({
    filename: dbFile,
    driver: sqlite3.Database
}).then(async dBase => {
    db = dBase
    try{
        if(!exists){
            await db.run(
                `create table user(
                    id integer primary key autoincrement,
                    login varchar(40) unique not null,
                    password text not null,
                    salt text
                )
                `
            )
            await db.run(
                `create table message(
                    id integer primary key autoincrement,
                    content text not null,
                    author_id integer not null,
                    foreign key(author_id) references user(id)
                )
                `
            )
        } else{
            console.log(await db.all('select * from user'))
        }
    } catch (error){
        console.error(error)
    }
})

module.exports = {
    getMessages: async () => {
        return await db.all(`
            select message.id as msg_id, author_id, content, login from message join user on message.author_id = user.id
                
        `)
    },
    addMessage: async (msg, userid)=> {
        try {
            await db.run(`
            insert into message (content, author_id) values (?, ?)`, [msg, userid])
        } catch(error) {
            console.log(error)
        }
    },
    isUserExist: async (login) =>{
        let person = await db.all(`select * from user where login = ?`, [login])
        return person.length
    },
    addUser: async(user) => {
        let salt = crypto.randomBytes(16).toString('hex')
        let password = crypto.pbkdf2Sync(user.password, salt, 1000, 100, 'sha512').toString('hex')
        // console.log()
        await db.run(
            `insert into user(login, password, salt) values(?, ?, ?)`,
            [user.login, password, salt]
        )
    },
    getAuthToken: async(user) => {
        let person = await db.all(`select * from user where login = ?`, [user.login])
        if (!person.length){
            throw 'Wrong login'
        }
        const {id, login, password, salt} = person[0]
        const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 100, 'sha512').toString('hex')
        if (hash != password){
            throw 'Wrong password'
        }
        return id + '.' + login + '.' + crypto.randomBytes(20).toString('hex')
    }
}