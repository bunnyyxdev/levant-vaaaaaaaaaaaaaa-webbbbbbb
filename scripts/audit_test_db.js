const mongoose = require('mongoose');
const uri = 'mongodb+srv://sugarbunnystores_db_user:Ryyoq9WDILhd4rvn@cluster0.3tivyqi.mongodb.net/test?retryWrites=true&w=majority';

async function listCollections() {
    try {
        await mongoose.connect(uri);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in test:', collections.map(c => c.name));
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`${col.name}: ${count}`);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
listCollections();
