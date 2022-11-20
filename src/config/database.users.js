require('dotenv').config();
const { 
    NODE_ENV, 
    DB_HOST_APPS_DEV,
    DB_USER_APPS_DEV,
    DB_PASS_APPS_DEV,
    DB_NAME_APPS_DEV,
    DB_HOST_APPS_PRO,
    DB_USER_APPS_PRO,
    DB_PASS_APPS_PRO,
    DB_NAME_APPS_PRO
} = process.env;
  
let HOST, USER, PASS, DB;
  
if (NODE_ENV === 'production') {
    HOST    = DB_HOST_APPS_PRO
    USER    = DB_USER_APPS_PRO
    PASS    = DB_PASS_APPS_PRO  
    DB      = DB_NAME_APPS_PRO
} else {
    HOST    = DB_HOST_APPS_DEV
    USER    = DB_USER_APPS_DEV
    PASS    = DB_PASS_APPS_DEV
    DB      = DB_NAME_APPS_DEV
}

module.exports = {
    multipleStatements  : true,
    host                : HOST,
    user                : USER,
    password            : PASS,
    database            : DB
};