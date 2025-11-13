const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		// Log the full error and stack to make debugging easier
		console.error('MongoDB connection error:');
		console.error(error && error.stack ? error.stack : error);

		// If DB_STRICT is explicitly set to 'false', do not exit the process.
		// This is useful for frontend-only development where a running server
		// is helpful even if the database isn't available. Default behavior
		// remains to exit on DB connection failure.
		if (process.env.DB_STRICT === 'false') {
			console.warn('DB_STRICT=false in env — continuing without DB connection.');
			return;
		}

		process.exit(1);
	}
};

module.exports = connectDB;
