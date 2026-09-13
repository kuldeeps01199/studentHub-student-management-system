async function testSignup() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/register-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test5@test.com',
                password: 'password123',
                fullName: 'Test User',
                rollNumber: '12345',
                admissionNumber: '45645',
                course: '64e8b39a3f2b4a5d8c111111',
                semester: 'Semester 1'
            })
        });
        const data = await res.json();
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
testSignup();
