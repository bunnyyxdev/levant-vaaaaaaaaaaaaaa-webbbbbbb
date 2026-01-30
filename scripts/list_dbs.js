const mongoose = require('mongoose');
const uri = 'mongodb+srv://sugarbunnystores_db_user:Ryyoq9WDILhd4rvn@cluster0.3tivyqi.mongodb.net/?retryWrites=true&w=majority';

async function listDBs() {
    try {
        await mongoose.connect(uri);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases:', dbs.databases.map(db => db.name));
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
listDBs();
