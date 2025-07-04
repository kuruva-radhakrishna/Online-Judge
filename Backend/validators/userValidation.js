// User validation logic
function validateUser(user) {
    if (!user.firstname || user.firstname.trim().length < 2) return 'First name must be at least 2 characters.';
    if (!user.lastname || user.lastname.trim().length < 2) return 'Last name must be at least 2 characters.';
    if (!user.email || !/^\S+@\S+\.\S+$/.test(user.email)) return 'A valid email is required.';
    if (!user.password || user.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
}

module.exports = { validateUser }; 