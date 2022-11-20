require('dotenv').config();
const { 
    NODE_ENV, 
    DB_HOST_DEV,
    DB_USER_DEV,
    DB_PASS_DEV,
    DB_NAME_DEV,
    DB_HOST_PRO,
    DB_USER_PRO,
    DB_PASS_PRO,
    DB_NAME_PRO
} = process.env;
  
let HOST, USER, PASS, DB;
  
if (NODE_ENV === 'production') {
    HOST    = DB_HOST_PRO
    USER    = DB_USER_PRO
    PASS    = DB_PASS_PRO  
    DB      = DB_NAME_PRO
} else {
    HOST    = DB_HOST_DEV
    USER    = DB_USER_DEV
    PASS    = DB_PASS_DEV
    DB      = DB_NAME_DEV
}

module.exports = {
    multipleStatements  : true,
    host                : HOST,
    user                : USER,
    password            : PASS,
    database            : DB
};