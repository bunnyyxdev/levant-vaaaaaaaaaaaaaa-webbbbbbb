const mongoose = require('mongoose');

const uri = 'mongodb+srv://sugarbunnystores_db_user:Ryyoq9WDILhd4rvn@cluster0.3tivyqi.mongodb.net/levant_virtual?retryWrites=true&w=majority';

async function restoreRejected() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Status 2 is Rejected
        const collections = ['flights', 'pireps'];
        let found = false;

        for (const colName of collections) {
            console.log(`Checking collection: ${colName}`);
            const rejectedItems = await mongoose.connection.db.collection(colName)
                .find({ approved_status: 2 })
                .sort({ submitted_at: -1 })
                .limit(1)
                .toArray();

            if (rejectedItems.length > 0) {
                const item = rejectedItems[0];
                console.log(`Found rejected item in ${colName}: ${item.flight_number || item.id} (${item.departure_icao} -> ${item.arrival_icao}) submitted at ${item.submitted_at}`);
                
                await mongoose.connection.db.collection(colName).updateOne(
                    { _id: item._id },
                    { $set: { approved_status: 0 } } // Reset to Pending
                );
                console.log(`Item in ${colName} restored to Pending status successfully.`);
                found = true;
                break;
            }
        }

        if (!found) {
            console.log('No recently rejected items found in flights or pireps.');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

restoreRejected();
