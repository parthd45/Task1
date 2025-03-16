document.getElementById('verifyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const staffId = document.getElementById('staffId').value.trim();
    const resultDiv = document.getElementById('result');

    if (!staffId) {
        resultDiv.innerHTML = `<p class="text-yellow-600 font-semibold mt-4">⚠️ Please enter your Staff ID.</p>`;
        return;
    }

    // Show loading spinner
    resultDiv.innerHTML = `
        <div class="flex justify-center items-center mb-4">
            <svg class="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span class="ml-2 text-blue-500 font-semibold">Verifying...</span>
        </div>
    `;

    try {
        const response = await fetch('http://localhost:5500/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ staffId })
        });

        const data = await response.json();

        // Smooth delay for a clean transition
        setTimeout(() => {
            if (response.status === 200 && data.status === '✅ verified') {
                resultDiv.innerHTML = `
                    <div class="flex flex-col items-center p-6 border border-green-500 bg-green-100 rounded-lg shadow-lg transition-all duration-500 w-80 mx-auto">
                        <img src="http://localhost:5500${data.data.profile_pic}" 
                            alt="Profile Picture" class="w-32 h-32 rounded-full border border-gray-300 shadow-md mb-4 hover:scale-105 transition">
                        <h3 class="text-green-700 font-bold text-xl mb-2">✅ Verification Successful!</h3>
                        <p class="text-gray-700"><strong>Name:</strong> ${data.data.name}</p>
                        <p class="text-gray-700"><strong>Department:</strong> ${data.data.department}</p>
                        <p class="text-gray-700"><strong>Staff ID:</strong> ${data.data.staff_id}</p>
                        <p class="text-gray-700"><strong>Email:</strong> ${data.data.email}</p>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="p-4 border border-red-500 bg-red-100 rounded-lg shadow-md transition-all duration-500 w-80 mx-auto">
                        <p class="text-red-600 font-semibold text-center">❌ ${data.error}</p>
                    </div>
                `;
            }
        }, 1000);
    } catch (error) {
        console.error('❌ Error:', error);
        resultDiv.innerHTML = `
            <div class="p-4 border border-red-500 bg-red-100 rounded-lg shadow-md transition-all duration-500 w-80 mx-auto">
                <p class="text-red-600 font-semibold text-center">❌ Failed to verify. Please try again later.</p>
            </div>
        `;
    }
});
