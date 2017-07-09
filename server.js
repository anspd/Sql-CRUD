var express= require('express')
var mysql= require('mysql')
var bodyParser= require('body-parser')
var validator = require('email-validator')
var port=process.env.PORT || 3000

var app= express()
app.use(bodyParser.urlencoded({extended:true}))


/*to connect to the database which is hosted on db4free.net*/
var con=mysql.createConnection({
    host:'db4free.net',
    user:'anspd',
    password:'asdf1234',
    database:'crudapp'
})

/*every time the server runs, table "credentials" is deleted and is again created.
  could have used "IF NOT EXISTS" instead but why have unnecessary data in the table*/

con.connect(function(err) {
    if(err) throw err
    var sql = "DROP TABLE credentials";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table deleted");
  });
    console.log("Connected!")
    var sql= "CREATE TABLE credentials (id INT AUTO_INCREMENT PRIMARY KEY, firstName VARCHAR(255) NOT NULL, lastName VARCHAR(255) NOT NULL, dob DATE NOT NULL, email TEXT NOT NULL, pwd TEXT NOT NULL)"
    con.query(sql,function(err,result) {
        if(err) throw err
        console.log("Table created")
    })
})

//server starts
app.listen(port,()=> {
    console.log("server active")
})

/*CREATE a Row
    Use postman to send a post request
    automatically validates if the email entered is correct
    enter a valid date as the dob is DATE type
*/

app.post('/users',(req,res)=> {
    if(validator.validate(req.body.email)){
        sql="INSERT INTO credentials SET firstName=?, lastName=?, dob=?, email=?, pwd=?"
        var value = [req.body.firstName, req.body.lastName, req.body.dob, req.body.email, req.body.pwd]
        con.query(sql,value, (err,result) => {
            if(err) throw err
            console.log("1 record inserted: "+result)
        })
        res.end()
    }  
    else {
        console.log("Wrong Email")
        res.end()
    }        
  
})

/*Read all the rows in the table
    send a get request using postman
*/
app.get('/users', (req,res) => {
    con.query("SELECT * FROM credentials", (err,result) => {
        if(err) throw err
        console.log(result)
        res.end()
    })
})

/* Delete a row using email as the query
    send a delete req using post
    key: email
*/

app.delete('/users', (req,res) => {
    var sql= "DELETE FROM credentials WHERE email=?"
    con.query(sql,[req.body.email], (err,result)=> {
        if(err) throw err
        console.log("Deleted one record")
    })
    res.end()
})

/*Update a row using email as the query
    to update only the email and password
    send put request using postman 
    key for old email used as query: old_email
    key for new email: new_email
    key for new password: new_pwd
*/
app.put('/users', (req,res) => {
    var sql= "UPDATE credentials SET email=?, pwd=? WHERE email=?"
    value=[req.body.new_email, req.body.new_pwd, req.body.old_email]
    con.query(sql,value, (err,result)=> {
        if(err) throw err
        console.log("Updated one record:" + result)
    })
    res.end()
})
