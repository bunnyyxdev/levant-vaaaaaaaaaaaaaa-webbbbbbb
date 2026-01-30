const mongoose = require('mongoose');
const uri = 'mongodb+srv://sugarbunnystores_db_user:Ryyoq9WDILhd4rvn@cluster0.3tivyqi.mongodb.net/levant_virtual?retryWrites=true&w=majority';

async function auditRecent() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const collections = ['flights', 'pireps', 'pilots', 'bids'];
        
        for (const colName of collections) {
            console.log(`\n--- Recent items in ${colName} ---`);
            const items = await mongoose.connection.db.collection(colName)
                .find({})
                .sort({ _id: -1 }) // Newest first by ID
                .limit(5)
                .toArray();

            items.forEach(item => {
                console.log(`ID: ${item._id} | Status: ${item.approved_status ?? item.status} | Info: ${item.flight_number || item.pilot_id || item._id}`);
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
auditRecent();
