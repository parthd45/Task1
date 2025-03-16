document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('staffId', document.getElementById('staffId').value);
    formData.append('department', document.getElementById('department').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('profilePic', document.getElementById('profilePic').files[0]);
    formData.append('feedback', document.getElementById('feedback').value);

    try {
        const response = await fetch('http://localhost:5500/register', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('registerResult').innerText = data.message;
            setTimeout(() => window.location.href = "index.html", 1000);
        } else {
            document.getElementById('registerResult').innerText = data.message || 'Failed to register!';
        }
    } catch (err) {
        console.error('Error:', err);
        document.getElementById('registerResult').innerText = 'Registration failed!';
    }
});
