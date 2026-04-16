const fs = require('fs');
let file = fs.readFileSync('controllers/userController.js', 'utf8');

file = file.replace(/let { username, email, phone, password } = req\.body;/, 'let { fullName, email, phone, password } = req.body;');

file = file.replace(/const user = await User\.create\({\s+username,\s+email,\s+phone,\s+password\s+}\);/g, 
`const verificationToken = crypto.randomBytes(32).toString('hex');
		const user = await User.create({
			fullName,
			email,
			phone,
			password,
			verificationToken
		});`);

file = file.replace(/const token = generateToken\(user\._id\);\s+res\.status\(201\)\.json\({\s+_id: user\._id,\s+username: user\.username,\s+email: user\.email,\s+phone: user\.phone,\s+role: user\.role,\s+token,\s+message: 'Registration successful'\s+}\);/,
`try {
			await sendVerificationEmail(user.email, verificationToken);
		} catch (emailError) {
			console.log(emailError);
		}

		res.status(201).json({
			message: 'Registration successful! Please check your email to verify your account.'
		});`);

file = file.replace(/if \(user && \(await user\.matchPassword\(password\)\)\) {\s+\/\/ \*\*STORE LOGIN DATA IN DATABASE\*\*/,
`if (user && (await user.matchPassword(password))) {
			if (!user.isVerified) {
				return res.status(401).json({ message: 'Please verify your email before logging in.' });
			}
			// **STORE LOGIN DATA IN DATABASE**`);
			
file = file.replace(/_id: user\._id,\s+username: user\.username,/, '_id: user._id,\n\t\t\t\tfullName: user.fullName,');

file = file.replace(/user\.username = req\.body\.username \|\| user\.username;/, 'user.fullName = req.body.fullName || user.fullName;');

file = file.replace(/username: updatedUser\.username,/, 'fullName: updatedUser.fullName,');

fs.writeFileSync('controllers/userController.js', file);
console.log("FIXED!");
