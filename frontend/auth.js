const API_URL = "http://localhost:5000/api";

/*
========================================
SHOW/HIDE REGISTER PASSWORDS
========================================
*/

const registerCheckbox =
document.getElementById(
    "showRegisterPassword"
);

if (registerCheckbox) {

    registerCheckbox.addEventListener(
        "change",
        () => {

            const password =
            document.getElementById(
                "password"
            );

            const confirmPassword =
            document.getElementById(
                "confirmPassword"
            );

            const type =
            registerCheckbox.checked
            ? "text"
            : "password";

            if(password){
                password.type = type;
            }

            if(confirmPassword){
                confirmPassword.type = type;
            }

        }
    );

}

/*
========================================
SHOW/HIDE LOGIN PASSWORD
========================================
*/

const loginCheckbox =
document.getElementById(
    "showLoginPassword"
);

if (loginCheckbox) {

    loginCheckbox.addEventListener(
        "change",
        () => {

            const password =
            document.getElementById(
                "password"
            );

            if(password){

                password.type =
                loginCheckbox.checked
                ? "text"
                : "password";

            }

        }
    );

}

/*
========================================
REGISTER
========================================
*/

const registerForm =
document.getElementById(
    "registerForm"
);

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const first_name =
            document.getElementById(
                "first_name"
            ).value.trim();

            const last_name =
            document.getElementById(
                "last_name"
            ).value.trim();

            const email =
            document.getElementById(
                "email"
            ).value.trim();

            const password =
            document.getElementById(
                "password"
            ).value;

            const confirmPassword =
            document.getElementById(
                "confirmPassword"
            ).value;

            /*
            ========================================
            PASSWORD VALIDATION
            ========================================
            */

            const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

            if (
                !passwordRegex.test(
                    password
                )
            ) {

                alert(
                    "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number."
                );

                return;
            }

            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;
            }

            try {

                const response =
                await fetch(
                    `${API_URL}/auth/register`,
                    {
                        method:"POST",
                        headers:{
                            "Content-Type":
                            "application/json"
                        },
                        body:JSON.stringify({
                            first_name,
                            last_name,
                            email,
                            password
                        })
                    }
                );

                const data =
                await response.json();

                alert(
                    data.message
                );

                if(response.ok){

                    window.location.href =
                    "login.html";

                }

            } catch(error){

                console.error(error);

                alert(
                    "Registration failed"
                );

            }

        }
    );

}

/*
========================================
LOGIN
========================================
*/

const loginForm =
document.getElementById(
    "loginForm"
);

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const email =
            document.getElementById(
                "email"
            ).value.trim();

            const password =
            document.getElementById(
                "password"
            ).value;

            try {

                const response =
                await fetch(
                    `${API_URL}/auth/login`,
                    {
                        method:"POST",
                        headers:{
                            "Content-Type":
                            "application/json"
                        },
                        body:JSON.stringify({
                            email,
                            password
                        })
                    }
                );

                const data =
                await response.json();

                if(!response.ok){

                    alert(
                        data.message ||
                        "Login failed"
                    );

                    return;

                }

                /*
                ====================================
                SAVE USER SESSION
                ====================================
                */

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );

                /*
                ====================================
                REDIRECT TO DASHBOARD
                ====================================
                */

                window.location.href =
                "dashboard.html";

            } catch(error){

                console.error(error);

                alert(
                    "Login failed"
                );

            }

        }
    );

}