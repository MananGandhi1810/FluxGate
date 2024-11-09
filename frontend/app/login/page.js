import React from "react";

function App() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Welcome to Our App
                </h1>
                <p className="text-gray-600 mb-6">
                    Login with GitHub to continue
                </p>
                <a
                    href={`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user%20repo`}
                    className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-200"
                >
                    Login With GitHub
                </a>
            </div>
        </div>
    );
}

export default App;
